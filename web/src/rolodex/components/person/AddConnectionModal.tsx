import { useState } from "react";
import { Link2 } from "lucide-react";
import { api } from "../../api";
import type { ConnectionKind, PersonComputed } from "../../types";
import { Modal } from "../Modal";
import { Field, FieldGroup } from "../Field";
import { useT } from "../../../shared/useLocale";
import type { MessageKey } from "../../../shared/i18n";

const KIND_OPTIONS: { value: ConnectionKind; labelKey: MessageKey }[] = [
  { value: "partner", labelKey: "rolodex.connection.partner" },
  { value: "parent_child", labelKey: "rolodex.connection.parent_child" },
  { value: "sibling", labelKey: "rolodex.connection.sibling" },
  { value: "colleague", labelKey: "rolodex.connection.colleague" },
  { value: "other", labelKey: "rolodex.connection.other" },
];

/** A free-text connection reads from one side only, so each side gets its own wording. */
function sideLabel(text: string, otherName: string): string {
  return text.trim()
    ? `${text.trim()} ${otherName}`
    : `Connected to ${otherName}`;
}

export default function AddConnectionModal({
  person,
  people,
  onClose,
  onSaved,
}: {
  person: PersonComputed;
  people: PersonComputed[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const t = useT();
  const others = people.filter((p) => p.id !== person.id);
  const [otherId, setOtherId] = useState<number | "">("");
  const [kind, setKind] = useState<ConnectionKind>("partner");
  const [aIsParent, setAIsParent] = useState(true);
  const [label, setLabel] = useState("");
  const [inverseLabel, setInverseLabel] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const otherName = others.find((p) => p.id === otherId)?.name ?? "";
  const firstName = person.name.split(" ")[0];
  const otherFirstName = otherName ? otherName.split(" ")[0] : "their";

  const save = async () => {
    if (!otherId) {
      setError(t("rolodex.addConnection.errorPickPerson"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.addConnection(person.id, {
        other_id: otherId,
        kind,
        a_is_parent: kind === "parent_child" ? aIsParent : false,
        label: kind === "other" ? sideLabel(label, otherName) : null,
        inverse_label:
          kind === "other" ? sideLabel(inverseLabel, person.name) : null,
        note: kind === "colleague" && note.trim() ? note.trim() : null,
      });
      await onSaved();
      onClose();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <Modal
      title={t("rolodex.addConnection.title", { firstName })}
      icon={<Link2 size={17} className="modal-icon blue" />}
      onClose={onClose}
      footer={
        <>
          {error && <span className="form-error">{error}</span>}
          <button className="btn" onClick={onClose}>
            {t("shared.common.cancel")}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => void save()}
            disabled={busy}
          >
            {t("rolodex.addConnection.save")}
          </button>
        </>
      }
    >
      <div className="form-grid">
        <Field label={t("rolodex.addConnection.person")} wide>
          <select
            value={otherId}
            onChange={(e) => setOtherId(Number(e.target.value) || "")}
          >
            <option value="">{t("rolodex.addConnection.choose")}</option>
            {others.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("rolodex.addConnection.relationship")} wide>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as ConnectionKind)}
          >
            {KIND_OPTIONS.map((k) => (
              <option key={k.value} value={k.value}>
                {t(k.labelKey)}
              </option>
            ))}
          </select>
        </Field>
        {kind === "parent_child" && otherId !== "" && (
          <FieldGroup label={t("rolodex.addConnection.whoParent")} wide>
            <div className="row" style={{ gap: 14 }}>
              <label className="row radio-option">
                <input
                  type="radio"
                  name="parent"
                  checked={aIsParent}
                  onChange={() => setAIsParent(true)}
                />
                {t("rolodex.addConnection.aIsParent", { name: person.name })}
              </label>
              <label className="row radio-option">
                <input
                  type="radio"
                  name="parent"
                  checked={!aIsParent}
                  onChange={() => setAIsParent(false)}
                />
                {t("rolodex.addConnection.bIsParent", { name: otherName })}
              </label>
            </div>
          </FieldGroup>
        )}
        {kind === "colleague" && (
          <Field label={t("rolodex.addConnection.whereOptional")} wide>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("rolodex.addConnection.wherePlaceholder")}
            />
          </Field>
        )}
        {kind === "other" && (
          <>
            <Field label={t("rolodex.addConnection.onPageA", { firstName })}>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={t("rolodex.addConnection.placeholderA", {
                  name: otherName || "…",
                })}
              />
            </Field>
            <Field
              label={t("rolodex.addConnection.onPageB", {
                firstName: otherFirstName,
              })}
            >
              <input
                value={inverseLabel}
                onChange={(e) => setInverseLabel(e.target.value)}
                placeholder={t("rolodex.addConnection.placeholderB", {
                  name: firstName,
                })}
              />
            </Field>
          </>
        )}
      </div>
      <div className="hint modal-hint">{t("rolodex.addConnection.hint")}</div>
    </Modal>
  );
}
