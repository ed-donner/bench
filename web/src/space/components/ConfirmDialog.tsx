import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useTranslation("space");
  // Focused on mount rather than through autoFocus, which fires before assistive technology has
  // been told the dialog opened.
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => cancelRef.current?.focus(), []);

  return (
    <div
      role="presentation"
      className="overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="dialog" role="dialog" aria-label={title}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="dialog-actions">
          <button ref={cancelRef} className="btn" onClick={onCancel}>
            {t("action.cancel")}
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
