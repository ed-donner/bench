import { SubmitEvent, useState } from "react";
import Modal from "./Modal";
import { api } from "../api";
import { useT } from "../../shared/useLocale";
import {
  CONTACT_STATUSES,
  Contact,
  ContactStatus,
  Organization,
} from "../types";
import { contactStatusLabel } from "../i18n";

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
  const ts = useT("shared");
  const tc = useT("crm");
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
      title={existing ? tc("editContact") : tc("addContact")}
      onClose={onClose}
    >
      <form className="form-grid" onSubmit={(e) => void submit(e)}>
        <div className="field">
          <label htmlFor="ct-name">{ts("name")}</label>
          <input
            id="ct-name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="form-row">
          <div className="field">
            <label htmlFor="ct-email">{tc("email")}</label>
            <input
              id="ct-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="ct-phone">{tc("phone")}</label>
            <input
              id="ct-phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="ct-title">{tc("jobTitle")}</label>
          <input
            id="ct-title"
            value={form.job_title}
            onChange={(e) => setForm({ ...form, job_title: e.target.value })}
          />
        </div>
        <div className="form-row">
          <div className="field">
            <label htmlFor="ct-org">{tc("organization")}</label>
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
              <option value="">{tc("noneOption")}</option>
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="ct-status">{ts("status")}</label>
            <select
              id="ct-status"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as ContactStatus })
              }
            >
              {CONTACT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {contactStatusLabel(tc, s)}
                </option>
              ))}
            </select>
          </div>
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
