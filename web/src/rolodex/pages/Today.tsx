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
  dateFnsLocale,
  errorMessage,
  fmtDate,
  interactionVerb,
  monthShort,
  relativeDays,
} from "../format";
import { useT } from "../../shared/useLocale";
import type { TranslateFn } from "../../shared/i18n";
import { useStore, useToast } from "../store";

/** What a timeline entry did, in words. */
function entryVerb(entry: TimelineEntry, t: TranslateFn): string {
  if (entry.kind === "news") return t("rolodex.today.entry.news");
  if (entry.kind === "reminder_done")
    return t("rolodex.today.entry.reminderDone");
  return entry.interaction_type
    ? interactionVerb(entry.interaction_type, t)
    : t("rolodex.today.entry.contactLogged");
}

export default function Today() {
  const t = useT();
  const { people, refresh } = useStore();
  const toast = useToast();
  const [payload, setPayload] = useState<TodayPayload | null>(null);
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [logging, setLogging] = useState<PersonComputed | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    () =>
      Promise.all([api.today(), api.stats()])
        .then(([todayData, statsData]) => {
          setPayload(todayData);
          setStats(statsData);
        })
        .catch((e: unknown) => {
          setError(errorMessage(e));
        }),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    void Promise.all([api.today(), api.stats()])
      .then(([todayData, statsData]) => {
        if (cancelled) return;
        setPayload(todayData);
        setStats(statsData);
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
    return (
      <div className="page">{t("rolodex.today.loadError", { error })}</div>
    );
  if (!payload)
    return <div className="page muted">{t("shared.common.loading")}</div>;

  const overdue = payload.to_contact.filter((p) => p.status === "overdue");
  const peopleById = new Map(people.map((p) => [p.id, p]));
  const pageDate = format(new Date(), "EEEE d MMMM yyyy", {
    locale: dateFnsLocale(),
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span className="icon-sq amber">
              <LayoutDashboard size={19} />
            </span>
            {t("rolodex.today.title")}
          </h1>
          <p className="page-desc">
            {t("rolodex.today.sub", { date: pageDate })}
          </p>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-num red">{overdue.length}</div>
          <div className="stat-label">
            <Phone size={13} /> {t("rolodex.today.stat.overdue")}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-num amber">
            {payload.to_contact.length - overdue.length}
          </div>
          <div className="stat-label">
            <History size={13} /> {t("rolodex.today.stat.dueSoon")}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-num purple">{payload.upcoming_dates.length}</div>
          <div className="stat-label">
            <Cake size={13} /> {t("rolodex.today.stat.dates30")}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-num blue">{payload.reminders.length}</div>
          <div className="stat-label">
            <Bell size={13} /> {t("rolodex.today.stat.reminders")}
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
              <Cake size={16} /> {t("rolodex.today.datesTitle")}
            </h2>
            <Link to="/calendar" className="small card-link">
              {t("rolodex.today.datesLink")}
            </Link>
          </div>
          {payload.upcoming_dates.length === 0 ? (
            <EmptyState icon={<Cake />}>
              {t("rolodex.today.datesEmpty")}
            </EmptyState>
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
                        {t("rolodex.today.turnsAge", {
                          age: e.age_turning ?? 0,
                        })}
                      </span>
                    )}
                  </div>
                  <div className="small muted">
                    {dateTypeLabel(e.type, e.label, t)}
                    {e.age_turning != null && !e.milestone
                      ? t("rolodex.today.turnsAgeInline", {
                          age: e.age_turning,
                        })
                      : ""}
                  </div>
                </div>
                <span className="small muted">
                  {relativeDays(e.date, payload.today, t)}
                </span>
              </Link>
            ))
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Bell size={16} /> {t("rolodex.today.remindersTitle")}
            </h2>
          </div>
          {payload.reminders.length === 0 ? (
            <EmptyState icon={<Bell />}>
              {t("rolodex.today.remindersEmpty")}
            </EmptyState>
          ) : (
            payload.reminders.slice(0, 7).map((r) => (
              <div key={r.id} className="list-row">
                <button
                  className="reminder-check"
                  title={t("shared.common.done")}
                  aria-label={t("shared.common.markDone", {
                    description: r.text,
                  })}
                  onClick={() => {
                    void api
                      .setReminderDone(r.id, true)
                      .then(after)
                      .then(() => toast(t("rolodex.toast.reminderDone")));
                  }}
                />
                <div className="body">
                  <div className="strong">{r.text}</div>
                  <div className="small muted">
                    <Link to={`/people/${r.person_id}`}>{r.person_name}</Link> ·{" "}
                    {t("rolodex.time.dueDate", {
                      date: fmtDate(r.due_date, undefined, t),
                    })}{" "}
                    ·{" "}
                    <span
                      className={r.overdue ? "reminder-overdue" : undefined}
                    >
                      {r.due_today
                        ? t("rolodex.time.today")
                        : relativeDays(r.due_date, payload.today, t)}
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
              <History size={16} /> {t("rolodex.today.recentTitle")}
            </h2>
            <Link to="/timeline" className="small card-link">
              {t("rolodex.today.timelineLink")}
            </Link>
          </div>
          {payload.recent.length === 0 ? (
            <EmptyState icon={<Sparkles />}>
              {t("rolodex.today.recentEmpty")}
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
                        {fmtDate(e.date, undefined, t)} ·{" "}
                        {relativeDays(e.date, payload.today, t)}
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
