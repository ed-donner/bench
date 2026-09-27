import { useState } from "react";
import { Cake } from "lucide-react";
import { api } from "../../api";
import type { ImportantDateType } from "../../types";
import { DATE_TYPES } from "../../types";
import { Modal } from "../Modal";
import { Field } from "../Field";
import { format } from "date-fns";
import { errorMessage } from "../../format";
import { dateLocale, useT } from "../../strings";

/** January to December, in the language of the page. */
const monthNames = () =>
  Array.from({ length: 12 }, (_, i) =>
    format(new Date(2001, i, 1), "LLLL", { locale: dateLocale() }),
  );

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
      setError(t("dateForm.invalidDay"));
      return;
    }
    const y = year ? Number(year) : null;
    if (y != null && (y < 1850 || y > 2100)) {
      setError(t("dateForm.invalidYear"));
      return;
    }
    // 29 February is a real date, celebrated on the 28th in common years, so check a leap year.
    if (d > new Date(2000, m, 0).getDate()) {
      setError(t("dateForm.notADate", { day: d, month: monthNames()[m - 1] }));
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
      setError(errorMessage(e));
      setBusy(false);
    }
  };

  const labelHint =
    type === "child_birthday" || type === "other"
      ? t("dateForm.labelChild")
      : t("dateForm.labelOptional");

  return (
    <Modal
      title={t("dateForm.title")}
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
            {t("dateForm.save")}
          </button>
        </>
      }
    >
      <div className="form-grid">
        <Field label={t("log.type")}>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ImportantDateType)}
          >
            {DATE_TYPES.map((d) => (
              <option key={d} value={d}>
                {t(`dateType.${d}`)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={`${t("dateForm.label")} ${labelHint}`}>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={type === "child_birthday" ? "Louise" : ""}
          />
        </Field>
        <Field label={t("dateForm.day")}>
          <input
            type="number"
            min={1}
            max={31}
            value={day}
            onChange={(e) => setDay(e.target.value)}
            placeholder="14"
          />
        </Field>
        <Field label={t("dateForm.month")}>
          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            <option value="">—</option>
            {monthNames().map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("dateForm.year")} hint={t("dateForm.yearHint")}>
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
