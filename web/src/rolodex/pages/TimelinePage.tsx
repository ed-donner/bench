import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { History } from "lucide-react";
import { useLocale } from "../../shared/useLocale";
import { api } from "../api";
import type { TimelineEntry } from "../types";
import { Avatar } from "../components/Avatar";
import { EmptyState } from "../components/Modal";
import InteractionIcon from "../components/InteractionIcon";
import {
  errorMessage,
  fmtDate,
  interactionMeta,
  relativeDays,
} from "../format";
import { useStore } from "../store";

function entryIcon(e: TimelineEntry): React.ReactNode {
  if (e.kind === "interaction")
    return <InteractionIcon type={e.interaction_type} />;
  if (e.kind === "news") return <History size={15} />;
  return <History size={15} />;
}

function entryLabel(
  t: ReturnType<typeof useLocale>["t"],
  e: TimelineEntry,
): string {
  if (e.kind === "interaction" && e.interaction_type)
    return interactionMeta(t, e.interaction_type).verb;
  if (e.kind === "news") return t("timeline.entryNews");
  return t("timeline.entryReminder");
}

export default function TimelinePage() {
  const { t } = useLocale();
  const { people, loaded } = useStore();
  const [personId, setPersonId] = useState<number | "">("");
  const [kind, setKind] = useState("all");
  const [entries, setEntries] = useState<TimelineEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const kindOptions = [
    { value: "all", label: t("timeline.filterAll") },
    { value: "interaction_call", label: t("timeline.filterCalls") },
    { value: "interaction_message", label: t("timeline.filterMessages") },
    { value: "interaction_email", label: t("timeline.filterEmails") },
    { value: "interaction_met", label: t("timeline.filterMeetups") },
    { value: "interaction_other", label: t("timeline.filterOther") },
    { value: "news", label: t("timeline.filterNews") },
    { value: "reminder_done", label: t("timeline.filterReminders") },
  ];

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

  const entryCountText =
    entries == null
      ? t("timeline.descLoading")
      : t("timeline.descCount", {
          count: entries.length,
          unit:
            entries.length === 1
              ? t("timeline.entryOne")
              : t("timeline.entryMany"),
        });

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
          <p className="page-desc">{entryCountText}</p>
        </div>
        <div className="page-actions">
          <select
            className="filter-select"
            aria-label={t("timeline.filterPerson")}
            value={personId}
            onChange={(e) =>
              setPersonId(e.target.value === "" ? "" : Number(e.target.value))
            }
          >
            <option value="">{t("timeline.filterEveryone")}</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            aria-label={t("timeline.filterActivity")}
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            {kindOptions.map((k) => (
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
          <div className="empty">{t("common.loading")}</div>
        )}
        {!error && entries !== null && entries.length === 0 && (
          <EmptyState icon={<History />}>
            {loaded && people.length === 0
              ? t("timeline.emptyNoPeople")
              : t("timeline.emptyNoMatch")}
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
                        {fmtDate(e.date)} · {relativeDays(t, e.date)}
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
