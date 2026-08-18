import { valueText } from "./valueText";
import { useState } from "react";
import { ArrowUpDown, Columns3, ListFilter, X } from "lucide-react";
import type {
  DatabaseData,
  Filter,
  Property,
  ViewConfig,
  ViewKind,
} from "../api";
import { operatorsFor, TITLE_ID } from "./viewLogic";
import { useTranslation } from "react-i18next";
import { translate } from "../../shared/i18n";

const VIEW_KINDS: ViewKind[] = ["table", "board", "list"];

interface Props {
  data: DatabaseData;
  kind: ViewKind;
  config: ViewConfig;
  onKindChange: (kind: ViewKind) => void;
  onConfigChange: (patch: Partial<ViewConfig>) => void;
}

function filterableProps(
  data: DatabaseData,
): { id: string; name: string; type: Property["type"] | "title" }[] {
  return [
    { id: TITLE_ID, name: translate("space:db.name"), type: "title" as const },
    ...data.properties.map((p) => ({ id: p.id, name: p.name, type: p.type })),
  ];
}

function FilterValueInput({
  filter,
  property,
  onChange,
}: {
  filter: Filter;
  property?: Property;
  onChange: (value: unknown) => void;
}) {
  const { t } = useTranslation("space");
  if (property?.type === "select" || property?.type === "multi_select") {
    return (
      <select
        className="filter-input"
        aria-label={t("view.filterValue")}
        value={(filter.value as string | undefined) ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">option…</option>
        {property.options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    );
  }
  if (property?.type === "date") {
    return (
      <input
        type="date"
        className="filter-input"
        aria-label={t("view.filterValue")}
        value={(filter.value as string | undefined) ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
      />
    );
  }
  if (property?.type === "number") {
    return (
      <input
        className="filter-input filter-number"
        aria-label={t("view.filterValue")}
        inputMode="decimal"
        value={valueText(filter.value)}
        onChange={(e) =>
          onChange(e.target.value === "" ? null : Number(e.target.value))
        }
      />
    );
  }
  return (
    <input
      className="filter-input"
      aria-label={t("view.filterValue")}
      placeholder={t("view.valuePlaceholder")}
      value={(filter.value as string | undefined) ?? ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

type PanelProps = Pick<Props, "data" | "config" | "onConfigChange">;

function FilterPanel({ data, config, onConfigChange }: PanelProps) {
  const { t } = useTranslation("space");
  const props = filterableProps(data);
  const setFilter = (i: number, patch: Partial<Filter>) => {
    const filters = config.filters.map((f, j) =>
      j === i ? { ...f, ...patch } : f,
    );
    onConfigChange({ filters });
  };
  return (
    <div
      className="popover filter-panel"
      role="dialog"
      aria-label={t("view.filters")}
    >
      {config.filters.length === 0 && (
        <div className="popover-label">{t("view.noFilters")}</div>
      )}
      {config.filters.map((f, i) => {
        const meta = props.find((p) => p.id === f.propertyId);
        const property = data.properties.find((p) => p.id === f.propertyId);
        const ops = operatorsFor(meta?.type ?? "text");
        const op = ops.find((o) => o.op === f.operator) ?? ops[0];
        return (
          <div className="filter-row" key={i}>
            <select
              className="filter-input"
              aria-label={t("view.filterProperty")}
              value={f.propertyId}
              onChange={(e) => {
                const next = props.find((p) => p.id === e.target.value)!;
                setFilter(i, {
                  propertyId: next.id,
                  operator: operatorsFor(next.type)[0].op,
                  value: null,
                });
              }}
            >
              {props.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <select
              className="filter-input"
              aria-label={t("view.filterOperator")}
              value={op.op}
              onChange={(e) => setFilter(i, { operator: e.target.value })}
            >
              {ops.map((o) => (
                <option key={o.op} value={o.op}>
                  {t(`operator.${o.op}`)}
                </option>
              ))}
            </select>
            {op.needsValue && (
              <FilterValueInput
                filter={f}
                property={property}
                onChange={(value) => setFilter(i, { value })}
              />
            )}
            <button
              className="icon-btn"
              aria-label={t("view.removeFilter")}
              onClick={() =>
                onConfigChange({
                  filters: config.filters.filter((_, j) => j !== i),
                })
              }
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
      <button
        className="btn btn-subtle"
        onClick={() =>
          onConfigChange({
            filters: [
              ...config.filters,
              { propertyId: TITLE_ID, operator: "contains", value: "" },
            ],
          })
        }
      >
        + Add filter
      </button>
    </div>
  );
}

function SortPanel({ data, config, onConfigChange }: PanelProps) {
  const { t } = useTranslation("space");
  const props = filterableProps(data);
  const sort = config.sort;
  return (
    <div
      className="popover sort-panel"
      role="dialog"
      aria-label={t("view.sort")}
    >
      <select
        className="filter-input"
        aria-label={t("view.sortProperty")}
        value={sort?.propertyId ?? ""}
        onChange={(e) =>
          onConfigChange({
            sort: e.target.value
              ? {
                  propertyId: e.target.value,
                  direction: sort?.direction ?? "asc",
                }
              : null,
          })
        }
      >
        <option value="">{t("view.noSort")}</option>
        {props.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      {sort && (
        <select
          className="filter-input"
          aria-label={t("view.sortDirection")}
          value={sort.direction}
          onChange={(e) =>
            onConfigChange({
              sort: { ...sort, direction: e.target.value as "asc" | "desc" },
            })
          }
        >
          <option value="asc">{t("view.ascending")}</option>
          <option value="desc">{t("view.descending")}</option>
        </select>
      )}
    </div>
  );
}

function GroupPanel({ data, config, onConfigChange }: PanelProps) {
  const { t } = useTranslation("space");
  const selects = data.properties.filter((p) => p.type === "select");
  return (
    <div
      className="popover group-panel"
      role="dialog"
      aria-label={t("view.groupBy")}
    >
      {selects.length === 0 && (
        <div className="popover-label">{t("view.needsSelect")}</div>
      )}
      {selects.map((p) => (
        <button
          key={p.id}
          className={`type-row${config.groupBy === p.id ? " selected" : ""}`}
          onClick={() => onConfigChange({ groupBy: p.id })}
        >
          {p.name}
        </button>
      ))}
    </div>
  );
}

export default function Toolbar({
  data,
  kind,
  config,
  onKindChange,
  onConfigChange,
}: Props) {
  const { t } = useTranslation("space");
  const [open, setOpen] = useState<"filter" | "sort" | "group" | null>(null);
  const toggle = (panel: "filter" | "sort" | "group") =>
    setOpen(open === panel ? null : panel);

  return (
    <div className="db-toolbar">
      <div className="view-tabs" role="tablist" aria-label={t("view.views")}>
        {VIEW_KINDS.map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={k === kind}
            className={`view-tab${k === kind ? " active" : ""}`}
            onClick={() => onKindChange(k)}
          >
            {t(`view.${k}`)}
          </button>
        ))}
      </div>
      <div className="toolbar-actions">
        {kind === "board" && (
          <span className="toolbar-wrap">
            <button
              className={`toolbar-btn${config.groupBy ? " engaged" : ""}`}
              onClick={() => toggle("group")}
            >
              <Columns3 size={14} />
              {t("view.group")}
            </button>
            {open === "group" && (
              <>
                <div
                  role="presentation"
                  className="menu-overlay"
                  onMouseDown={() => setOpen(null)}
                />
                <GroupPanel
                  data={data}
                  config={config}
                  onConfigChange={onConfigChange}
                />
              </>
            )}
          </span>
        )}
        <span className="toolbar-wrap">
          <button
            className={`toolbar-btn${config.filters.length > 0 ? " engaged" : ""}`}
            onClick={() => toggle("filter")}
          >
            <ListFilter size={14} />
            {t("view.filter")}
            {config.filters.length > 0 ? ` (${config.filters.length})` : ""}
          </button>
          {open === "filter" && (
            <>
              <div
                role="presentation"
                className="menu-overlay"
                onMouseDown={() => setOpen(null)}
              />
              <FilterPanel
                data={data}
                config={config}
                onConfigChange={onConfigChange}
              />
            </>
          )}
        </span>
        <span className="toolbar-wrap">
          <button
            className={`toolbar-btn${config.sort ? " engaged" : ""}`}
            onClick={() => toggle("sort")}
          >
            <ArrowUpDown size={14} />
            {t("view.sort")}
          </button>
          {open === "sort" && (
            <>
              <div
                role="presentation"
                className="menu-overlay"
                onMouseDown={() => setOpen(null)}
              />
              <SortPanel
                data={data}
                config={config}
                onConfigChange={onConfigChange}
              />
            </>
          )}
        </span>
      </div>
    </div>
  );
}
