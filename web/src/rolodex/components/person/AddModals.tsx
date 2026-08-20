/** The quick-add modals on a person's page: news, a fact, a reminder, a gift. */
import { useState } from "react";
import { Bell, Gift, Megaphone, Sparkles } from "lucide-react";
import { useT } from "../../../shared/useLocale";
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
}: {
  label: string;
  disabled: boolean;
  onSave: () => Promise<void>;
  onClose: () => void;
}) {
  const t = useT("rolodex");
  const [busy, setBusy] = useState(false);
  return (
    <>
      <button className="btn" onClick={onClose}>
        {t("cancel")}
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
  const t = useT("rolodex");
  const [text, setText] = useState("");
  const save = async () => {
    await api.addNews(person.id, text.trim());
    await onSaved();
    onClose();
  };
  return (
    <Modal
      title={t.i("recordNews", { name: person.name.split(" ")[0] })}
      icon={<Megaphone size={17} className="modal-icon purple" />}
      onClose={onClose}
      footer={
        <SaveFooter
          label={t("saveNews")}
          disabled={!text.trim()}
          onSave={save}
          onClose={onClose}
        />
      }
    >
      <Field label={t("whatsNew")} hint={t("newsHint")}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("newsPlaceholder")}
        />
      </Field>
    </Modal>
  );
}

export function AddFactModal({ personId, onClose, onSaved }: AddProps) {
  const t = useT("rolodex");
  const [text, setText] = useState("");
  const save = async () => {
    await api.addFact(personId, text.trim());
    await onSaved();
    onClose();
  };
  return (
    <Modal
      title={t("addFactTitle")}
      icon={<Sparkles size={17} className="modal-icon amber" />}
      onClose={onClose}
      footer={
        <SaveFooter
          label={t("saveFact")}
          disabled={!text.trim()}
          onSave={save}
          onClose={onClose}
        />
      }
    >
      <Field label={t("factLabel")} hint={t("factHint")}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("factPlaceholder")}
        />
      </Field>
    </Modal>
  );
}

export function AddReminderModal({ personId, onClose, onSaved }: AddProps) {
  const t = useT("rolodex");
  const [text, setText] = useState("");
  const [due, setDue] = useState(todayISO());
  const save = async () => {
    await api.addReminder(personId, text.trim(), due);
    await onSaved();
    onClose();
  };
  return (
    <Modal
      title={t("setReminder")}
      icon={<Bell size={17} className="modal-icon blue" />}
      onClose={onClose}
      footer={
        <SaveFooter
          label={t("saveReminder")}
          disabled={!text.trim() || !due}
          onSave={save}
          onClose={onClose}
        />
      }
    >
      <div className="form-grid">
        <Field label={t("whatNeedsDoing")} wide>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("reminderPlaceholder")}
          />
        </Field>
        <Field label={t("dueDate")} wide hint={t("reminderDueHint")}>
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
  const t = useT("rolodex");
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
      title={t("addGiftTitle")}
      icon={<Gift size={17} className="modal-icon purple" />}
      onClose={onClose}
      footer={
        <SaveFooter
          label={t("saveGift")}
          disabled={!name.trim()}
          onSave={save}
          onClose={onClose}
        />
      }
    >
      <div className="form-grid">
        <Field label={t("giftWhat")} wide>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("giftPlaceholder")}
          />
        </Field>
        <Field label={t("giftKind")}>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as GiftKind)}
          >
            <option value="idea">{t("giftIdea")}</option>
            <option value="given">{t("giftGiven")}</option>
            <option value="received">{t("giftReceived")}</option>
          </select>
        </Field>
        <Field label={t("occasion")}>
          <input
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            placeholder={t("dateBirthday")}
          />
        </Field>
      </div>
    </Modal>
  );
}
