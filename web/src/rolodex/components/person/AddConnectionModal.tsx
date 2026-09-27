import { useState } from "react";
import { Link2 } from "lucide-react";
import { api } from "../../api";
import type { ConnectionKind, PersonComputed } from "../../types";
import { Modal } from "../Modal";
import { Field, FieldGroup } from "../Field";
import { errorMessage } from "../../format";
import { useT } from "../../strings";

const KINDS: ConnectionKind[] = [
  "partner",
  "parent_child",
  "sibling",
  "colleague",
  "other",
];

/** A free-text connection reads from one side only, so each side gets its own wording. Left
    blank, nothing is stored and the page says "Connected to" in whichever language it is in. */
function sideLabel(text: string, otherName: string): string | null {
  return text.trim() ? `${text.trim()} ${otherName}` : null;
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

  const save = async () => {
    if (!otherId) {
      setError(t("connForm.pick"));
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
      setError(errorMessage(e));
      setBusy(false);
    }
  };

  const firstName = person.name.split(" ")[0];
  return (
    <Modal
      title={t("connForm.title", { name: firstName })}
      icon={<Link2 size={17} className="modal-icon blue" />}
      onClose={onClose}
      footer={
        <>
          {error && <span className="form-error">{error}</span>}
          <button className="btn" onClick={onClose}>
            {t("common.cancel")}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => void save()}
            disabled={busy}
          >
            {t("connForm.save")}
          </button>
        </>
      }
    >
      <div className="form-grid">
        <Field label={t("people.col.person")} wide>
          <select
            value={otherId}
            onChange={(e) => setOtherId(Number(e.target.value) || "")}
          >
            <option value="">{t("connForm.choose")}</option>
            {others.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("connForm.relationship")} wide>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as ConnectionKind)}
          >
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {t(`connForm.kind.${k}`)}
              </option>
            ))}
          </select>
        </Field>
        {kind === "parent_child" && otherId !== "" && (
          <FieldGroup label={t("connForm.whoParent")} wide>
            <div className="row" style={{ gap: 14 }}>
              <label className="row radio-option">
                <input
                  type="radio"
                  name="parent"
                  checked={aIsParent}
                  onChange={() => setAIsParent(true)}
                />
                {t("connForm.isParent", { name: person.name })}
              </label>
              <label className="row radio-option">
                <input
                  type="radio"
                  name="parent"
                  checked={!aIsParent}
                  onChange={() => setAIsParent(false)}
                />
                {t("connForm.isParent", { name: otherName })}
              </label>
            </div>
          </FieldGroup>
        )}
        {kind === "colleague" && (
          <Field label={t("connForm.where")} wide>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("connForm.wherePlaceholder")}
            />
          </Field>
        )}
        {kind === "other" && (
          <>
            <Field label={t("connForm.onPage", { name: firstName })}>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={t("connForm.example", { name: otherName || "…" })}
              />
            </Field>
            <Field
              label={
                otherName
                  ? t("connForm.onPage", { name: otherName.split(" ")[0] })
                  : t("connForm.onTheirPage")
              }
            >
              <input
                value={inverseLabel}
                onChange={(e) => setInverseLabel(e.target.value)}
                placeholder={t("connForm.example", { name: firstName })}
              />
            </Field>
          </>
        )}
      </div>
      <div className="hint modal-hint">{t("connForm.hint")}</div>
    </Modal>
  );
}
