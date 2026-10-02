import Modal from "./Modal";
import { useLocale } from "../../shared/useLocale";

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
  const { t } = useLocale();

  return (
    <Modal title={title} onClose={onCancel}>
      <p style={{ marginTop: 0 }}>{message}</p>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onCancel}>
          {t("common.cancel")}
        </button>
        <button className="btn btn-danger" onClick={onConfirm}>
          {t("common.delete")}
        </button>
      </div>
    </Modal>
  );
}
