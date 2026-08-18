import { Clock3, MapPin, Megaphone, Pencil, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type { PersonComputed } from "../../types";
import { Avatar } from "../Avatar";
import { CircleChip, StatusBadge } from "../Chips";
import { fmtDate, localTimeIn, relativeDays } from "../../format";

/** How often you mean to be in touch with this person, and why. */
function cadenceText(person: PersonComputed, t: TFunction): string {
  if (person.checkins_off) return t("person.checkinsOff");
  const base = t("person.cadence", {
    circle: t(`circle.${person.circle}`),
    cadence: t(`cadence.${person.circle}`).toLowerCase(),
  });
  return person.cadence_override_days
    ? t("person.cadenceOverride", {
        base,
        days: person.cadence_override_days,
      })
    : base;
}

/** The one line under the chips that says where the check-in clock stands. */
function dueText(person: PersonComputed, t: TFunction): string {
  if (person.status === "overdue" && person.next_due)
    return t("person.wasDue", {
      date: fmtDate(person.next_due),
      relative: relativeDays(person.next_due),
    });
  if (person.status === "due_soon" && person.next_due)
    return t("person.due", { date: fmtDate(person.next_due) });
  if (person.status === "snoozed" && person.snoozed_until)
    return t("person.snoozedUntil", { date: fmtDate(person.snoozed_until) });
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
  const { t } = useTranslation("rolodex");
  const localTime = localTimeIn(person.timezone);
  const cadence = cadenceText(person, t);
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
                {person.job_title ? t("person.at") : ""}
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
                title={t("person.theirTimezone", { timezone: person.timezone })}
              >
                <Clock3 size={13} />{" "}
                {t("person.theirTime", { time: localTime })}
              </span>
            )}
          </div>
          <div className="row wrap" style={{ marginTop: 10, gap: 8 }}>
            <StatusBadge status={person.status} title={cadence} />
            <CircleChip circle={person.circle} />
            {person.tags.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
          <div className="small muted" style={{ marginTop: 6 }}>
            {cadence}
            {dueText(person, t)}
          </div>
        </div>
        <div className="person-actions">
          <button className="btn btn-blue" onClick={onLog}>
            <Phone size={15} /> {t("action.logInteraction")}
          </button>
          <button className="btn" onClick={onEdit}>
            <Pencil size={15} /> {t("action.edit")}
          </button>
        </div>
      </div>

      {person.status === "snoozed" && person.snoozed_until && (
        <div className="snooze-banner">
          <Clock3 size={15} />
          {t("person.snoozeBanner", { date: fmtDate(person.snoozed_until) })}
        </div>
      )}

      {person.latest_news && (
        <div className="news-banner">
          <Megaphone size={17} />
          <div>
            <div className="text">{person.latest_news.text}</div>
            <div className="when">
              {t("person.latestNews", {
                date: fmtDate(person.latest_news.date),
                relative: relativeDays(person.latest_news.date),
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
