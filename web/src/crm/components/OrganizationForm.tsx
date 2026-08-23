import { SubmitEvent, useState } from "react";
import { useT } from "../../shared/useLocale";
import Modal from "./Modal";
import { api } from "../api";
import { Organization } from "../types";

interface Props {
  existing?: Organization;
  onSaved: () => void;
  onClose: () => void;
}

export default function OrganizationForm({
  existing,
  onSaved,
  onClose,
}: Props) {
  const t = useT();
  const [form, setForm] = useState({
    name: existing?.name ?? "",
    website: existing?.website ?? "",
    industry: existing?.industry ?? "",
    notes: existing?.notes ?? "",
  });

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    if (existing) await api.put(`/api/crm/organizations/${existing.id}`, form);
    else await api.post("/api/crm/organizations", form);
    onSaved();
    onClose();
  }

  return (
    <Modal
      title={
        existing
          ? t("crm.form.editOrganization")
          : t("crm.form.addOrganization")
      }
      onClose={onClose}
    >
      <form className="form-grid" onSubmit={(e) => void submit(e)}>
        <div className="field">
          <label htmlFor="org-name">{t("shared.common.name")}</label>
          <input
            id="org-name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="form-row">
          <div className="field">
            <label htmlFor="org-website">{t("crm.form.website")}</label>
            <input
              id="org-website"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="org-industry">{t("crm.form.industry")}</label>
            <input
              id="org-industry"
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="org-notes">{t("crm.form.notes")}</label>
          <textarea
            id="org-notes"
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            {t("shared.common.cancel")}
          </button>
          <button type="submit" className="btn btn-primary">
            {t("shared.common.save")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
