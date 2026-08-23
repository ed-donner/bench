import { SubmitEvent, useState } from "react";
import { useT } from "../../shared/useLocale";
import { statusLabel } from "../labels";
import Modal from "./Modal";
import { api } from "../api";
import {
  CONTACT_STATUSES,
  Contact,
  ContactStatus,
  Organization,
} from "../types";

interface Props {
  existing?: Contact;
  organizations: Organization[];
  defaultOrganizationId?: number;
  onSaved: () => void;
  onClose: () => void;
}

export default function ContactForm({
  existing,
  organizations,
  defaultOrganizationId,
  onSaved,
  onClose,
}: Props) {
  const t = useT();
  const [form, setForm] = useState({
    name: existing?.name ?? "",
    email: existing?.email ?? "",
    phone: existing?.phone ?? "",
    job_title: existing?.job_title ?? "",
    organization_id: existing?.organization_id ?? defaultOrganizationId ?? "",
    status: existing?.status ?? "lead",
  });

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    const body = {
      ...form,
      organization_id:
        form.organization_id === "" ? null : Number(form.organization_id),
    };
    if (existing) await api.put(`/api/crm/contacts/${existing.id}`, body);
    else await api.post("/api/crm/contacts", body);
    onSaved();
    onClose();
  }

  return (
    <Modal
      title={existing ? t("crm.form.editContact") : t("crm.form.addContact")}
      onClose={onClose}
    >
      <form className="form-grid" onSubmit={(e) => void submit(e)}>
        <div className="field">
          <label htmlFor="ct-name">{t("shared.common.name")}</label>
          <input
            id="ct-name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="form-row">
          <div className="field">
            <label htmlFor="ct-email">{t("crm.form.email")}</label>
            <input
              id="ct-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="ct-phone">{t("crm.form.phone")}</label>
            <input
              id="ct-phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="ct-title">{t("crm.form.jobTitle")}</label>
          <input
            id="ct-title"
            value={form.job_title}
            onChange={(e) => setForm({ ...form, job_title: e.target.value })}
          />
        </div>
        <div className="form-row">
          <div className="field">
            <label htmlFor="ct-org">{t("crm.form.organization")}</label>
            <select
              id="ct-org"
              value={form.organization_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  organization_id:
                    e.target.value === "" ? "" : Number(e.target.value),
                })
              }
            >
              <option value="">{t("shared.common.none")}</option>
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="ct-status">{t("crm.form.status")}</label>
            <select
              id="ct-status"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as ContactStatus })
              }
            >
              {CONTACT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(t, s)}
                </option>
              ))}
            </select>
          </div>
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
