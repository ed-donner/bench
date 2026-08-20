import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { History } from "lucide-react";
import { api } from "../api";
import type { TimelineEntry } from "../types";
import { Avatar } from "../components/Avatar";
import { EmptyState } from "../components/Modal";
import InteractionIcon from "../components/InteractionIcon";
import {
  errorMessage,
  fmtDate,
  interactionVerb,
  relativeDays,
} from "../format";
import { useT } from "../../shared/useLocale";
import type { MessageKey, TranslateFn } from "../../shared/i18n";
import { useStore } from "../store";

const KIND_OPTIONS: { value: string; labelKey: MessageKey }[] = [
  { value: "all", labelKey: "rolodex.timeline.kind.all" },
  { value: "interaction_call", labelKey: "rolodex.timeline.kind.calls" },
  { value: "interaction_message", labelKey: "rolodex.timeline.kind.messages" },
  { value: "interaction_email", labelKey: "rolodex.timeline.kind.emails" },
  { value: "interaction_met", labelKey: "rolodex.timeline.kind.meetups" },
  {
    value: "interaction_other",
    labelKey: "rolodex.timeline.kind.otherContact",
  },
  { value: "news", labelKey: "rolodex.timeline.kind.news" },
  { value: "reminder_done", labelKey: "rolodex.timeline.kind.remindersDone" },
];

function entryIcon(e: TimelineEntry): React.ReactNode {
  if (e.kind === "interaction")
    return <InteractionIcon type={e.interaction_type} />;
  if (e.kind === "news") return <History size={15} />;
  return <History size={15} />;
}

function entryLabel(e: TimelineEntry, t: TranslateFn): string {
  if (e.kind === "interaction" && e.interaction_type)
    return interactionVerb(e.interaction_type, t);
  if (e.kind === "news") return t("rolodex.timeline.label.news");
  return t("rolodex.timeline.label.reminderDone");
}

export default function TimelinePage() {
  const t = useT();
  const { people, loaded } = useStore();
  const [personId, setPersonId] = useState<number | "">("");
  const [kind, setKind] = useState("all");
  const [entries, setEntries] = useState<TimelineEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .timeline(personId === "" ? null : personId, kind === "all" ? null : kind)
      .then(setEntries)
      .catch((e: unknown) => {
        setError(errorMessage(e));
      });
  }, [personId, kind]);

  const peopleById = useMemo(() => {
    const map = new Map<number, { name: string; photo: string | null }>();
    for (const p of people) map.set(p.id, { name: p.name, photo: p.photo });
    return map;
  }, [people]);

  const entryWord =
    entries?.length === 1
      ? t("rolodex.timeline.entry")
      : t("rolodex.timeline.entries");

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span
              className="icon-sq"
              style={{ background: "var(--slate-soft)", color: "var(--slate)" }}
            >
              <History size={19} />
            </span>
            {t("rolodex.timeline.title")}
          </h1>
          <p className="page-desc">
            {entries
              ? t("rolodex.timeline.subCount", {
                  count: entries.length,
                  entryWord,
                })
              : t("shared.common.loading")}
          </p>
        </div>
        <div className="page-actions">
          <select
            className="filter-select"
            aria-label={t("rolodex.timeline.filterPersonAria")}
            value={personId}
            onChange={(e) =>
              setPersonId(e.target.value === "" ? "" : Number(e.target.value))
            }
          >
            <option value="">{t("rolodex.timeline.everyone")}</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            aria-label={t("rolodex.timeline.filterActivityAria")}
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            {KIND_OPTIONS.map((k) => (
              <option key={k.value} value={k.value}>
                {t(k.labelKey)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        {error && <div className="empty">{error}</div>}
        {!error && entries === null && (
          <div className="empty">{t("shared.common.loading")}</div>
        )}
        {!error && entries !== null && entries.length === 0 && (
          <EmptyState icon={<History />}>
            {loaded && people.length === 0
              ? t("rolodex.timeline.emptyNoPeople")
              : t("rolodex.timeline.emptyFiltered")}
          </EmptyState>
        )}
        {entries && entries.length > 0 && (
          <div className="feed">
            {entries.map((e) => {
              const person = peopleById.get(e.person_id);
              return (
                <div key={e.id} className="feed-item">
                  <Avatar name={e.person_name} photo={person?.photo} />
                  <div
                    className="feed-icon"
                    style={{
                      background: "var(--surface-2)",
                      color: "var(--text-2)",
                    }}
                  >
                    {entryIcon(e)}
                  </div>
                  <div className="feed-body">
                    <div className="feed-top">
                      <Link
                        className="feed-person"
                        to={`/people/${e.person_id}`}
                      >
                        {e.person_name}
                      </Link>
                      <span className="feed-type">{entryLabel(e, t)}</span>
                      <span className="feed-date">
                        {fmtDate(e.date, undefined, t)} ·{" "}
                        {relativeDays(e.date, undefined, t)}
                      </span>
                    </div>
                    {e.text && <div className="feed-text">{e.text}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
