/** The quick-add modals on a person's page: news, a fact, a reminder, a gift. */
import { useState } from "react";
import { Bell, Gift, Megaphone, Sparkles } from "lucide-react";
import { api } from "../../api";
import type { GiftKind, PersonComputed } from "../../types";
import { Modal } from "../Modal";
import { Field } from "../Field";
import { todayISO } from "../../format";
import { useT } from "../../strings";

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
  const [busy, setBusy] = useState(false);
  const t = useT();
  return (
    <>
      <button className="btn" onClick={onClose}>
        {t("common.cancel")}
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
  const t = useT();
  const [text, setText] = useState("");
  const save = async () => {
    await api.addNews(person.id, text.trim());
    await onSaved();
    onClose();
  };
  return (
    <Modal
      title={t("news.title", { name: person.name.split(" ")[0] })}
      icon={<Megaphone size={17} className="modal-icon purple" />}
      onClose={onClose}
      footer={
        <SaveFooter
          label={t("news.save")}
          disabled={!text.trim()}
          onSave={save}
          onClose={onClose}
        />
      }
    >
      <Field label={t("news.label")} hint={t("news.hint")}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("news.placeholder")}
        />
      </Field>
    </Modal>
  );
}

export function AddFactModal({ personId, onClose, onSaved }: AddProps) {
  const t = useT();
  const [text, setText] = useState("");
  const save = async () => {
    await api.addFact(personId, text.trim());
    await onSaved();
    onClose();
  };
  return (
    <Modal
      title={t("fact.title")}
      icon={<Sparkles size={17} className="modal-icon amber" />}
      onClose={onClose}
      footer={
        <SaveFooter
          label={t("fact.save")}
          disabled={!text.trim()}
          onSave={save}
          onClose={onClose}
        />
      }
    >
      <Field label={t("fact.label")} hint={t("fact.hint")}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("fact.placeholder")}
        />
      </Field>
    </Modal>
  );
}

export function AddReminderModal({ personId, onClose, onSaved }: AddProps) {
  const t = useT();
  const [text, setText] = useState("");
  const [due, setDue] = useState(todayISO());
  const save = async () => {
    await api.addReminder(personId, text.trim(), due);
    await onSaved();
    onClose();
  };
  return (
    <Modal
      title={t("reminder.title")}
      icon={<Bell size={17} className="modal-icon blue" />}
      onClose={onClose}
      footer={
        <SaveFooter
          label={t("reminder.save")}
          disabled={!text.trim() || !due}
          onSave={save}
          onClose={onClose}
        />
      }
    >
      <div className="form-grid">
        <Field label={t("reminder.label")} wide>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("reminder.placeholder")}
          />
        </Field>
        <Field label={t("reminder.due")} wide hint={t("reminder.hint")}>
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
  const t = useT();
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
      title={t("giftForm.title")}
      icon={<Gift size={17} className="modal-icon purple" />}
      onClose={onClose}
      footer={
        <SaveFooter
          label={t("giftForm.save")}
          disabled={!name.trim()}
          onSave={save}
          onClose={onClose}
        />
      }
    >
      <div className="form-grid">
        <Field label={t("giftForm.what")} wide>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("giftForm.placeholder")}
          />
        </Field>
        <Field label={t("giftForm.kind")}>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as GiftKind)}
          >
            <option value="idea">{t("giftForm.idea")}</option>
            <option value="given">{t("giftForm.given")}</option>
            <option value="received">{t("giftForm.received")}</option>
          </select>
        </Field>
        <Field label={t("giftForm.occasion")}>
          <input
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            placeholder={t("dateType.birthday")}
          />
        </Field>
      </div>
    </Modal>
  );
}
