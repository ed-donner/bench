/** The quick-add modals on a person's page: news, a fact, a reminder, a gift. */
import { useState } from "react";
import { Bell, Gift, Megaphone, Sparkles } from "lucide-react";
import { api } from "../../api";
import type { GiftKind, PersonComputed } from "../../types";
import { Modal } from "../Modal";
import { Field } from "../Field";
import { todayISO } from "../../format";
import { useT } from "../../../shared/useLocale";

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
  const t = useT();
  const [busy, setBusy] = useState(false);
  return (
    <>
      <button className="btn" onClick={onClose}>
        {t("shared.common.cancel")}
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
      title={t("rolodex.addNews.title", {
        firstName: person.name.split(" ")[0],
      })}
      icon={<Megaphone size={17} className="modal-icon purple" />}
      onClose={onClose}
      footer={
        <SaveFooter
          label={t("rolodex.addNews.save")}
          disabled={!text.trim()}
          onSave={save}
          onClose={onClose}
        />
      }
    >
      <Field
        label={t("rolodex.addNews.label")}
        hint={t("rolodex.addNews.hint")}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("rolodex.addNews.placeholder")}
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
      title={t("rolodex.addFact.title")}
      icon={<Sparkles size={17} className="modal-icon amber" />}
      onClose={onClose}
      footer={
        <SaveFooter
          label={t("rolodex.addFact.save")}
          disabled={!text.trim()}
          onSave={save}
          onClose={onClose}
        />
      }
    >
      <Field
        label={t("rolodex.addFact.label")}
        hint={t("rolodex.addFact.hint")}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("rolodex.addFact.placeholder")}
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
      title={t("rolodex.addReminder.title")}
      icon={<Bell size={17} className="modal-icon blue" />}
      onClose={onClose}
      footer={
        <SaveFooter
          label={t("rolodex.addReminder.save")}
          disabled={!text.trim() || !due}
          onSave={save}
          onClose={onClose}
        />
      }
    >
      <div className="form-grid">
        <Field label={t("rolodex.addReminder.what")} wide>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("rolodex.addReminder.whatPlaceholder")}
          />
        </Field>
        <Field
          label={t("rolodex.addReminder.due")}
          wide
          hint={t("rolodex.addReminder.dueHint")}
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
      title={t("rolodex.addGift.title")}
      icon={<Gift size={17} className="modal-icon purple" />}
      onClose={onClose}
      footer={
        <SaveFooter
          label={t("rolodex.addGift.save")}
          disabled={!name.trim()}
          onSave={save}
          onClose={onClose}
        />
      }
    >
      <div className="form-grid">
        <Field label={t("rolodex.addGift.what")} wide>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("rolodex.addGift.whatPlaceholder")}
          />
        </Field>
        <Field label={t("rolodex.addGift.kind")}>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as GiftKind)}
          >
            <option value="idea">{t("rolodex.giftKind.ideaOption")}</option>
            <option value="given">{t("rolodex.giftKind.givenOption")}</option>
            <option value="received">
              {t("rolodex.giftKind.receivedOption")}
            </option>
          </select>
        </Field>
        <Field label={t("rolodex.addGift.occasion")}>
          <input
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            placeholder={t("rolodex.addGift.occasionPlaceholder")}
          />
        </Field>
      </div>
    </Modal>
  );
}
