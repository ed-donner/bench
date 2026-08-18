import { useState } from "react";
import { Cake } from "lucide-react";
import { api } from "../../api";
import type { ImportantDateType } from "../../types";
import { DATE_TYPES } from "../../types";
import { Modal } from "../Modal";
import { Field } from "../Field";
import { useTranslation } from "react-i18next";

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/** Why a year is optional: plenty of birthdays are known as a day and month and nothing more. */
export default function AddDateModal({
  personId,
  onClose,
  onSaved,
}: {
  personId: number;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const { t } = useTranslation("rolodex");
  const [type, setType] = useState<ImportantDateType>("birthday");
  const [label, setLabel] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    const m = Number(month);
    const d = Number(day);
    if (!m || !d || d < 1 || d > 31) {
      setError(t("addDate.invalidDay"));
      return;
    }
    const y = year ? Number(year) : null;
    if (y != null && (y < 1850 || y > 2100)) {
      setError(t("addDate.yearOff"));
      return;
    }
    setBusy(true);
    try {
      await api.addDate(personId, {
        type,
        label: label.trim() || null,
        month: m,
        day: d,
        year: y,
      });
      await onSaved();
      onClose();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  const labelHint =
    type === "child_birthday" || type === "other"
      ? t("addDate.labelChild")
      : t("addDate.labelOptional");

  return (
    <Modal
      title={t("addDate.title")}
      icon={<Cake size={17} className="modal-icon amber" />}
      onClose={onClose}
      footer={
        <>
          {error && <span className="form-error">{error}</span>}
          <button className="btn" onClick={onClose}>
            {t("action.cancel")}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => void save()}
            disabled={busy}
          >
            {t("addDate.saveDate")}
          </button>
        </>
      }
    >
      <div className="form-grid">
        <Field label={t("field.type")}>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ImportantDateType)}
          >
            {DATE_TYPES.map((kind) => (
              <option key={kind} value={kind}>
                {t(`dateType.${kind}`)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={labelHint}>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={
              type === "child_birthday" ? t("addDate.exampleLabel") : ""
            }
          />
        </Field>
        <Field label={t("addDate.day")}>
          <input
            type="number"
            min={1}
            max={31}
            value={day}
            onChange={(e) => setDay(e.target.value)}
            placeholder="14"
          />
        </Field>
        <Field label={t("addDate.monthLabel")}>
          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            <option value="">—</option>
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {t(`addDate.month.${m}`)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("addDate.yearOptional")} hint={t("addDate.yearHint")}>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="1990"
          />
        </Field>
      </div>
    </Modal>
  );
}
