import { Link } from "react-router";
import { Phone } from "lucide-react";
import { useT } from "../../../shared/useLocale";
import type { ToContactRow, TodayPayload } from "../../api";
import type { PersonComputed } from "../../types";
import { Avatar } from "../Avatar";
import { circleLabel, relativeDays } from "../../i18n";

/** The one line under the heading: who is worst, or that there is nobody to chase. */
function summary(
  t: ReturnType<typeof useT<"rolodex">>,
  payload: TodayPayload,
): string {
  if (payload.to_contact.length === 0) return t("heroSummaryAllInTouch");
  const top = payload.to_contact[0];
  if (top.status === "overdue")
    return top.overdue_days
      ? t.i("heroSummaryMostOverdue", {
          name: top.name,
          days: top.overdue_days,
        })
      : t.i("heroSummaryMostOverdueNever", { name: top.name });
  const overdue = payload.to_contact.filter((p) => p.status === "overdue");
  return t.i("heroSummaryCounts", {
    overdue: overdue.length,
    dueSoon: payload.to_contact.length - overdue.length,
  });
}

function urgency(
  t: ReturnType<typeof useT<"rolodex">>,
  row: ToContactRow,
  today: string,
): string {
  if (row.status !== "overdue")
    return t.i("heroDue", { when: relativeDays(t, row.next_due, today) });
  return row.overdue_days > 0
    ? t.i("heroDaysOverdue", { n: row.overdue_days })
    : t("relativeNever");
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
  const t = useT("rolodex");

  return (
    <div className="hero">
      <div className="hero-head">
        <h2 className="hero-title">
          <Phone size={18} />
          {t("whoToContact")}
        </h2>
        <div className="hero-count">{summary(t, payload)}</div>
      </div>
      {payload.to_contact.length === 0 ? (
        <div className="hero-empty">
          {t("heroEmptyBefore")}
          <Link to="/circles">{t("navCircles")}</Link>
          {t("heroEmptyAfter")}
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
                        {circleLabel(t, row.circle)}
                      </span>
                    </div>
                    <div className="meta">
                      {row.last_contacted
                        ? t.i("heroLastContacted", {
                            when: relativeDays(
                              t,
                              row.last_contacted,
                              payload.today,
                            ),
                          })
                        : t("relativeNever")}
                      {row.latest_news ? ` · ${row.latest_news.text}` : ""}
                    </div>
                  </div>
                </Link>
                <div
                  className={`hero-urgency ${row.status === "overdue" ? "overdue" : "due"}`}
                >
                  {urgency(t, row, payload.today)}
                </div>
                {person && (
                  <button
                    className="btn btn-sm btn-amber"
                    onClick={() => onLog(person)}
                  >
                    <Phone size={13} /> {t("logContact")}
                  </button>
                )}
              </div>
            );
          })}
          {payload.to_contact.length > SHOWN && (
            <div className="hero-more">
              <Link to="/people">
                {t.i("heroMore", { n: payload.to_contact.length - SHOWN })}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
