import { api } from "../api";
import { Activity } from "../types";
import { useLocale } from "../../shared/useLocale";
import { activityTypeLabel } from "../types";
import { formatDate, formatDateTime } from "../format";
import ActivityIcon from "./ActivityIcon";

interface Props {
  activities: Activity[];
  onChanged: () => void;
}

function isOverdue(activity: Activity): boolean {
  if (!activity.due_date || activity.done) return false;
  return activity.due_date < new Date().toISOString().slice(0, 10);
}

export default function ActivityTimeline({ activities, onChanged }: Props) {
  const { t, locale } = useLocale();

  async function toggleDone(activity: Activity) {
    await api.patch(`/api/crm/activities/${activity.id}`, {
      done: !activity.done,
    });
    onChanged();
  }

  if (!activities.length)
    return <p className="muted">{t("activity.noActivity")}</p>;

  return (
    <div className="timeline">
      {activities.map((a) => (
        <div key={a.id} className={`timeline-item${a.done ? " done" : ""}`}>
          <ActivityIcon type={a.type} />
          <div className="timeline-body">
            <div>{a.description}</div>
            <div className="timeline-meta">
              <span>{activityTypeLabel(a.type, t)}</span>
              <span>·</span>
              <span>{formatDateTime(a.occurred_at, locale)}</span>
              {a.due_date && (
                <span className={`due-chip${isOverdue(a) ? " overdue" : ""}`}>
                  {isOverdue(a) ? t("dashboard.overdue") : t("dashboard.due")}
                  {formatDate(a.due_date, locale)}
                </span>
              )}
            </div>
          </div>
          {a.due_date && (
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                whiteSpace: "nowrap",
              }}
            >
              <input
                type="checkbox"
                checked={!!a.done}
                onChange={() => void toggleDone(a)}
              />
              {t("common.done")}
            </label>
          )}
        </div>
      ))}
    </div>
  );
}
