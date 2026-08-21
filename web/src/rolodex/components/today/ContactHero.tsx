import { Link } from "react-router";
import { Phone } from "lucide-react";
import { useLocale } from "../../../shared/useLocale";
import type { ToContactRow, TodayPayload } from "../../api";
import type { PersonComputed } from "../../types";
import { Avatar } from "../Avatar";
import { circleLabel, relativeDays } from "../../format";

function summary(
  t: ReturnType<typeof useLocale>["t"],
  payload: TodayPayload,
): string {
  if (payload.to_contact.length === 0) return t("hero.summaryAllInTouch");
  const top = payload.to_contact[0];
  if (top.status === "overdue")
    return top.overdue_days
      ? t("hero.summaryMostOverdue", {
          name: top.name,
          days: top.overdue_days,
        })
      : t("hero.summaryMostOverdueNever", { name: top.name });
  const overdue = payload.to_contact.filter((p) => p.status === "overdue");
  return t("hero.summaryCounts", {
    overdue: overdue.length,
    dueSoon: payload.to_contact.length - overdue.length,
  });
}

function urgency(
  t: ReturnType<typeof useLocale>["t"],
  row: ToContactRow,
  today: string,
): string {
  if (row.status !== "overdue")
    return t("hero.due", { when: relativeDays(t, row.next_due, today) });
  return row.overdue_days > 0
    ? t("hero.daysOverdue", { days: row.overdue_days })
    : t("hero.neverOverdue");
}

const SHOWN = 8;

export default function ContactHero({
  payload,
  peopleById,
  onLog,
}: {
  payload: TodayPayload;
  peopleById: Map<number, PersonComputed>;
  onLog: (person: PersonComputed) => void;
}) {
  const { t } = useLocale();

  return (
    <div className="hero">
      <div className="hero-head">
        <h2 className="hero-title">
          <Phone size={18} />
          {t("hero.title")}
        </h2>
        <div className="hero-count">{summary(t, payload)}</div>
      </div>
      {payload.to_contact.length === 0 ? (
        <div className="hero-empty">
          {t("hero.emptyPrefix")}{" "}
          <Link to="/circles">{t("hero.circlesLink")}</Link>{" "}
          {t("hero.emptySuffix")}
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
                        ? t("hero.lastContacted", {
                            when: relativeDays(
                              t,
                              row.last_contacted,
                              payload.today,
                            ),
                          })
                        : t("hero.neverContacted")}
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
                    <Phone size={13} /> {t("hero.logContact")}
                  </button>
                )}
              </div>
            );
          })}
          {payload.to_contact.length > SHOWN && (
            <div className="hero-more">
              <Link to="/people">
                {t("hero.andMore", {
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
