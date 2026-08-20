import { useT } from "../../shared/useLocale";
import Modal from "./Modal";

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
  const t = useT();

  return (
    <Modal title={title} onClose={onCancel}>
      <p style={{ marginTop: 0 }}>{message}</p>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onCancel}>
          {t("shared.common.cancel")}
        </button>
        <button className="btn btn-danger" onClick={onConfirm}>
          {t("shared.common.delete")}
        </button>
      </div>
    </Modal>
  );
}
