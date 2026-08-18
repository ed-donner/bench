import { SubmitEvent, useState } from "react";
import Modal from "./Modal";
import { api } from "../api";
import {
  Contact,
  DEAL_STAGES,
  Deal,
  DealStage,
  Organization,
  STAGE_PROBABILITY,
  expectedValue,
} from "../types";
import { formatMoney } from "../format";
import { useTranslation } from "react-i18next";

interface Props {
  existing?: Deal;
  organizations: Organization[];
  contacts: Contact[];
  defaultOrganizationId?: number;
  onSaved: () => void;
  onClose: () => void;
}

interface FormState {
  name: string;
  organization_id: number | "";
  contact_id: number | "";
  stage: DealStage;
  value: number;
  probability: number;
  close_date: string;
}

/** An edit starts from the deal; a new deal starts blank, on the stage's default probability. */
function initialForm(
  existing?: Deal,
  defaultOrganizationId?: number,
): FormState {
  if (!existing) {
    return {
      name: "",
      organization_id: defaultOrganizationId ?? "",
      contact_id: "",
      stage: "New",
      value: 0,
      probability: STAGE_PROBABILITY.New,
      close_date: "",
    };
  }
  return {
    name: existing.name,
    organization_id: existing.organization_id ?? defaultOrganizationId ?? "",
    contact_id: existing.contact_id ?? "",
    stage: existing.stage,
    value: existing.value,
    probability: existing.probability,
    close_date: existing.close_date ?? "",
  };
}

export default function DealForm({
  existing,
  organizations,
  contacts,
  defaultOrganizationId,
  onSaved,
  onClose,
}: Props) {
  const { t } = useTranslation("crm");
  const [form, setForm] = useState(() =>
    initialForm(existing, defaultOrganizationId),
  );

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    const body = {
      ...form,
      organization_id:
        form.organization_id === "" ? null : form.organization_id,
      contact_id: form.contact_id === "" ? null : form.contact_id,
      value: form.value,
      probability: form.probability,
      close_date: form.close_date || null,
    };
    if (existing) await api.put(`/api/crm/deals/${existing.id}`, body);
    else await api.post("/api/crm/deals", body);
    onSaved();
    onClose();
  }

  return (
    <Modal
      title={existing ? t("form.editDeal") : t("action.addDeal")}
      onClose={onClose}
    >
      <form className="form-grid" onSubmit={(e) => void submit(e)}>
        <div className="field">
          <label htmlFor="dl-name">{t("field.name")}</label>
          <input
            id="dl-name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="form-row">
          <div className="field">
            <label htmlFor="dl-org">{t("field.organization")}</label>
            <select
              id="dl-org"
              value={form.organization_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  organization_id:
                    e.target.value === "" ? "" : Number(e.target.value),
                })
              }
            >
              <option value="">— {t("form.none")} —</option>
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="dl-contact">{t("field.primaryContact")}</label>
            <select
              id="dl-contact"
              value={form.contact_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  contact_id:
                    e.target.value === "" ? "" : Number(e.target.value),
                })
              }
            >
              <option value="">— {t("form.none")} —</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label htmlFor="dl-stage">{t("field.stage")}</label>
            <select
              id="dl-stage"
              value={form.stage}
              onChange={(e) => {
                const stage = e.target.value as DealStage;
                setForm({
                  ...form,
                  stage,
                  probability: STAGE_PROBABILITY[stage],
                });
              }}
            >
              {DEAL_STAGES.map((s) => (
                <option key={s} value={s}>
                  {t(`stage.${s}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="dl-value">{t("form.valueUsd")}</label>
            <input
              id="dl-value"
              type="number"
              min="0"
              step="1"
              required
              value={form.value}
              onChange={(e) =>
                setForm({ ...form, value: e.target.valueAsNumber || 0 })
              }
            />
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label htmlFor="dl-probability">{t("form.probabilityPct")}</label>
            <input
              id="dl-probability"
              type="number"
              min="0"
              max="100"
              step="5"
              required
              value={form.probability}
              onChange={(e) =>
                setForm({ ...form, probability: e.target.valueAsNumber || 0 })
              }
            />
          </div>
          <div className="field">
            <label htmlFor="deal-expected">{t("form.expectedValue")}</label>
            <output id="deal-expected" className="field-output">
              {formatMoney(
                expectedValue({
                  value: form.value,
                  probability: form.probability,
                }),
              )}
            </output>
          </div>
        </div>
        <div className="field">
          <label htmlFor="dl-close">{t("field.closeDate")}</label>
          <input
            id="dl-close"
            type="date"
            value={form.close_date}
            onChange={(e) => setForm({ ...form, close_date: e.target.value })}
          />
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            {t("action.cancel")}
          </button>
          <button type="submit" className="btn btn-primary">
            {t("action.save")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
