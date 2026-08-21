import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowUpRight, Plus, Trash2 } from "lucide-react";
import { useLocale } from "../../shared/useLocale";
import type {
  DatabaseData,
  DbRow,
  Property,
  PropertyType,
  ViewConfig,
} from "../api";
import Cell from "./cells";
import type { DbActions } from "./DatabaseView";

const PROPERTY_TYPES: PropertyType[] = [
  "text",
  "number",
  "select",
  "multi_select",
  "date",
  "checkbox",
  "url",
];

interface Props {
  data: DatabaseData;
  actions: DbActions;
  config: ViewConfig;
  onConfigChange: (patch: Partial<ViewConfig>) => void;
  rows?: DbRow[];
}

function AddPropertyPopover({
  onAdd,
  onClose,
}: {
  onAdd: (name: string, type: PropertyType) => void;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const [name, setName] = useState("");
  const [type, setType] = useState<PropertyType>("text");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => inputRef.current?.focus(), []);
  return (
    <div className="popover" role="dialog" aria-label={t("db.newProperty")}>
      <input
        ref={inputRef}
        className="popover-input"
        placeholder={t("db.propertyName")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && name.trim()) {
            onAdd(name.trim(), type);
            onClose();
          }
          if (e.key === "Escape") onClose();
        }}
      />
      <div className="popover-label">{t("db.typeLabel")}</div>
      <div className="type-list">
        {PROPERTY_TYPES.map((pt) => (
          <button
            key={pt}
            className={`type-row${pt === type ? " selected" : ""}`}
            onClick={() => setType(pt)}
          >
            {t(`propertyType.${pt}`)}
          </button>
        ))}
      </div>
      <button
        className="btn btn-primary popover-submit"
        disabled={!name.trim()}
        onClick={() => {
          onAdd(name.trim(), type);
          onClose();
        }}
      >
        {t("db.createProperty")}
      </button>
    </div>
  );
}

function ColumnMenu({
  property,
  actions,
  onClose,
}: {
  property: Property;
  actions: DbActions;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const [name, setName] = useState(property.name);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => inputRef.current?.select(), []);
  const commit = () => {
    if (name.trim() && name !== property.name)
      void actions.renameProperty(property.id, name.trim());
  };
  return (
    <div
      className="popover"
      role="dialog"
      aria-label={t("db.propertyDialog", { name: property.name })}
    >
      <input
        ref={inputRef}
        className="popover-input"
        aria-label={t("db.propertyNameLabel")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            commit();
            onClose();
          }
          if (e.key === "Escape") onClose();
        }}
      />
      <div className="popover-label">
        {t("db.typeFixed", { type: t(`propertyType.${property.type}`) })}
      </div>
      <button
        className="menu-item danger"
        onClick={() => {
          onClose();
          void actions.deleteProperty(property.id);
        }}
      >
        {t("db.deleteProperty")}
      </button>
    </div>
  );
}

export default function TableView({ data, actions, rows }: Props) {
  const { t } = useLocale();
  const navigate = useNavigate();
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const visibleRows = rows ?? data.rows;

  return (
    <div className="table-scroll">
      <table className="db-table">
        <thead>
          <tr>
            <th className="col-title">{t("common.name")}</th>
            {data.properties.map((p) => (
              <th key={p.id}>
                <div className="th-wrap">
                  <button
                    className="th-btn"
                    onClick={() => setMenuFor(menuFor === p.id ? null : p.id)}
                  >
                    {p.name}
                  </button>
                  {menuFor === p.id && (
                    <>
                      <div
                        role="presentation"
                        className="menu-overlay"
                        onMouseDown={() => setMenuFor(null)}
                      />
                      <ColumnMenu
                        property={p}
                        actions={actions}
                        onClose={() => setMenuFor(null)}
                      />
                    </>
                  )}
                </div>
              </th>
            ))}
            <th className="col-add">
              <div className="th-wrap">
                <button
                  className="th-btn add-prop"
                  aria-label={t("db.addProperty")}
                  onClick={() => setAdding((v) => !v)}
                >
                  <Plus size={15} />
                </button>
                {adding && (
                  <>
                    <div
                      role="presentation"
                      className="menu-overlay"
                      onMouseDown={() => setAdding(false)}
                    />
                    <AddPropertyPopover
                      onAdd={(name, type) =>
                        void actions.addProperty(name, type)
                      }
                      onClose={() => setAdding(false)}
                    />
                  </>
                )}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row) => {
            const rowTitle = row.title || t("common.untitled");
            return (
              <tr key={row.id}>
                <td className="col-title">
                  <div className="title-cell">
                    <input
                      className="cell-input cell-title"
                      aria-label={t("db.titleForRow", { title: rowTitle })}
                      value={row.title}
                      placeholder={t("common.untitled")}
                      onChange={(e) =>
                        actions.setRowTitle(row.id, e.target.value)
                      }
                    />
                    <span className="title-actions">
                      <button
                        className="row-open"
                        aria-label={t("db.openRow", { title: rowTitle })}
                        onClick={() => void navigate(`/p/${row.id}`)}
                      >
                        <ArrowUpRight size={13} />
                        {t("db.open")}
                      </button>
                      <button
                        className="row-delete"
                        aria-label={t("db.deleteRow", { title: rowTitle })}
                        onClick={() => void actions.deleteRow(row.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </span>
                  </div>
                </td>
                {data.properties.map((p) => (
                  <td key={p.id}>
                    <Cell
                      property={p}
                      value={row.values[p.id]}
                      rowLabel={rowTitle}
                      onChange={(v) => actions.setValue(row.id, p.id, v)}
                      onCreateOption={(name) =>
                        actions.createOption(p.id, name)
                      }
                    />
                  </td>
                ))}
                <td />
              </tr>
            );
          })}
          <tr>
            <td colSpan={data.properties.length + 2}>
              <button className="new-row" onClick={() => void actions.addRow()}>
                <Plus size={14} />
                {t("db.newRow")}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
