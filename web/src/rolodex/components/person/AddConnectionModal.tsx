import { useState } from "react";
import { Link2 } from "lucide-react";
import { useLocale } from "../../../shared/useLocale";
import { api } from "../../api";
import type { ConnectionKind, PersonComputed } from "../../types";
import { Modal } from "../Modal";
import { Field, FieldGroup } from "../Field";

function sideLabel(
  t: ReturnType<typeof useLocale>["t"],
  text: string,
  otherName: string,
): string {
  return text.trim()
    ? `${text.trim()} ${otherName}`
    : t("addConnection.connectedTo", { name: otherName });
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
  const { t } = useLocale();
  const others = people.filter((p) => p.id !== person.id);
  const [otherId, setOtherId] = useState<number | "">("");
  const [kind, setKind] = useState<ConnectionKind>("partner");
  const [aIsParent, setAIsParent] = useState(true);
  const [label, setLabel] = useState("");
  const [inverseLabel, setInverseLabel] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const kindOptions: { value: ConnectionKind; labelKey: string }[] = [
    { value: "partner", labelKey: "addConnection.partner" },
    { value: "parent_child", labelKey: "addConnection.parentChild" },
    { value: "sibling", labelKey: "addConnection.sibling" },
    { value: "colleague", labelKey: "addConnection.colleague" },
    { value: "other", labelKey: "addConnection.other" },
  ];

  const otherName = others.find((p) => p.id === otherId)?.name ?? "";

  const save = async () => {
    if (!otherId) {
      setError(t("addConnection.pickPerson"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.addConnection(person.id, {
        other_id: otherId,
        kind,
        a_is_parent: kind === "parent_child" ? aIsParent : false,
        label: kind === "other" ? sideLabel(t, label, otherName) : null,
        inverse_label:
          kind === "other" ? sideLabel(t, inverseLabel, person.name) : null,
        note: kind === "colleague" && note.trim() ? note.trim() : null,
      });
      await onSaved();
      onClose();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  const firstName = person.name.split(" ")[0];
  const otherFirst = otherName ? otherName.split(" ")[0] : "their";

  return (
    <Modal
      title={t("addConnection.title", { name: firstName })}
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
            {t("addConnection.save")}
          </button>
        </>
      }
    >
      <div className="form-grid">
        <Field label={t("addConnection.person")} wide>
          <select
            value={otherId}
            onChange={(e) => setOtherId(Number(e.target.value) || "")}
          >
            <option value="">{t("common.choose")}</option>
            {others.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("addConnection.relationship")} wide>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as ConnectionKind)}
          >
            {kindOptions.map((k) => (
              <option key={k.value} value={k.value}>
                {t(k.labelKey)}
              </option>
            ))}
          </select>
        </Field>
        {kind === "parent_child" && otherId !== "" && (
          <FieldGroup label={t("addConnection.whoParent")} wide>
            <div className="row" style={{ gap: 14 }}>
              <label className="row radio-option">
                <input
                  type="radio"
                  name="parent"
                  checked={aIsParent}
                  onChange={() => setAIsParent(true)}
                />
                {t("addConnection.isParent", { name: person.name })}
              </label>
              <label className="row radio-option">
                <input
                  type="radio"
                  name="parent"
                  checked={!aIsParent}
                  onChange={() => setAIsParent(false)}
                />
                {t("addConnection.isParent", { name: otherName })}
              </label>
            </div>
          </FieldGroup>
        )}
        {kind === "colleague" && (
          <Field label={t("addConnection.whereOptional")} wide>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("addConnection.wherePlaceholder")}
            />
          </Field>
        )}
        {kind === "other" && (
          <>
            <Field label={t("addConnection.onPage", { name: firstName })}>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={t("addConnection.introPlaceholder", {
                  name: otherName || "…",
                })}
              />
            </Field>
            <Field label={t("addConnection.onPage", { name: otherFirst })}>
              <input
                value={inverseLabel}
                onChange={(e) => setInverseLabel(e.target.value)}
                placeholder={t("addConnection.introPlaceholder", {
                  name: firstName,
                })}
              />
            </Field>
          </>
        )}
      </div>
      <div className="hint modal-hint">{t("addConnection.hint")}</div>
    </Modal>
  );
}
