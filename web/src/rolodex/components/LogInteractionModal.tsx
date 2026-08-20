import { useState } from "react";
import { CalendarDays, Phone } from "lucide-react";
import { useT } from "../../shared/useLocale";
import type { InteractionType, PersonComputed } from "../types";
import { INTERACTION_TYPES } from "../types";
import { api } from "../api";
import { Modal } from "./Modal";
import { Field, FieldGroup } from "./Field";
import InteractionIcon from "./InteractionIcon";
import { todayISO } from "../format";
import { interactionMeta } from "../i18n";
import { useToast } from "../store";

export function LogInteractionModal({
  person,
  onClose,
  onSaved,
}: {
  person: PersonComputed;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const t = useT("rolodex");
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
        t.i("loggedInteraction", {
          type: interactionMeta(t, type).label.toLowerCase(),
          name: firstName,
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
      title={t.i("logWith", { name: firstName })}
      icon={<Phone size={17} className="modal-icon blue" />}
      onClose={onClose}
      footer={
        <>
          {error && <span className="form-error">{error}</span>}
          <button className="btn" onClick={onClose}>
            {t("cancel")}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => void save()}
            disabled={saving || !date}
          >
            {saving ? t("saving") : t("saveInteraction")}
          </button>
        </>
      }
    >
      <div className="form-grid">
        <FieldGroup label={t("interactionType")}>
          <div className="row wrap" style={{ gap: 6 }}>
            {INTERACTION_TYPES.map((interactionType) => (
              <button
                key={interactionType}
                className={`btn btn-sm${type === interactionType ? " btn-blue" : ""}`}
                aria-pressed={type === interactionType}
                onClick={() => setType(interactionType)}
                type="button"
              >
                <InteractionIcon type={interactionType} />
                {interactionMeta(t, interactionType).label}
              </button>
            ))}
          </div>
        </FieldGroup>
        <Field label={t("interactionDate")}>
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
        <Field label={t("talkAbout")} wide>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("talkPlaceholder")}
          />
        </Field>
      </div>
    </Modal>
  );
}
