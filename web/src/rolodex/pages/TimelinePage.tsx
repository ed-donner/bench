import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { History } from "lucide-react";
import { useLocale, useT } from "../../shared/useLocale";
import { api } from "../api";
import type { TimelineEntry } from "../types";
import { Avatar } from "../components/Avatar";
import { EmptyState } from "../components/Modal";
import InteractionIcon from "../components/InteractionIcon";
import { errorMessage, fmtDate } from "../format";
import { interactionMeta, relativeDays, type RolodexT } from "../i18n";
import { useStore } from "../store";

function kindOptions(t: RolodexT) {
  return [
    { value: "all", label: t("timelineFilterAll") },
    { value: "interaction_call", label: t("timelineFilterCalls") },
    { value: "interaction_message", label: t("timelineFilterMessages") },
    { value: "interaction_email", label: t("timelineFilterEmails") },
    { value: "interaction_met", label: t("timelineFilterMeetings") },
    { value: "interaction_other", label: t("timelineFilterOther") },
    { value: "news", label: t("timelineFilterNews") },
    { value: "reminder_done", label: t("timelineFilterReminders") },
  ];
}

function entryIcon(e: TimelineEntry): React.ReactNode {
  if (e.kind === "interaction")
    return <InteractionIcon type={e.interaction_type} />;
  return <History size={15} />;
}

function entryCount(t: RolodexT, n: number) {
  const count =
    n === 1
      ? t.i("timelineEntryCount", { n })
      : t.i("timelineEntryCountPlural", { n });
  return `${count} ${t("timelineAcrossEveryone")}`;
}

function entryLabel(t: RolodexT, e: TimelineEntry): string {
  if (e.kind === "interaction" && e.interaction_type)
    return interactionMeta(t, e.interaction_type).verb;
  if (e.kind === "news") return t("entryNewsLabel");
  return t("entryReminderLabel");
}

export default function TimelinePage() {
  const t = useT("rolodex");
  const { locale } = useLocale();
  const { people, loaded } = useStore();
  const [personId, setPersonId] = useState<number | "">("");
  const [kind, setKind] = useState("all");
  const [entries, setEntries] = useState<TimelineEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const filters = kindOptions(t);

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
            {t("timelineTitle")}
          </h1>
          <p className="page-desc">
            {entries
              ? t.i("timelineDesc", { count: entryCount(t, entries.length) })
              : t("loading")}
          </p>
        </div>
        <div className="page-actions">
          <select
            className="filter-select"
            aria-label={t("personColumn")}
            value={personId}
            onChange={(e) =>
              setPersonId(e.target.value === "" ? "" : Number(e.target.value))
            }
          >
            <option value="">{t("everyone")}</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            aria-label={t("interactions")}
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            {filters.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        {error && <div className="empty">{error}</div>}
        {!error && entries === null && (
          <div className="empty">{t("loading")}</div>
        )}
        {!error && entries !== null && entries.length === 0 && (
          <EmptyState icon={<History />}>
            {loaded && people.length === 0
              ? t("timelineEmptyNoPeople")
              : t("timelineEmptyNoMatch")}
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
                      <span className="feed-type">{entryLabel(t, e)}</span>
                      <span className="feed-date">
                        {fmtDate(e.date, locale)} · {relativeDays(t, e.date)}
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
