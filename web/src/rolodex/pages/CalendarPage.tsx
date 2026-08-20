import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { CalendarDays, Cake, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { api, type CalendarPayload } from "../api";
import type { PersonComputed, UpcomingDate } from "../types";
import { dateTypeLabel } from "../dates";
import { Avatar } from "../components/Avatar";
import { dateFnsLocale, errorMessage, fmtDate, relativeDays } from "../format";
import { useT } from "../../shared/useLocale";
import type { TranslateFn } from "../../shared/i18n";
import { useStore } from "../store";

export default function CalendarPage() {
  const t = useT();
  const [activeDate, setActiveDate] = useState(new Date());
  const [payload, setPayload] = useState<CalendarPayload | null>(null);
  const { people } = useStore();
  const [error, setError] = useState<string | null>(null);

  const year = activeDate.getFullYear();
  const month = activeDate.getMonth() + 1;

  useEffect(() => {
    api
      .calendar(year, month)
      .then(setPayload)
      .catch((e: unknown) => {
        setError(errorMessage(e));
      });
  }, [year, month]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, UpcomingDate[]>();
    for (const e of payload?.events ?? []) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    return map;
  }, [payload]);

  const peopleById = useMemo(() => {
    const map = new Map<number, PersonComputed>();
    for (const p of people) map.set(p.id, p);
    return map;
  }, [people]);

  if (error)
    return (
      <div className="page">{t("rolodex.calendar.loadError", { error })}</div>
    );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span
              className="icon-sq"
              style={{
                background: "var(--amber-soft)",
                color: "var(--amber-deep)",
              }}
            >
              <CalendarDays size={19} />
            </span>
            {t("rolodex.calendar.title")}
          </h1>
          <p className="page-desc">{t("rolodex.calendar.sub")}</p>
        </div>
      </div>

      <div className="calendar-wrap">
        <div className="card card-pad">
          <Calendar
            value={activeDate}
            view="month"
            minDetail="month"
            maxDetail="month"
            showNeighboringMonth={false}
            onActiveStartDateChange={({ activeStartDate }) =>
              activeStartDate && setActiveDate(activeStartDate)
            }
            prev2Label={null}
            next2Label={null}
            prevLabel={<ChevronLeft size={17} />}
            nextLabel={<ChevronRight size={17} />}
            formatMonthYear={(_locale, d) =>
              format(d, "MMMM yyyy", { locale: dateFnsLocale() })
            }
            tileClassName={({ date }) => {
              const iso = format(date, "yyyy-MM-dd");
              return eventsByDay.has(iso) ? "has-events" : undefined;
            }}
            tileContent={({ date }) => {
              const iso = format(date, "yyyy-MM-dd");
              const events = eventsByDay.get(iso);
              if (!events) return null;
              return (
                <div className="cal-events">
                  {events.slice(0, 3).map((e) => (
                    <Link
                      key={e.id}
                      to={`/people/${e.person_id}`}
                      className={`cal-event ${e.type}${e.milestone ? " milestone" : ""}`}
                      title={milestoneTitle(e, t)}
                    >
                      <Cake size={10} />
                      <span className="label">
                        {e.person_name.split(" ")[0]}
                        {e.age_turning != null ? ` · ${e.age_turning}` : ""}
                      </span>
                    </Link>
                  ))}
                  {events.length > 3 && (
                    <span className="small muted">
                      {t("rolodex.calendar.moreEvents", {
                        count: events.length - 3,
                      })}
                    </span>
                  )}
                </div>
              );
            }}
          />
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              {t("rolodex.calendar.upcomingTitle")}
            </h2>
          </div>
          {(payload?.upcoming.length ?? 0) === 0 ? (
            <div className="empty">{t("rolodex.calendar.upcomingEmpty")}</div>
          ) : (
            (payload?.upcoming ?? []).map((e) => {
              const person = peopleById.get(e.person_id);
              return (
                <Link
                  key={`${e.id}-${e.date}`}
                  to={`/people/${e.person_id}`}
                  className="upcoming-item"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className="date-pill">
                    <span className="mon">
                      {format(new Date(e.date + "T00:00:00"), "MMM", {
                        locale: dateFnsLocale(),
                      })}
                    </span>
                    <span className="day">
                      {format(new Date(e.date + "T00:00:00"), "d")}
                    </span>
                  </div>
                  <Avatar
                    name={e.person_name}
                    photo={person?.photo}
                    size="sm"
                  />
                  <div className="grow">
                    <div style={{ fontWeight: 600 }}>{e.person_name}</div>
                    <div className="small muted">
                      {dateTypeLabel(e.type, e.label, t)}
                      {e.age_turning != null
                        ? t("rolodex.today.turnsAgeInline", {
                            age: e.age_turning,
                          })
                        : ""}
                      {e.milestone ? t("rolodex.calendar.milestone") : ""}
                    </div>
                  </div>
                  <div className="small muted" style={{ textAlign: "right" }}>
                    {relativeDays(e.date, undefined, t)}
                    <div style={{ fontSize: 11 }}>
                      {fmtDate(e.date, undefined, t)}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function milestoneTitle(e: UpcomingDate, t: TranslateFn): string {
  const base = dateTypeLabel(e.type, e.label, t);
  if (e.milestone && e.age_turning != null)
    return t("rolodex.calendar.milestoneTitle", {
      label: base,
      name: e.person_name,
      age: e.age_turning,
    });
  return base;
}
