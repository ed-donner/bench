import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { History } from "lucide-react";
import { api } from "../api";
import type { TimelineEntry } from "../types";
import { Avatar } from "../components/Avatar";
import { EmptyState } from "../components/Modal";
import InteractionIcon from "../components/InteractionIcon";
import { errorMessage, fmtDate, relativeDays } from "../format";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { useStore } from "../store";

const KIND_OPTIONS = [
  { value: "all", key: "kindAll" },
  { value: "interaction_call", key: "kindCalls" },
  { value: "interaction_message", key: "kindMessages" },
  { value: "interaction_email", key: "kindEmails" },
  { value: "interaction_met", key: "kindMeetups" },
  { value: "interaction_other", key: "kindOther" },
  { value: "news", key: "kindNews" },
  { value: "reminder_done", key: "kindRemindersDone" },
];

function entryIcon(e: TimelineEntry): React.ReactNode {
  if (e.kind === "interaction")
    return <InteractionIcon type={e.interaction_type} />;
  if (e.kind === "news") return <History size={15} />;
  return <History size={15} />;
}

function entryLabel(e: TimelineEntry, t: TFunction): string {
  if (e.kind === "interaction" && e.interaction_type)
    return t(`interactionVerb.${e.interaction_type}`);
  if (e.kind === "news") return t("timeline.newsRecorded");
  return t("timeline.reminderCompleted");
}

export default function TimelinePage() {
  const { t } = useTranslation("rolodex");
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
            {t("timeline.title")}
          </h1>
          <p className="page-desc">
            {entries
              ? t("timeline.entries", { count: entries.length })
              : t("people.loading")}
          </p>
        </div>
        <div className="page-actions">
          <select
            className="filter-select"
            aria-label={t("timeline.person")}
            value={personId}
            onChange={(e) =>
              setPersonId(e.target.value === "" ? "" : Number(e.target.value))
            }
          >
            <option value="">{t("timeline.everyone")}</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            aria-label={t("timeline.activity")}
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            {KIND_OPTIONS.map((k) => (
              <option key={k.value} value={k.value}>
                {t(`timeline.${k.key}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        {error && <div className="empty">{error}</div>}
        {!error && entries === null && (
          <div className="empty">{t("people.loading")}</div>
        )}
        {!error && entries !== null && entries.length === 0 && (
          <EmptyState icon={<History />}>
            {loaded && people.length === 0
              ? t("timeline.noPeopleYet")
              : t("timeline.noMatch")}
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
                        {fmtDate(e.date)} · {relativeDays(e.date)}
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
