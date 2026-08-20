import { useT } from "../../shared/useLocale";
import { filterBlockTypes } from "../i18n";

interface Props {
  query: string;
  selected: number;
  anchor: { left: number; top: number };
  onPick: (type: string) => void;
  onHover: (index: number) => void;
}

export default function SlashMenu({
  query,
  selected,
  anchor,
  onPick,
  onHover,
}: Props) {
  const t = useT("space");
  const ts = useT("shared");
  const items = filterBlockTypes(query, t);
  const top = Math.min(
    anchor.top + 6,
    window.innerHeight - Math.min(items.length, 8) * 40 - 20,
  );
  return (
    <div
      className="slash-menu"
      role="listbox"
      aria-label={t("blockTypes")}
      style={{ left: anchor.left, top }}
    >
      {items.length === 0 && (
        <div className="slash-empty">{ts("noResults")}</div>
      )}
      {items.map((item, i) => (
        <button
          key={item.type}
          role="option"
          aria-selected={i === selected}
          className={`slash-item${i === selected ? " selected" : ""}`}
          onMouseEnter={() => onHover(i)}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onPick(item.type)}
        >
          <span className="slash-icon">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}
