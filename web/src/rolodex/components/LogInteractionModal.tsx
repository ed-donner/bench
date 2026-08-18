import { useState } from "react";
import { CalendarDays, Phone } from "lucide-react";
import type { InteractionType, PersonComputed } from "../types";
import { INTERACTION_TYPES } from "../types";
import { api } from "../api";
import { Modal } from "./Modal";
import { Field, FieldGroup } from "./Field";
import InteractionIcon from "./InteractionIcon";
import { todayISO } from "../format";
import { useToast } from "../store";
import { useTranslation } from "react-i18next";

export function LogInteractionModal({
  person,
  onClose,
  onSaved,
}: {
  person: PersonComputed;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const { t } = useTranslation("rolodex");
  const [type, setType] = useState<InteractionType>("call");
  const [date, setDate] = useState(todayISO());
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const firstName = person.name.split(" ")[0];

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.addInteraction(person.id, type, date, notes.trim());
      toast(
        t("log.logged", {
          type: t(`interactionLabel.${type}`).toLowerCase(),
          firstName,
        }),
      );
      onSaved?.();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={t("log.titleWith", { firstName })}
      icon={<Phone size={17} className="modal-icon blue" />}
      onClose={onClose}
      footer={
        <>
          {error && <span className="form-error">{error}</span>}
          <button className="btn" onClick={onClose}>
            {t("action.cancel")}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => void save()}
            disabled={saving || !date}
          >
            {saving ? t("action.saving") : t("log.save")}
          </button>
        </>
      }
    >
      <div className="form-grid">
        <FieldGroup label={t("field.type")}>
          <div className="row wrap" style={{ gap: 6 }}>
            {INTERACTION_TYPES.map((kind) => (
              <button
                key={kind}
                className={`btn btn-sm${type === kind ? " btn-blue" : ""}`}
                aria-pressed={type === kind}
                onClick={() => setType(kind)}
                type="button"
              >
                <InteractionIcon type={kind} />
                {t(`interactionLabel.${kind}`)}
              </button>
            ))}
          </div>
        </FieldGroup>
        <Field label={t("field.date")}>
          <div className="row">
            <CalendarDays size={15} className="muted-icon" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
        </Field>
        <Field label={t("log.notesPlaceholder")} wide>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("log.notesLabel")}
          />
        </Field>
      </div>
    </Modal>
  );
}
