import { useState } from "react";
import { Cake } from "lucide-react";
import { api } from "../../api";
import type { ImportantDateType } from "../../types";
import { DATE_TYPES } from "../../types";
import { Modal } from "../Modal";
import { Field } from "../Field";
import { dateTypeLabelKey } from "../../format";
import { useT } from "../../../shared/useLocale";
import type { MessageKey } from "../../../shared/i18n";

const MONTH_KEYS: MessageKey[] = [
  "rolodex.month.january",
  "rolodex.month.february",
  "rolodex.month.march",
  "rolodex.month.april",
  "rolodex.month.may",
  "rolodex.month.june",
  "rolodex.month.july",
  "rolodex.month.august",
  "rolodex.month.september",
  "rolodex.month.october",
  "rolodex.month.november",
  "rolodex.month.december",
];

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
  const t = useT();
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
      setError(t("rolodex.addDate.errorDayMonth"));
      return;
    }
    const y = year ? Number(year) : null;
    if (y != null && (y < 1850 || y > 2100)) {
      setError(t("rolodex.addDate.errorYear"));
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
    type === "child_birthday"
      ? t("rolodex.addDate.labelChildHint")
      : t("rolodex.addDate.labelOptional");

  return (
    <Modal
      title={t("rolodex.addDate.title")}
      icon={<Cake size={17} className="modal-icon amber" />}
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
            {t("rolodex.addDate.save")}
          </button>
        </>
      }
    >
      <div className="form-grid">
        <Field label={t("rolodex.addDate.type")}>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ImportantDateType)}
          >
            {DATE_TYPES.map((dateType) => (
              <option key={dateType} value={dateType}>
                {t(dateTypeLabelKey(dateType))}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("rolodex.addDate.label", { hint: labelHint })}>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={type === "child_birthday" ? "Louise" : ""}
          />
        </Field>
        <Field label={t("rolodex.addDate.day")}>
          <input
            type="number"
            min={1}
            max={31}
            value={day}
            onChange={(e) => setDay(e.target.value)}
            placeholder="14"
          />
        </Field>
        <Field label={t("rolodex.addDate.month")}>
          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            <option value="">{t("shared.common.emDash")}</option>
            {MONTH_KEYS.map((key, i) => (
              <option key={key} value={i + 1}>
                {t(key)}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label={t("rolodex.addDate.year")}
          hint={t("rolodex.addDate.yearHint")}
        >
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
