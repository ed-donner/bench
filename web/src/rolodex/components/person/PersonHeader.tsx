import { Clock3, MapPin, Megaphone, Pencil, Phone } from "lucide-react";
import { useLocale, useT } from "../../../shared/useLocale";
import type { PersonComputed } from "../../types";
import { Avatar } from "../Avatar";
import { CircleChip, StatusBadge } from "../Chips";
import {
  circleCadence,
  circleLabel,
  relativeDays,
  type RolodexT,
} from "../../i18n";
import { fmtDate, localTimeIn } from "../../format";

/** How often you mean to be in touch with this person, and why. */
function cadenceText(t: RolodexT, person: PersonComputed): string {
  if (person.checkins_off) return t("checkInsOff");
  const label = circleLabel(t, person.circle);
  const cadence = circleCadence(t, person.circle).toLowerCase();
  const base = t.i("cadenceLine", { circle: label, cadence });
  return person.cadence_override_days
    ? t.i("cadenceOverride", {
        base,
        days: person.cadence_override_days,
      })
    : base;
}

/** The one line under the chips that says where the check-in clock stands. */
function dueText(
  t: RolodexT,
  person: PersonComputed,
  locale: "en" | "es",
): string {
  if (person.status === "overdue" && person.next_due)
    return t.i("wasDue", {
      date: fmtDate(person.next_due, locale),
      relative: relativeDays(t, person.next_due),
    });
  if (person.status === "due_soon" && person.next_due)
    return t.i("dueOn", { date: fmtDate(person.next_due, locale) });
  if (person.status === "snoozed" && person.snoozed_until)
    return t.i("snoozedUntil", {
      date: fmtDate(person.snoozed_until, locale),
    });
  return "";
}

export default function PersonHeader({
  person,
  onLog,
  onEdit,
}: {
  person: PersonComputed;
  onLog: () => void;
  onEdit: () => void;
}) {
  const t = useT("rolodex");
  const { locale } = useLocale();
  const localTime = localTimeIn(person.timezone, locale);
  const cadence = cadenceText(t, person);

  return (
    <>
      <div className="person-head">
        <Avatar name={person.name} photo={person.photo} size="xl" />
        <div className="person-head-main">
          <h1 className="person-name">{person.name}</h1>
          <div className="person-sub">
            {person.job_title && <span>{person.job_title}</span>}
            {person.company && (
              <span>
                {person.job_title ? t("atCompany") : ""}
                <strong>{person.company}</strong>
              </span>
            )}
            {(person.job_title || person.company) &&
              (person.city || localTime) && <span>·</span>}
            {person.city && (
              <span className="row" style={{ gap: 4 }}>
                <MapPin size={13} /> {person.city}
              </span>
            )}
            {localTime && (
              <span
                className="row"
                style={{ gap: 4 }}
                title={t.i("theirTimezone", { zone: person.timezone ?? "" })}
              >
                <Clock3 size={13} /> {t.i("theirTime", { time: localTime })}
              </span>
            )}
          </div>
          <div className="row wrap" style={{ marginTop: 10, gap: 8 }}>
            <StatusBadge status={person.status} title={cadence} />
            <CircleChip circle={person.circle} />
            {person.tags.map((tag) => (
              <span key={tag} className="chip">
                {tag}
              </span>
            ))}
          </div>
          <div className="small muted" style={{ marginTop: 6 }}>
            {cadence}
            {dueText(t, person, locale)}
          </div>
        </div>
        <div className="person-actions">
          <button className="btn btn-blue" onClick={onLog}>
            <Phone size={15} /> {t("logInteraction")}
          </button>
          <button className="btn" onClick={onEdit}>
            <Pencil size={15} /> {t("edit")}
          </button>
        </div>
      </div>

      {person.status === "snoozed" && person.snoozed_until && (
        <div className="snooze-banner">
          <Clock3 size={15} />
          {t.i("snoozeBanner", {
            date: fmtDate(person.snoozed_until, locale),
          })}
        </div>
      )}

      {person.latest_news && (
        <div className="news-banner">
          <Megaphone size={17} />
          <div>
            <div className="text">{person.latest_news.text}</div>
            <div className="when">
              {t.i("latestNewsWhen", {
                date: fmtDate(person.latest_news.date, locale),
                relative: relativeDays(t, person.latest_news.date),
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
