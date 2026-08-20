import { useCallback, useEffect, useState } from "react";
import {
  api,
  type DatabaseData,
  type Property,
  type PropertyOption,
  type PropertyType,
  type ViewConfig,
  type ViewKind,
} from "../api";
import { useT } from "../../shared/useLocale";
import { nextColor } from "./optionColors";
import TableView from "./TableView";
import BoardView from "./BoardView";
import ListView from "./ListView";
import Toolbar from "./Toolbar";
import { applyFilters, applySort } from "./viewLogic";

interface Props {
  databaseId: string;
}

export interface DbActions {
  addRow: () => Promise<void>;
  deleteRow: (rowId: string) => Promise<void>;
  setRowTitle: (rowId: string, title: string) => void;
  setValue: (rowId: string, propertyId: string, value: unknown) => void;
  addProperty: (name: string, type: PropertyType) => Promise<void>;
  renameProperty: (id: string, name: string) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  createOption: (propertyId: string, name: string) => Promise<PropertyOption>;
}

/** The same property with its options in the given order; ids come from the board itself. */
function reordered(property: Property, optionIds: string[]): Property {
  const byId = new Map(property.options.map((o) => [o.id, o]));
  return {
    ...property,
    options: optionIds.map((id) => byId.get(id)!),
  };
}

export default function DatabaseView({ databaseId }: Props) {
  const t = useT();
  // The loaded id travels with the data, so "still loading the next database" is derived during
  // render rather than reset by an effect, which would render twice on every navigation.
  const [loaded, setLoaded] = useState<{
    id: string;
    data: DatabaseData | null;
  }>({ id: "", data: null });
  const data = loaded.id === databaseId ? loaded.data : null;
  const setData = useCallback(
    (update: (d: DatabaseData | null) => DatabaseData | null) => {
      setLoaded((prev) => ({ ...prev, data: update(prev.data) }));
    },
    [],
  );
  const [kind, setKind] = useState<ViewKind>(() => {
    const saved = localStorage.getItem(`ps.view.${databaseId}`);
    return saved === "board" || saved === "list" ? saved : "table";
  });

  const changeKind = (next: ViewKind) => {
    setKind(next);
    localStorage.setItem(`ps.view.${databaseId}`, next);
  };

  useEffect(() => {
    void api
      .getDatabase(databaseId)
      .then((d) => setLoaded({ id: databaseId, data: d }));
  }, [databaseId]);

  const setValue = useCallback(
    (rowId: string, propertyId: string, value: unknown) => {
      setData((d) =>
        d
          ? {
              ...d,
              rows: d.rows.map((r) =>
                r.id === rowId
                  ? { ...r, values: { ...r.values, [propertyId]: value } }
                  : r,
              ),
            }
          : d,
      );
      void api.setRowValue(rowId, propertyId, value);
    },
    [setData],
  );

  /** Persist a new row order for the whole database, reordering optimistically first. */
  const reorderRows = useCallback(
    (orderedIds: string[]) => {
      setData((d) => {
        if (!d) return d;
        const byId = new Map(d.rows.map((r) => [r.id, r]));
        const rows = orderedIds.map((id) => byId.get(id)!).filter(Boolean);
        return { ...d, rows };
      });
      void api.reorderRows(databaseId, orderedIds);
    },
    [databaseId, setData],
  );

  /** Persist a new column order for the board, which is the order of the property's options. */
  const reorderOptions = useCallback(
    (propertyId: string, optionIds: string[]) => {
      setData((d) =>
        d
          ? {
              ...d,
              properties: d.properties.map((p) =>
                p.id === propertyId ? reordered(p, optionIds) : p,
              ),
            }
          : d,
      );
      void api.reorderOptions(propertyId, optionIds);
    },
    [setData],
  );

  const actions: DbActions = {
    addRow: async () => {
      const row = await api.addRow(databaseId);
      setData((d) => (d ? { ...d, rows: [...d.rows, row] } : d));
    },
    deleteRow: async (rowId) => {
      setData((d) =>
        d ? { ...d, rows: d.rows.filter((r) => r.id !== rowId) } : d,
      );
      await api.deletePage(rowId);
    },
    setRowTitle: (rowId, title) => {
      setData((d) =>
        d
          ? {
              ...d,
              rows: d.rows.map((r) => (r.id === rowId ? { ...r, title } : r)),
            }
          : d,
      );
      void api.updatePage(rowId, { title });
    },
    setValue,
    addProperty: async (name, type) => {
      const prop = await api.addProperty(databaseId, { name, type });
      setData((d) => (d ? { ...d, properties: [...d.properties, prop] } : d));
    },
    renameProperty: async (id, name) => {
      setData((d) =>
        d
          ? {
              ...d,
              properties: d.properties.map((p) =>
                p.id === id ? { ...p, name } : p,
              ),
            }
          : d,
      );
      await api.renameProperty(id, name);
    },
    deleteProperty: async (id) => {
      setData((d) =>
        d ? { ...d, properties: d.properties.filter((p) => p.id !== id) } : d,
      );
      await api.deleteProperty(id);
    },
    createOption: async (propertyId, name) => {
      const prop = data?.properties.find((p) => p.id === propertyId);
      const option = await api.addOption(propertyId, {
        name,
        color: nextColor(prop?.options ?? []),
      });
      setData((d) =>
        d
          ? {
              ...d,
              properties: d.properties.map((p) =>
                p.id === propertyId
                  ? { ...p, options: [...p.options, option] }
                  : p,
              ),
            }
          : d,
      );
      return option;
    },
  };

  const updateViewConfig = useCallback(
    (kind: ViewKind, patch: Partial<ViewConfig>) => {
      setData((d) =>
        d
          ? {
              ...d,
              views: { ...d.views, [kind]: { ...d.views[kind], ...patch } },
            }
          : d,
      );
      void api.updateView(databaseId, kind, patch);
    },
    [databaseId, setData],
  );

  if (!data) return <div className="db-loading" aria-busy="true" />;

  const config = data.views[kind];
  const rows = applySort(
    applyFilters(data.rows, config.filters, data.properties),
    config.sort,
    data.properties,
  );
  const selectProps = data.properties.filter((p) => p.type === "select");
  const groupProperty =
    data.properties.find(
      (p) => p.id === config.groupBy && p.type === "select",
    ) ??
    selectProps.at(0) ??
    null;
  const cardProperty = data.properties.find(
    (p) =>
      p.id !== groupProperty?.id &&
      (p.type === "select" || p.type === "multi_select"),
  );

  return (
    <div className="database-view">
      <Toolbar
        data={data}
        kind={kind}
        config={config}
        onKindChange={changeKind}
        onConfigChange={(patch) => updateViewConfig(kind, patch)}
      />
      {kind === "table" && (
        <TableView
          data={data}
          rows={rows}
          actions={actions}
          config={config}
          onConfigChange={(p) => updateViewConfig("table", p)}
        />
      )}
      {kind === "board" &&
        (groupProperty ? (
          <BoardView
            rows={rows}
            groupProperty={groupProperty}
            cardProperty={cardProperty}
            onMove={(rowId, optionId) =>
              setValue(rowId, groupProperty.id, optionId)
            }
            allRows={data.rows}
            onReorder={reorderRows}
            onReorderColumns={(optionIds) =>
              reorderOptions(groupProperty.id, optionIds)
            }
          />
        ) : (
          <div className="board-empty">
            {t("space.property.boardNeedSelect")}
          </div>
        ))}
      {kind === "list" && <ListView rows={rows} properties={data.properties} />}
    </div>
  );
}
