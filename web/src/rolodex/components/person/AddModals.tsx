/** The quick-add modals on a person's page: news, a fact, a reminder, a gift. */
import { useState } from "react";
import { Bell, Gift, Megaphone, Sparkles } from "lucide-react";
import { useLocale } from "../../../shared/useLocale";
import { api } from "../../api";
import type { GiftKind, PersonComputed } from "../../types";
import { Modal } from "../Modal";
import { Field } from "../Field";
import { todayISO } from "../../format";

interface AddProps {
  personId: number;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

function SaveFooter({
  label,
  disabled,
  onSave,
  onClose,
  t,
}: {
  label: string;
  disabled: boolean;
  onSave: () => Promise<void>;
  onClose: () => void;
  t: ReturnType<typeof useLocale>["t"];
}) {
  const [busy, setBusy] = useState(false);
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
  const { t } = useLocale();
  const [text, setText] = useState("");
  const save = async () => {
    await api.addNews(person.id, text.trim());
    await onSaved();
    onClose();
  };
  return (
    <Modal
      title={t("addNews.title", { name: person.name.split(" ")[0] })}
      icon={<Megaphone size={17} className="modal-icon purple" />}
      onClose={onClose}
      footer={
        <SaveFooter
          label={t("addNews.save")}
          disabled={!text.trim()}
          onSave={save}
          onClose={onClose}
          t={t}
        />
      }
    >
      <Field label={t("addNews.label")} hint={t("addNews.hint")}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("addNews.placeholder")}
        />
      </Field>
    </Modal>
  );
}

export function AddFactModal({ personId, onClose, onSaved }: AddProps) {
  const { t } = useLocale();
  const [text, setText] = useState("");
  const save = async () => {
    await api.addFact(personId, text.trim());
    await onSaved();
    onClose();
  };
  return (
    <Modal
      title={t("addFact.title")}
      icon={<Sparkles size={17} className="modal-icon amber" />}
      onClose={onClose}
      footer={
        <SaveFooter
          label={t("addFact.save")}
          disabled={!text.trim()}
          onSave={save}
          onClose={onClose}
          t={t}
        />
      }
    >
      <Field label={t("addFact.label")} hint={t("addFact.hint")}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("addFact.placeholder")}
        />
      </Field>
    </Modal>
  );
}

export function AddReminderModal({ personId, onClose, onSaved }: AddProps) {
  const { t } = useLocale();
  const [text, setText] = useState("");
  const [due, setDue] = useState(todayISO());
  const save = async () => {
    await api.addReminder(personId, text.trim(), due);
    await onSaved();
    onClose();
  };
  return (
    <Modal
      title={t("addReminder.title")}
      icon={<Bell size={17} className="modal-icon blue" />}
      onClose={onClose}
      footer={
        <SaveFooter
          label={t("addReminder.save")}
          disabled={!text.trim() || !due}
          onSave={save}
          onClose={onClose}
          t={t}
        />
      }
    >
      <div className="form-grid">
        <Field label={t("addReminder.label")} wide>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("addReminder.placeholder")}
          />
        </Field>
        <Field
          label={t("addReminder.dueDate")}
          wide
          hint={t("addReminder.dueHint")}
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
  const { t } = useLocale();
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
      title={t("addGift.title")}
      icon={<Gift size={17} className="modal-icon purple" />}
      onClose={onClose}
      footer={
        <SaveFooter
          label={t("addGift.save")}
          disabled={!name.trim()}
          onSave={save}
          onClose={onClose}
          t={t}
        />
      }
    >
      <div className="form-grid">
        <Field label={t("addGift.what")} wide>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("addGift.placeholder")}
          />
        </Field>
        <Field label={t("addGift.kind")}>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as GiftKind)}
          >
            <option value="idea">{t("addGift.kindIdea")}</option>
            <option value="given">{t("addGift.kindGiven")}</option>
            <option value="received">{t("addGift.kindReceived")}</option>
          </select>
        </Field>
        <Field label={t("addGift.occasion")}>
          <input
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            placeholder={t("addGift.occasionPlaceholder")}
          />
        </Field>
      </div>
    </Modal>
  );
}
