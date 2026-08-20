import { Clock3, MapPin, Megaphone, Pencil, Phone } from "lucide-react";
import type { PersonComputed } from "../../types";
import { Avatar } from "../Avatar";
import { CircleChip, StatusBadge } from "../Chips";
import {
  circleCadence,
  circleLabel,
  fmtDate,
  localTimeIn,
  relativeDays,
} from "../../format";
import { useT } from "../../../shared/useLocale";
import type { TranslateFn } from "../../../shared/i18n";

/** How often you mean to be in touch with this person, and why. */
function cadenceText(person: PersonComputed, t: TranslateFn): string {
  if (person.checkins_off) return t("rolodex.person.cadenceOff");
  const base = t("rolodex.person.cadence", {
    circle: circleLabel(person.circle, t),
    cadence: circleCadence(person.circle, t).toLowerCase(),
  });
  return person.cadence_override_days
    ? t("rolodex.person.cadenceOverride", {
        base,
        days: person.cadence_override_days,
      })
    : base;
}

/** The one line under the chips that says where the check-in clock stands. */
function dueText(person: PersonComputed, t: TranslateFn): string {
  if (person.status === "overdue" && person.next_due)
    return t("rolodex.person.dueOverdue", {
      date: fmtDate(person.next_due, undefined, t),
      relative: relativeDays(person.next_due, undefined, t),
    });
  if (person.status === "due_soon" && person.next_due)
    return t("rolodex.person.dueSoon", {
      date: fmtDate(person.next_due, undefined, t),
    });
  if (person.status === "snoozed" && person.snoozed_until)
    return t("rolodex.person.snoozedUntil", {
      date: fmtDate(person.snoozed_until, undefined, t),
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
  const t = useT();
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
                {person.job_title ? t("rolodex.person.atCompany") : ""}
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
                title={t("rolodex.time.timezoneTitle", {
                  timezone: person.timezone ?? "",
                })}
              >
                <Clock3 size={13} />{" "}
                {t("rolodex.time.theirTime", { time: localTime })}
              </span>
            )}
          </div>
          <div className="row wrap" style={{ marginTop: 10, gap: 8 }}>
            <StatusBadge status={person.status} title={cadence} />
            <CircleChip circle={person.circle} />
            {person.tags.map((tagName) => (
              <span key={tagName} className="chip">
                {tagName}
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
            <Phone size={15} /> {t("rolodex.person.logInteraction")}
          </button>
          <button className="btn" onClick={onEdit}>
            <Pencil size={15} /> {t("shared.common.edit")}
          </button>
        </div>
      </div>

      {person.status === "snoozed" && person.snoozed_until && (
        <div className="snooze-banner">
          <Clock3 size={15} />
          {t("rolodex.person.snoozeBanner", {
            date: fmtDate(person.snoozed_until, undefined, t),
          })}
        </div>
      )}

      {person.latest_news && (
        <div className="news-banner">
          <Megaphone size={17} />
          <div>
            <div className="text">{person.latest_news.text}</div>
            <div className="when">
              {t("rolodex.person.latestNews", {
                date: fmtDate(person.latest_news.date, undefined, t),
                relative: relativeDays(person.latest_news.date, undefined, t),
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
