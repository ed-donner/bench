import Modal from "./Modal";
import { useTranslation } from "react-i18next";

interface Props {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useTranslation("crm");
  return (
    <Modal title={title} onClose={onCancel}>
      <p style={{ marginTop: 0 }}>{message}</p>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onCancel}>
          {t("action.cancel")}
        </button>
        <button className="btn btn-danger" onClick={onConfirm}>
          {t("action.delete")}
        </button>
      </div>
    </Modal>
  );
}
