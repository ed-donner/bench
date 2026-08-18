import { useTranslation } from "react-i18next";
import type { CheckInStatus, Circle } from "../types";

export function StatusBadge({
  status,
  title,
}: {
  status: CheckInStatus;
  title?: string;
}) {
  const { t } = useTranslation("rolodex");
  return (
    <span className={`badge status-${status}`} title={title}>
      <span className="dot" />
      {t(`status.${status}`)}
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
  const { t } = useTranslation("rolodex");
  const label = t(`circle.${circle}`);
  if (!onClick) return <span className={`chip circle-${circle}`}>{label}</span>;
  return (
    <button
      type="button"
      className={`chip circle-${circle} chip-clickable`}
      onClick={onClick}
      title={t("people.filterByCircle", { circle: label })}
    >
      {label}
    </button>
  );
}
