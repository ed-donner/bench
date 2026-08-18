import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  CornerDownLeft,
  FileText,
  Database as DatabaseIcon,
  Rows3,
  Search,
} from "lucide-react";
import { api, type SearchResult } from "../api";
import { useTranslation } from "react-i18next";

interface Props {
  onClose: () => void;
}

function TypeBadge({ result }: { result: SearchResult }) {
  const { t } = useTranslation("space");
  if (result.type === "database")
    return <DatabaseIcon size={14} aria-label={t("search.database")} />;
  if (result.type === "row")
    return <Rows3 size={14} aria-label={t("search.databaseRow")} />;
  return <FileText size={14} aria-label={t("search.page")} />;
}

export default function SearchModal({ onClose }: Props) {
  const { t } = useTranslation("space");
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState(0);
  // Derived, so clearing the box empties the list without an effect resetting state. The last
  // results stay up while a new query is still debouncing, which is what they did before.
  const results = query.trim() ? found : [];
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => inputRef.current?.focus(), []);

  useEffect(() => {
    clearTimeout(timer.current);
    const q = query.trim();
    if (!q) return;
    timer.current = setTimeout(() => {
      void api.search(q).then((hits) => {
        setFound(hits);
        setSelected(0);
      });
    }, 120);
    return () => clearTimeout(timer.current);
  }, [query]);

  const open = (result: SearchResult) => {
    onClose();
    void navigate(`/p/${result.id}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowDown" && results.length > 0) {
      e.preventDefault();
      setSelected((s) => (s + 1) % results.length);
    }
    if (e.key === "ArrowUp" && results.length > 0) {
      e.preventDefault();
      setSelected((s) => (s - 1 + results.length) % results.length);
    }
    if (e.key === "Enter" && results[selected]) open(results[selected]);
  };

  return (
    <div
      role="presentation"
      className="overlay search-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="search-modal"
        role="dialog"
        aria-label={t("search.quickFind")}
      >
        <div className="search-input-row">
          <Search size={17} className="search-glyph" />
          <input
            ref={inputRef}
            className="search-input"
            placeholder={t("search.placeholder")}
            aria-label={t("action.search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <kbd className="search-kbd">esc</kbd>
        </div>
        {query.trim() && (
          <div
            className="search-results"
            role="listbox"
            aria-label={t("search.results")}
          >
            {results.map((r, i) => (
              <button
                key={r.id}
                role="option"
                aria-selected={i === selected}
                className={`search-result${i === selected ? " selected" : ""}`}
                onMouseEnter={() => setSelected(i)}
                onClick={() => open(r)}
              >
                <span className="search-icon">
                  {r.icon ?? <TypeBadge result={r} />}
                </span>
                <span className="search-title">{r.title || t("untitled")}</span>
                {r.parent_title && (
                  <span className="search-crumb">{r.parent_title}</span>
                )}
                {i === selected && (
                  <CornerDownLeft size={13} className="search-enter" />
                )}
              </button>
            ))}
            {results.length === 0 && (
              <div className="search-empty">
                No matches for “{query.trim()}”
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
