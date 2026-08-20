import Modal from "./Modal";
import { useT } from "../../shared/useLocale";

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
  const ts = useT("shared");
  return (
    <Modal title={title} onClose={onCancel}>
      <p style={{ marginTop: 0 }}>{message}</p>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onCancel}>
          {ts("cancel")}
        </button>
        <button className="btn btn-danger" onClick={onConfirm}>
          {ts("delete")}
        </button>
      </div>
    </Modal>
  );
}
