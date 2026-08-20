import type { CheckInStatus, Circle } from "../types";
import { useT } from "../../shared/useLocale";
import { circleLabel, statusLabel } from "../format";

export function StatusBadge({
  status,
  title,
}: {
  status: CheckInStatus;
  title?: string;
}) {
  const t = useT();
  return (
    <span className={`badge status-${status}`} title={title}>
      <span className="dot" />
      {statusLabel(status, t)}
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
  const label = circleLabel(circle, t);
  if (!onClick) return <span className={`chip circle-${circle}`}>{label}</span>;
  return (
    <button
      type="button"
      className={`chip circle-${circle} chip-clickable`}
      onClick={onClick}
      title={t("rolodex.chip.filterByCircle", { circle: label })}
    >
      {label}
    </button>
  );
}
