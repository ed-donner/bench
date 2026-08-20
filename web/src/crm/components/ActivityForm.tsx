import { SubmitEvent, useState } from "react";
import Modal from "./Modal";
import { api } from "../api";
import { useT } from "../../shared/useLocale";
import { ACTIVITY_TYPES, ActivityType } from "../types";
import { activityTypeLabel } from "../i18n";

interface Props {
  contactId?: number;
  dealId?: number;
  onSaved: () => void;
  onClose: () => void;
}

export default function ActivityForm({
  contactId,
  dealId,
  onSaved,
  onClose,
}: Props) {
  const ts = useT("shared");
  const tc = useT("crm");
  const [form, setForm] = useState({
    type: "note" as ActivityType,
    description: "",
    due_date: "",
  });

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    await api.post("/api/crm/activities", {
      type: form.type,
      description: form.description,
      contact_id: contactId ?? null,
      deal_id: dealId ?? null,
      due_date: form.due_date || null,
    });
    onSaved();
    onClose();
  }

  return (
    <Modal title={tc("logActivity")} onClose={onClose}>
      <form className="form-grid" onSubmit={(e) => void submit(e)}>
        <div className="form-row">
          <div className="field">
            <label htmlFor="act-type">{ts("type")}</label>
            <select
              id="act-type"
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as ActivityType })
              }
            >
              {ACTIVITY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {activityTypeLabel(tc, t)}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="act-due">{tc("followUpDueOptional")}</label>
            <input
              id="act-due"
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="act-desc">{ts("description")}</label>
          <textarea
            id="act-desc"
            rows={3}
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            {ts("cancel")}
          </button>
          <button type="submit" className="btn btn-primary">
            {ts("save")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
