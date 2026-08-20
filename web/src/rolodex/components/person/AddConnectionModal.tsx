import { useState } from "react";
import { Link2 } from "lucide-react";
import { useT } from "../../../shared/useLocale";
import { api } from "../../api";
import type { ConnectionKind, PersonComputed } from "../../types";
import { Modal } from "../Modal";
import { Field, FieldGroup } from "../Field";
import type { MessageKey } from "../../../shared/locales";

const KIND_OPTIONS: {
  value: ConnectionKind;
  labelKey: MessageKey<"rolodex">;
}[] = [
  { value: "partner", labelKey: "connPartner" },
  { value: "parent_child", labelKey: "connParentChild" },
  { value: "sibling", labelKey: "connSibling" },
  { value: "colleague", labelKey: "connColleague" },
  { value: "other", labelKey: "connOther" },
];

function sideLabel(
  t: ReturnType<typeof useT<"rolodex">>,
  text: string,
  otherName: string,
): string {
  return text.trim()
    ? `${text.trim()} ${otherName}`
    : t.i("connectedTo", { name: otherName });
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
  const t = useT("rolodex");
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
      setError(t("pickPersonConnect"));
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
  const otherFirst = otherName ? otherName.split(" ")[0] : "";

  return (
    <Modal
      title={t.i("connectTo", { name: firstName })}
      icon={<Link2 size={17} className="modal-icon blue" />}
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
            disabled={busy}
          >
            {t("saveConnection")}
          </button>
        </>
      }
    >
      <div className="form-grid">
        <Field label={t("personColumn")} wide>
          <select
            value={otherId}
            onChange={(e) => setOtherId(Number(e.target.value) || "")}
          >
            <option value="">{t("choosePerson")}</option>
            {others.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("relationship")} wide>
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
          <FieldGroup label={t("whoIsParent")} wide>
            <div className="row" style={{ gap: 14 }}>
              <label className="row radio-option">
                <input
                  type="radio"
                  name="parent"
                  checked={aIsParent}
                  onChange={() => setAIsParent(true)}
                />
                {t.i("isParent", { name: person.name })}
              </label>
              <label className="row radio-option">
                <input
                  type="radio"
                  name="parent"
                  checked={!aIsParent}
                  onChange={() => setAIsParent(false)}
                />
                {t.i("isParent", { name: otherName })}
              </label>
            </div>
          </FieldGroup>
        )}
        {kind === "colleague" && (
          <Field label={t("whereOptional")} wide>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("wherePlaceholder")}
            />
          </Field>
        )}
        {kind === "other" && (
          <>
            <Field label={t.i("onPage", { name: firstName })}>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={t.i("connectIntroPlaceholder", {
                  name: otherName || "…",
                })}
              />
            </Field>
            <Field
              label={t.i("onTheirPage", {
                name: otherFirst || t("choosePerson"),
              })}
            >
              <input
                value={inverseLabel}
                onChange={(e) => setInverseLabel(e.target.value)}
                placeholder={t.i("connectIntroPlaceholder", {
                  name: firstName,
                })}
              />
            </Field>
          </>
        )}
      </div>
      <div className="hint modal-hint">{t("connectionHint")}</div>
    </Modal>
  );
}
