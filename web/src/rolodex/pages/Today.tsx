import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Bell,
  Cake,
  History,
  LayoutDashboard,
  Phone,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { api, type StatsPayload, type TodayPayload } from "../api";
import type { PersonComputed, TimelineEntry } from "../types";
import { Avatar } from "../components/Avatar";
import { EmptyState } from "../components/Modal";
import { LogInteractionModal } from "../components/LogInteractionModal";
import InteractionIcon from "../components/InteractionIcon";
import ContactHero from "../components/today/ContactHero";
import TodayCharts from "../components/today/TodayCharts";
import { dateTypeLabel } from "../dates";
import {
  dateLocale,
  errorMessage,
  fmtDate,
  monthShort,
  relativeDays,
} from "../format";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { useStore, useToast } from "../store";

/** What a timeline entry did, in words. */
function entryVerb(entry: TimelineEntry, t: TFunction): string {
  if (entry.kind === "news") return t("today.kind.news");
  if (entry.kind === "reminder_done") return t("today.kind.reminderDone");
  return entry.interaction_type
    ? t(`interactionVerb.${entry.interaction_type}`)
    : t("today.kind.contact");
}

export default function Today() {
  const { t } = useTranslation("rolodex");
  const { people, refresh } = useStore();
  const toast = useToast();
  const [payload, setPayload] = useState<TodayPayload | null>(null);
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [logging, setLogging] = useState<PersonComputed | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    () =>
      Promise.all([api.today(), api.stats()])
        .then(([t, s]) => {
          setPayload(t);
          setStats(s);
        })
        .catch((e: unknown) => {
          setError(errorMessage(e));
        }),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    void Promise.all([api.today(), api.stats()])
      .then(([t, s]) => {
        if (cancelled) return;
        setPayload(t);
        setStats(s);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(errorMessage(e));
      });
    return () => {
      cancelled = true;
    };
  }, [people.length]);

  const after = async () => {
    await Promise.all([load(), refresh()]);
  };

  if (error)
    return <div className="page">{t("today.loadFailed", { error })}</div>;
  if (!payload) return <div className="page muted">{t("people.loading")}</div>;

  const overdue = payload.to_contact.filter((p) => p.status === "overdue");
  const peopleById = new Map(people.map((p) => [p.id, p]));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span className="icon-sq amber">
              <LayoutDashboard size={19} />
            </span>
            {t("today.title")}
          </h1>
          <p className="page-desc">
            {t("today.desc", {
              date: format(new Date(), t("today.dateFormat"), {
                locale: dateLocale(),
              }),
            })}
          </p>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-num red">{overdue.length}</div>
          <div className="stat-label">
            <Phone size={13} /> {t("today.overdueToContact")}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-num amber">
            {payload.to_contact.length - overdue.length}
          </div>
          <div className="stat-label">
            <History size={13} /> {t("today.dueWithinWeek")}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-num purple">{payload.upcoming_dates.length}</div>
          <div className="stat-label">
            <Cake size={13} /> {t("today.datesIn30")}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-num blue">{payload.reminders.length}</div>
          <div className="stat-label">
            <Bell size={13} /> {t("today.remindersDue")}
          </div>
        </div>
      </div>

      <ContactHero
        payload={payload}
        peopleById={peopleById}
        onLog={setLogging}
      />

      <div className="today-grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Cake size={16} /> {t("today.datesComingUp")}
            </h2>
            <Link to="/calendar" className="small card-link">
              {t("today.calendarLink")}
            </Link>
          </div>
          {payload.upcoming_dates.length === 0 ? (
            <EmptyState icon={<Cake />}>{t("today.noDates")}</EmptyState>
          ) : (
            payload.upcoming_dates.slice(0, 7).map((e) => (
              <Link
                key={`${e.id}-${e.date}`}
                to={`/people/${e.person_id}`}
                className="upcoming-item"
              >
                <div className="date-pill">
                  <span className="mon">
                    {monthShort(Number(e.date.slice(5, 7)))}
                  </span>
                  <span className="day">{Number(e.date.slice(8, 10))}</span>
                </div>
                <Avatar
                  name={e.person_name}
                  photo={peopleById.get(e.person_id)?.photo}
                  size="sm"
                />
                <div className="grow">
                  <div className="strong">
                    {e.person_name}
                    {e.milestone && (
                      <span className="badge status-due_soon milestone">
                        {t("today.milestone", { age: e.age_turning })}
                      </span>
                    )}
                  </div>
                  <div className="small muted">
                    {dateTypeLabel(e.type, e.label)}
                    {e.age_turning != null && !e.milestone
                      ? t("today.turns", { age: e.age_turning })
                      : ""}
                  </div>
                </div>
                <span className="small muted">
                  {relativeDays(e.date, payload.today)}
                </span>
              </Link>
            ))
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Bell size={16} /> {t("today.remindersTitle")}
            </h2>
          </div>
          {payload.reminders.length === 0 ? (
            <EmptyState icon={<Bell />}>{t("today.noRemindersDue")}</EmptyState>
          ) : (
            payload.reminders.slice(0, 7).map((r) => (
              <div key={r.id} className="list-row">
                <button
                  className="reminder-check"
                  title={t("action.markDone")}
                  aria-label={t("action.markDoneOf", { text: r.text })}
                  onClick={() => {
                    void api
                      .setReminderDone(r.id, true)
                      .then(after)
                      .then(() => {
                        toast(t("today.reminderDone"));
                      });
                  }}
                />
                <div className="body">
                  <div className="strong">{r.text}</div>
                  <div className="small muted">
                    <Link to={`/people/${r.person_id}`}>{r.person_name}</Link> ·{" "}
                    {t("today.reminderLine", { date: fmtDate(r.due_date) })}
                    <span
                      className={r.overdue ? "reminder-overdue" : undefined}
                    >
                      {r.due_today
                        ? t("relative.today")
                        : relativeDays(r.due_date, payload.today)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <TodayCharts stats={stats} />

        <div className="card span2">
          <div className="card-header">
            <h2 className="card-title">
              <History size={16} /> {t("today.recent")}
            </h2>
            <Link to="/timeline" className="small card-link">
              {t("today.fullTimeline")}
            </Link>
          </div>
          {payload.recent.length === 0 ? (
            <EmptyState icon={<Sparkles />}>
              {t("today.nothingRecent")}
            </EmptyState>
          ) : (
            <div className="feed">
              {payload.recent.slice(0, 8).map((e) => (
                <div key={e.id} className="feed-item">
                  <Avatar
                    name={e.person_name}
                    photo={peopleById.get(e.person_id)?.photo}
                  />
                  <div className="feed-body">
                    <div className="feed-top">
                      <Link
                        className="feed-person"
                        to={`/people/${e.person_id}`}
                      >
                        {e.person_name}
                      </Link>
                      <span className="feed-type">{entryVerb(e, t)}</span>
                      <span className="feed-date">
                        {fmtDate(e.date)} ·{" "}
                        {relativeDays(e.date, payload.today)}
                      </span>
                    </div>
                    {e.text && <div className="feed-text">{e.text}</div>}
                  </div>
                  <div className="feed-icon kind-interaction">
                    <InteractionIcon type={e.interaction_type} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {logging && (
        <LogInteractionModal
          person={logging}
          onClose={() => setLogging(null)}
          onSaved={() => void after()}
        />
      )}
    </div>
  );
}
