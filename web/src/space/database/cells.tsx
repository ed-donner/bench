import { valueText } from "./valueText";
import { useEffect, useRef, useState } from "react";
import { ExternalLink, Plus, X } from "lucide-react";
import { useT } from "../../shared/useLocale";
import type { Property, PropertyOption } from "../api";

export function Chip({
  option,
  onRemove,
}: {
  option: PropertyOption;
  onRemove?: () => void;
}) {
  const t = useT("space");
  return (
    <span className={`chip chip-${option.color}`}>
      {option.name}
      {onRemove && (
        <button
          className="chip-x"
          aria-label={t.i("removeOption", { name: option.name })}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X size={11} />
        </button>
      )}
    </span>
  );
}

interface CellProps {
  property: Property;
  value: unknown;
  rowLabel: string;
  onChange: (value: unknown) => void;
  onCreateOption?: (name: string) => Promise<PropertyOption>;
}

function TextLikeCell({
  property,
  value,
  rowLabel,
  onChange,
  kind,
}: CellProps & { kind: "text" | "url" | "number" }) {
  const t = useT("space");
  const [draft, setDraft] = useState(() => valueText(value));
  // Adjusting during render rather than in an effect: React re-runs this component immediately
  // instead of painting the stale draft first.
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setDraft(valueText(value));
  }
  const commit = () => {
    if (kind === "number") {
      const n = draft.trim() === "" ? null : Number(draft);
      onChange(n === null || Number.isNaN(n) ? null : n);
    } else {
      onChange(draft === "" ? null : draft);
    }
  };
  return (
    <span className="cell-input-wrap">
      <input
        className={`cell-input${kind === "number" ? " cell-number" : ""}`}
        aria-label={t.i("propertyForRow", {
          property: property.name,
          row: rowLabel,
        })}
        value={draft}
        inputMode={kind === "number" ? "decimal" : undefined}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
      />
      {kind === "url" && typeof value === "string" && value && (
        <a
          className="cell-link"
          href={value.startsWith("http") ? value : `https://${value}`}
          target="_blank"
          rel="noreferrer"
          aria-label={t.i("openLink", { url: value })}
        >
          <ExternalLink size={13} />
        </a>
      )}
    </span>
  );
}

function DateCell({ property, value, rowLabel, onChange }: CellProps) {
  const t = useT("space");
  return (
    <input
      type="date"
      className="cell-input cell-date"
      aria-label={t.i("propertyForRow", {
        property: property.name,
        row: rowLabel,
      })}
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value || null)}
    />
  );
}

function CheckboxCell({ property, value, rowLabel, onChange }: CellProps) {
  const t = useT("space");
  return (
    <input
      type="checkbox"
      className="b-checkbox cell-checkbox"
      aria-label={t.i("propertyForRow", {
        property: property.name,
        row: rowLabel,
      })}
      checked={Boolean(value)}
      onChange={(e) => onChange(e.target.checked)}
    />
  );
}

function OptionPicker({
  property,
  selected,
  onToggle,
  onCreateOption,
  onClose,
  multi,
}: {
  property: Property;
  selected: string[];
  onToggle: (optionId: string) => void;
  onCreateOption?: (name: string) => Promise<PropertyOption>;
  onClose: () => void;
  multi: boolean;
}) {
  const t = useT("space");
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => inputRef.current?.focus(), []);
  const matches = property.options.filter((o) =>
    o.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const canCreate =
    query.trim() !== "" &&
    !property.options.some(
      (o) => o.name.toLowerCase() === query.trim().toLowerCase(),
    );
  return (
    <div
      className="option-picker"
      role="dialog"
      aria-label={t.i("optionsFor", { property: property.name })}
    >
      <input
        ref={inputRef}
        className="option-search"
        placeholder={multi ? t("searchOrCreate") : t("selectOrCreate")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
          if (e.key !== "Enter") return;
          if (matches.length > 0) {
            onToggle(matches[0].id);
            if (!multi) onClose();
          } else if (canCreate && onCreateOption) {
            void onCreateOption(query.trim()).then((opt) => {
              onToggle(opt.id);
              setQuery("");
              if (!multi) onClose();
            });
          }
        }}
      />
      <div className="option-list">
        {matches.map((o) => (
          <button
            key={o.id}
            className={`option-row${selected.includes(o.id) ? " selected" : ""}`}
            onClick={() => {
              onToggle(o.id);
              if (!multi) onClose();
            }}
          >
            <Chip option={o} />
            {selected.includes(o.id) && <span className="option-tick">✓</span>}
          </button>
        ))}
        {canCreate && onCreateOption && (
          <button
            className="option-row option-create"
            onClick={() => {
              void onCreateOption(query.trim()).then((opt) => {
                onToggle(opt.id);
                setQuery("");
                if (!multi) onClose();
              });
            }}
          >
            <Plus size={13} /> {t.i("createOption", { name: query.trim() })}
          </button>
        )}
        {matches.length === 0 && !canCreate && (
          <div className="option-empty">{t("noOptions")}</div>
        )}
      </div>
    </div>
  );
}

function SelectCell({
  property,
  value,
  rowLabel,
  onChange,
  onCreateOption,
}: CellProps) {
  const t = useT("space");
  const [open, setOpen] = useState(false);
  const selected = property.options.find((o) => o.id === value);
  return (
    <div className="cell-select-wrap">
      <button
        className="cell-select"
        aria-label={t.i("propertyForRow", {
          property: property.name,
          row: rowLabel,
        })}
        onClick={() => setOpen((v) => !v)}
      >
        {selected ? (
          <Chip option={selected} />
        ) : (
          <span className="cell-empty">—</span>
        )}
      </button>
      {open && (
        <>
          <div
            role="presentation"
            className="menu-overlay"
            onMouseDown={() => setOpen(false)}
          />
          <OptionPicker
            property={property}
            selected={selected ? [selected.id] : []}
            multi={false}
            onToggle={(id) => onChange(id === value ? null : id)}
            onCreateOption={onCreateOption}
            onClose={() => setOpen(false)}
          />
        </>
      )}
    </div>
  );
}

function MultiSelectCell({
  property,
  value,
  rowLabel,
  onChange,
  onCreateOption,
}: CellProps) {
  const t = useT("space");
  const [open, setOpen] = useState(false);
  const ids = Array.isArray(value) ? (value as string[]) : [];
  const chosen = ids
    .map((id) => property.options.find((o) => o.id === id))
    .filter(Boolean) as PropertyOption[];
  const toggle = (id: string) => {
    onChange(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
  };
  return (
    <div className="cell-select-wrap">
      <button
        className="cell-select"
        aria-label={t.i("propertyForRow", {
          property: property.name,
          row: rowLabel,
        })}
        onClick={() => setOpen((v) => !v)}
      >
        {chosen.length > 0 ? (
          chosen.map((o) => <Chip key={o.id} option={o} />)
        ) : (
          <span className="cell-empty">—</span>
        )}
      </button>
      {open && (
        <>
          <div
            role="presentation"
            className="menu-overlay"
            onMouseDown={() => setOpen(false)}
          />
          <OptionPicker
            property={property}
            selected={ids}
            multi
            onToggle={toggle}
            onCreateOption={onCreateOption}
            onClose={() => setOpen(false)}
          />
        </>
      )}
    </div>
  );
}

export default function Cell(props: CellProps) {
  switch (props.property.type) {
    case "text":
      return <TextLikeCell {...props} kind="text" />;
    case "url":
      return <TextLikeCell {...props} kind="url" />;
    case "number":
      return <TextLikeCell {...props} kind="number" />;
    case "date":
      return <DateCell {...props} />;
    case "checkbox":
      return <CheckboxCell {...props} />;
    case "select":
      return <SelectCell {...props} />;
    case "multi_select":
      return <MultiSelectCell {...props} />;
    default:
      return null;
  }
}
