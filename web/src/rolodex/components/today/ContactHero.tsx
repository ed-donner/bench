import { Link } from "react-router";
import { Phone } from "lucide-react";
import type { ToContactRow, TodayPayload } from "../../api";
import type { PersonComputed } from "../../types";
import { Avatar } from "../Avatar";
import { circleLabel, relativeDays } from "../../format";
import { t, useT } from "../../strings";

/** The one line under the heading: who is worst, or that there is nobody to chase. */
function summary(payload: TodayPayload): string {
  if (payload.to_contact.length === 0) return t("hero.allInTouch");
  const top = payload.to_contact[0];
  if (top.status === "overdue")
    return top.overdue_days
      ? t("hero.mostOverdueDays", { name: top.name, count: top.overdue_days })
      : t("hero.mostOverdueNever", { name: top.name });
  const overdue = payload.to_contact.filter((p) => p.status === "overdue");
  return t("hero.counts", {
    overdue: overdue.length,
    due: payload.to_contact.length - overdue.length,
  });
}

function urgency(row: ToContactRow, today: string): string {
  if (row.status !== "overdue")
    return t("people.dueWhen", { when: relativeDays(row.next_due, today) });
  return row.overdue_days > 0
    ? t("hero.daysOverdue", { count: row.overdue_days })
    : t("relative.never");
}

const SHOWN = 8;

/** The dark panel at the top of Today: who to contact, most overdue first. */
export default function ContactHero({
  payload,
  peopleById,
  onLog,
}: {
  payload: TodayPayload;
  peopleById: Map<number, PersonComputed>;
  onLog: (person: PersonComputed) => void;
}) {
  const tr = useT();
  return (
    <div className="hero">
      <div className="hero-head">
        <h2 className="hero-title">
          <Phone size={18} />
          {tr("hero.title")}
        </h2>
        <div className="hero-count">{summary(payload)}</div>
      </div>
      {payload.to_contact.length === 0 ? (
        <div className="hero-empty">
          {tr("hero.empty1")} <Link to="/circles">{tr("hero.emptyLink")}</Link>
          {tr("hero.empty2")}
        </div>
      ) : (
        <div className="hero-list">
          {payload.to_contact.slice(0, SHOWN).map((row) => {
            const person = peopleById.get(row.id);
            return (
              <div key={row.id} className="hero-row">
                <Link className="who" to={`/people/${row.id}`}>
                  <Avatar name={row.name} photo={row.photo} />
                  <div className="grow">
                    <div className="row" style={{ gap: 8 }}>
                      <span className="name">{row.name}</span>
                      <span className="chip hero-chip">
                        {circleLabel(row.circle)}
                      </span>
                    </div>
                    <div className="meta">
                      {row.last_contacted
                        ? tr("hero.lastContacted", {
                            when: relativeDays(
                              row.last_contacted,
                              payload.today,
                            ),
                          })
                        : tr("relative.never")}
                      {row.latest_news ? ` · ${row.latest_news.text}` : ""}
                    </div>
                  </div>
                </Link>
                <div
                  className={`hero-urgency ${row.status === "overdue" ? "overdue" : "due"}`}
                >
                  {urgency(row, payload.today)}
                </div>
                {person && (
                  <button
                    className="btn btn-sm btn-amber"
                    onClick={() => onLog(person)}
                  >
                    <Phone size={13} /> {tr("hero.log")}
                  </button>
                )}
              </div>
            );
          })}
          {payload.to_contact.length > SHOWN && (
            <div className="hero-more">
              <Link to="/people">
                {tr("hero.more", {
                  count: payload.to_contact.length - SHOWN,
                })}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
