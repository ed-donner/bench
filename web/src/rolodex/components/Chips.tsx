import type { CheckInStatus, Circle } from "../types";
import { useLocale } from "../../shared/useLocale";
import { circleLabel, statusLabel } from "../format";

export function StatusBadge({
  status,
  title,
}: {
  status: CheckInStatus;
  title?: string;
}) {
  const { t } = useLocale();
  return (
    <span className={`badge status-${status}`} title={title}>
      <span className="dot" />
      {statusLabel(t, status)}
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
  const { t } = useLocale();
  const label = circleLabel(t, circle);
  if (!onClick) return <span className={`chip circle-${circle}`}>{label}</span>;
  return (
    <button
      type="button"
      className={`chip circle-${circle} chip-clickable`}
      onClick={onClick}
      title={t("people.filterCircleTitle", { circle: label })}
    >
      {label}
    </button>
  );
}
