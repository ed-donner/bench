import type { CheckInStatus, Circle } from "../types";
import { circleLabel, statusLabel } from "../format";
import { useT } from "../strings";

export function StatusBadge({
  status,
  title,
}: {
  status: CheckInStatus;
  title?: string;
}) {
  return (
    <span className={`badge status-${status}`} title={title}>
      <span className="dot" />
      {statusLabel(status)}
    </span>
  );
}

export function CircleChip({
  circle,
  onClick,
}: {
  circle: Circle;
  onClick?: () => void;
}) {
  const t = useT();
  const label = circleLabel(circle);
  if (!onClick) return <span className={`chip circle-${circle}`}>{label}</span>;
  return (
    <button
      type="button"
      className={`chip circle-${circle} chip-clickable`}
      onClick={onClick}
      title={t("circle.filterBy", { circle: label })}
    >
      {label}
    </button>
  );
}
