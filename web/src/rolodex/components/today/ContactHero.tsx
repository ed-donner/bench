import { Link } from "react-router";
import { Phone } from "lucide-react";
import type { ToContactRow, TodayPayload } from "../../api";
import type { PersonComputed } from "../../types";
import { Avatar } from "../Avatar";
import { useT } from "../../../shared/useLocale";
import type { TranslateFn } from "../../../shared/i18n";
import { circleLabel, relativeDays } from "../../format";

/** The one line under the heading: who is worst, or that there is nobody to chase. */
function summary(payload: TodayPayload, t: TranslateFn): string {
  if (payload.to_contact.length === 0)
    return t("rolodex.today.hero.allInTouch");
  const top = payload.to_contact[0];
  if (top.status === "overdue")
    return top.overdue_days
      ? t("rolodex.today.hero.mostOverdue", {
          name: top.name,
          days: top.overdue_days,
        })
      : t("rolodex.today.hero.mostOverdueNever", { name: top.name });
  const overdue = payload.to_contact.filter((p) => p.status === "overdue");
  return t("rolodex.today.hero.summary", {
    overdue: overdue.length,
    dueSoon: payload.to_contact.length - overdue.length,
  });
}

function urgency(row: ToContactRow, today: string, t: TranslateFn): string {
  if (row.status !== "overdue")
    return t("rolodex.time.due", {
      when: relativeDays(row.next_due, today, t),
    });
  return row.overdue_days > 0
    ? t("rolodex.time.daysOverdue", { count: row.overdue_days })
    : t("rolodex.time.neverContacted");
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
  const t = useT();

  return (
    <div className="hero">
      <div className="hero-head">
        <h2 className="hero-title">
          <Phone size={18} />
          {t("rolodex.today.hero.title")}
        </h2>
        <div className="hero-count">{summary(payload, t)}</div>
      </div>
      {payload.to_contact.length === 0 ? (
        <div className="hero-empty">
          {(() => {
            const linkText = t("rolodex.today.hero.circlesLink");
            const [before = "", after = ""] = t(
              "rolodex.today.hero.empty",
            ).split(linkText);
            return (
              <>
                {before}
                <Link to="/circles">{linkText}</Link>
                {after}
              </>
            );
          })()}
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
                        {circleLabel(row.circle, t)}
                      </span>
                    </div>
                    <div className="meta">
                      {row.last_contacted
                        ? t("rolodex.time.lastContacted", {
                            when: relativeDays(
                              row.last_contacted,
                              payload.today,
                              t,
                            ),
                          })
                        : t("rolodex.time.neverContacted")}
                      {row.latest_news ? ` · ${row.latest_news.text}` : ""}
                    </div>
                  </div>
                </Link>
                <div
                  className={`hero-urgency ${row.status === "overdue" ? "overdue" : "due"}`}
                >
                  {urgency(row, payload.today, t)}
                </div>
                {person && (
                  <button
                    className="btn btn-sm btn-amber"
                    onClick={() => onLog(person)}
                  >
                    <Phone size={13} /> {t("rolodex.today.hero.logContact")}
                  </button>
                )}
              </div>
            );
          })}
          {payload.to_contact.length > SHOWN && (
            <div className="hero-more">
              <Link to="/people">
                {t("rolodex.today.hero.andMore", {
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
