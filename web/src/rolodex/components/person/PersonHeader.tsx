import { Clock3, MapPin, Megaphone, Pencil, Phone } from "lucide-react";
import { useLocale } from "../../../shared/useLocale";
import type { PersonComputed } from "../../types";
import { Avatar } from "../Avatar";
import { CircleChip, StatusBadge } from "../Chips";
import { circleMeta, fmtDate, localTimeIn, relativeDays } from "../../format";

function cadenceText(
  t: ReturnType<typeof useLocale>["t"],
  person: PersonComputed,
): string {
  if (person.checkins_off) return t("person.checkinsOff");
  const meta = circleMeta(t, person.circle);
  const base = t("person.cadenceBase", {
    circle: meta.label,
    cadence: meta.cadenceDescription.toLowerCase(),
  });
  return person.cadence_override_days
    ? `${base}${t("person.cadenceOverride", {
        days: person.cadence_override_days,
      })}`
    : base;
}

function dueText(
  t: ReturnType<typeof useLocale>["t"],
  person: PersonComputed,
): string {
  if (person.status === "overdue" && person.next_due)
    return t("person.dueWas", {
      date: fmtDate(person.next_due),
      relative: relativeDays(t, person.next_due),
    });
  if (person.status === "due_soon" && person.next_due)
    return t("person.dueOn", { date: fmtDate(person.next_due) });
  if (person.status === "snoozed" && person.snoozed_until)
    return t("person.snoozedUntil", {
      date: fmtDate(person.snoozed_until),
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
  const { t } = useLocale();
  const localTime = localTimeIn(person.timezone);
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
                {person.job_title ? t("person.atCompany") : ""}
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
                title={t("person.timezoneTitle", {
                  timezone: person.timezone ?? "",
                })}
              >
                <Clock3 size={13} />{" "}
                {t("person.theirTime", { time: localTime })}
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
            {dueText(t, person)}
          </div>
        </div>
        <div className="person-actions">
          <button className="btn btn-blue" onClick={onLog}>
            <Phone size={15} /> {t("person.logInteraction")}
          </button>
          <button className="btn" onClick={onEdit}>
            <Pencil size={15} /> {t("person.edit")}
          </button>
        </div>
      </div>

      {person.status === "snoozed" && person.snoozed_until && (
        <div className="snooze-banner">
          <Clock3 size={15} />
          {t("person.snoozedBanner", {
            date: fmtDate(person.snoozed_until),
          })}
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
                relative: relativeDays(t, person.latest_news.date),
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
