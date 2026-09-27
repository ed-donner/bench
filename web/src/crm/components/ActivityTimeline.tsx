import { api } from "../api";
import { Activity } from "../types";
import { formatDate, formatDateTime } from "../format";
import ActivityIcon from "./ActivityIcon";
import { activityLabel, useT } from "../strings";

interface Props {
  activities: Activity[];
  onChanged: () => void;
}

function isOverdue(activity: Activity): boolean {
  if (!activity.due_date || activity.done) return false;
  return activity.due_date < new Date().toISOString().slice(0, 10);
}

export default function ActivityTimeline({ activities, onChanged }: Props) {
  const t = useT();
  async function toggleDone(activity: Activity) {
    await api.patch(`/api/crm/activities/${activity.id}`, {
      done: !activity.done,
    });
    onChanged();
  }

  if (!activities.length) return <p className="muted">{t("activity.none")}</p>;

  return (
    <div className="timeline">
      {activities.map((a) => (
        <div key={a.id} className={`timeline-item${a.done ? " done" : ""}`}>
          <ActivityIcon type={a.type} />
          <div className="timeline-body">
            <div>{a.description}</div>
            <div className="timeline-meta">
              <span style={{ textTransform: "capitalize" }}>
                {activityLabel(a.type)}
              </span>
              <span>·</span>
              <span>{formatDateTime(a.occurred_at)}</span>
              {a.due_date && (
                <span className={`due-chip${isOverdue(a) ? " overdue" : ""}`}>
                  {isOverdue(a)
                    ? t("dash.overdueOn", { date: formatDate(a.due_date) })
                    : t("dash.dueOn", { date: formatDate(a.due_date) })}
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
              {t("activity.done")}
            </label>
          )}
        </div>
      ))}
    </div>
  );
}
