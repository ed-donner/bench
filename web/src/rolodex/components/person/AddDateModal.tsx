import { useState } from "react";
import { Cake } from "lucide-react";
import { useLocale } from "../../../shared/useLocale";
import { api } from "../../api";
import type { ImportantDateType } from "../../types";
import { DATE_TYPES } from "../../types";
import { Modal } from "../Modal";
import { Field } from "../Field";
import { dateTypeLabel, monthName } from "../../format";

export default function AddDateModal({
  personId,
  onClose,
  onSaved,
}: {
  personId: number;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const { t } = useLocale();
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
      setError(t("addDate.invalidDayMonth"));
      return;
    }
    const y = year ? Number(year) : null;
    if (y != null && (y < 1850 || y > 2100)) {
      setError(t("addDate.invalidYear"));
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
      ? t("addDate.labelChildHint")
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
            {t("common.cancel")}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => void save()}
            disabled={busy}
          >
            {t("addDate.save")}
          </button>
        </>
      }
    >
      <div className="form-grid">
        <Field label={t("addDate.type")}>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ImportantDateType)}
          >
            {DATE_TYPES.map((dateType) => (
              <option key={dateType} value={dateType}>
                {dateTypeLabel(t, dateType, null)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("addDate.labelField", { hint: labelHint })}>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={
              type === "child_birthday" ? t("addDate.childPlaceholder") : ""
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
            placeholder={t("addDate.dayPlaceholder")}
          />
        </Field>
        <Field label={t("addDate.month")}>
          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            <option value="">{t("common.dash")}</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {monthName(t, m)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("addDate.year")} hint={t("addDate.yearHint")}>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder={t("addDate.yearPlaceholder")}
          />
        </Field>
      </div>
    </Modal>
  );
}
