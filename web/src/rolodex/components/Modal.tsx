import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { useT } from "../../shared/useLocale";

export function Modal({
  title,
  icon,
  onClose,
  children,
  footer,
  large,
}: {
  title: string;
  icon?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  large?: boolean;
}) {
  const t = useT();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`modal${large ? " modal-lg" : ""}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <h3>
            {icon}
            {title}
          </h3>
          <button
            className="icon-btn"
            onClick={onClose}
            aria-label={t("shared.common.close")}
          >
            <X size={17} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="empty">
      {icon}
      <div>{children}</div>
    </div>
  );
}
