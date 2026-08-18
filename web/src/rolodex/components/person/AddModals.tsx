/** The quick-add modals on a person's page: news, a fact, a reminder, a gift. */
import { useState } from "react";
import { Bell, Gift, Megaphone, Sparkles } from "lucide-react";
import { api } from "../../api";
import type { GiftKind, PersonComputed } from "../../types";
import { Modal } from "../Modal";
import { Field } from "../Field";
import { todayISO } from "../../format";
import { useTranslation } from "react-i18next";

interface AddProps {
  personId: number;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

/** Shared footer: cancel, then a save that is disabled until the form has something in it. */
function SaveFooter({
  label,
  disabled,
  onSave,
  onClose,
}: {
  label: string;
  disabled: boolean;
  onSave: () => Promise<void>;
  onClose: () => void;
}) {
  const { t } = useTranslation("rolodex");
  const [busy, setBusy] = useState(false);
  return (
    <>
      <button className="btn" onClick={onClose}>
        {t("action.cancel")}
      </button>
      <button
        className="btn btn-primary"
        disabled={disabled || busy}
        onClick={() => {
          setBusy(true);
          void onSave().finally(() => {
            setBusy(false);
          });
        }}
      >
        {label}
      </button>
    </>
  );
}

export function AddNewsModal({
  person,
  onClose,
  onSaved,
}: Omit<AddProps, "personId"> & { person: PersonComputed }) {
  const { t } = useTranslation("rolodex");
  const [text, setText] = useState("");
  const save = async () => {
    await api.addNews(person.id, text.trim());
    await onSaved();
    onClose();
  };
  return (
    <Modal
      title={t("addModals.newsTitle", { firstName: person.name.split(" ")[0] })}
      icon={<Megaphone size={17} className="modal-icon purple" />}
      onClose={onClose}
      footer={
        <SaveFooter
          label={t("addModals.saveNews")}
          disabled={!text.trim()}
          onSave={save}
          onClose={onClose}
        />
      }
    >
      <Field label={t("addModals.news")} hint={t("addModals.newsHint")}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("addModals.newsPlaceholder")}
        />
      </Field>
    </Modal>
  );
}

export function AddFactModal({ personId, onClose, onSaved }: AddProps) {
  const { t } = useTranslation("rolodex");
  const [text, setText] = useState("");
  const save = async () => {
    await api.addFact(personId, text.trim());
    await onSaved();
    onClose();
  };
  return (
    <Modal
      title={t("addModals.fact")}
      icon={<Sparkles size={17} className="modal-icon amber" />}
      onClose={onClose}
      footer={
        <SaveFooter
          label={t("addModals.saveFact")}
          disabled={!text.trim()}
          onSave={save}
          onClose={onClose}
        />
      }
    >
      <Field label={t("addModals.factLabel")} hint={t("addModals.factHint")}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("addModals.factPlaceholder")}
        />
      </Field>
    </Modal>
  );
}

export function AddReminderModal({ personId, onClose, onSaved }: AddProps) {
  const { t } = useTranslation("rolodex");
  const [text, setText] = useState("");
  const [due, setDue] = useState(todayISO());
  const save = async () => {
    await api.addReminder(personId, text.trim(), due);
    await onSaved();
    onClose();
  };
  return (
    <Modal
      title={t("addModals.reminder")}
      icon={<Bell size={17} className="modal-icon blue" />}
      onClose={onClose}
      footer={
        <SaveFooter
          label={t("addModals.saveReminder")}
          disabled={!text.trim() || !due}
          onSave={save}
          onClose={onClose}
        />
      }
    >
      <div className="form-grid">
        <Field label={t("addModals.reminderLabel")} wide>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("addModals.reminderPlaceholder")}
          />
        </Field>
        <Field
          label={t("addModals.dueDate")}
          wide
          hint={t("addModals.reminderHint")}
        >
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}

export function AddGiftModal({ personId, onClose, onSaved }: AddProps) {
  const { t } = useTranslation("rolodex");
  const [name, setName] = useState("");
  const [kind, setKind] = useState<GiftKind>("idea");
  const [occasion, setOccasion] = useState("");
  const save = async () => {
    await api.addGift(personId, {
      name: name.trim(),
      kind,
      occasion: occasion.trim() || null,
      date: todayISO(),
    });
    await onSaved();
    onClose();
  };
  return (
    <Modal
      title={t("addModals.gift")}
      icon={<Gift size={17} className="modal-icon purple" />}
      onClose={onClose}
      footer={
        <SaveFooter
          label={t("addModals.saveGift")}
          disabled={!name.trim()}
          onSave={save}
          onClose={onClose}
        />
      }
    >
      <div className="form-grid">
        <Field label={t("addModals.giftLabel")} wide>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("addModals.giftPlaceholder")}
          />
        </Field>
        <Field label={t("addModals.kind")}>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as GiftKind)}
          >
            <option value="idea">{t("addModals.giftIdea")}</option>
            <option value="given">{t("addModals.giftGiven")}</option>
            <option value="received">{t("addModals.giftReceived")}</option>
          </select>
        </Field>
        <Field label={t("addModals.occasion")}>
          <input
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            placeholder={t("field.birthday")}
          />
        </Field>
      </div>
    </Modal>
  );
}
