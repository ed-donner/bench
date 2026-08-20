import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { useT } from "../../shared/useLocale";
import type { Circle, PersonComputed, PersonInput } from "../types";
import { CIRCLES } from "../types";
import { api } from "../api";
import { Modal } from "./Modal";
import { Avatar } from "./Avatar";
import { Field, FieldGroup } from "./Field";
import { circleLabel } from "../i18n";
import { useToast, useStore } from "../store";

const COMMON_TZ = [
  "Europe/London",
  "Europe/Dublin",
  "Europe/Lisbon",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Amsterdam",
  "Europe/Stockholm",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Athens",
  "Europe/Prague",
  "Europe/Warsaw",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Vancouver",
  "America/Toronto",
  "America/Sao_Paulo",
  "America/Argentina/Buenos_Aires",
  "Asia/Jerusalem",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Singapore",
  "Australia/Sydney",
  "Africa/Accra",
  "Africa/Casablanca",
  "Pacific/Auckland",
];

const TEXT_FIELDS = [
  "name",
  "email",
  "phone",
  "job_title",
  "company",
  "city",
  "timezone",
  "how_met",
  "met_where",
  "met_on",
  "notes",
  "tags",
  "cadence_override_days",
  "snoozed_until",
] as const;

type TextField = (typeof TEXT_FIELDS)[number];
type Fields = Record<TextField, string>;

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

function initialFields(existing?: PersonComputed): Fields {
  const from = (f: TextField): string => {
    if (f === "tags") return (existing?.tags ?? []).join(", ");
    const value = existing?.[f] ?? "";
    return typeof value === "string" ? value : String(value);
  };
  return Object.fromEntries(TEXT_FIELDS.map((f) => [f, from(f)])) as Fields;
}

export function PersonForm({
  existing,
  onClose,
  onSaved,
}: {
  existing?: PersonComputed;
  onClose: () => void;
  onSaved?: (person: PersonComputed) => void;
}) {
  const t = useT("rolodex");
  const { refresh } = useStore();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [fields, setFields] = useState<Fields>(() => initialFields(existing));
  const [circle, setCircle] = useState<Circle>(existing?.circle ?? "close");
  const [photo, setPhoto] = useState<string | null>(existing?.photo ?? null);
  const [checkinsOff, setCheckinsOff] = useState(
    existing?.checkins_off ?? false,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: TextField) => (value: string) => {
    setFields((current) => ({ ...current, [field]: value }));
  };

  const onPickPhoto = (file: File | null) => {
    if (!file) return;
    if (file.size > MAX_PHOTO_BYTES) {
      setError(t("photoTooLarge"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(typeof reader.result === "string" ? reader.result : null);
    };
    reader.readAsDataURL(file);
  };

  const text = (field: TextField) => fields[field].trim() || null;

  const body = (): Partial<PersonInput> => ({
    name: fields.name.trim(),
    email: text("email"),
    phone: text("phone"),
    job_title: text("job_title"),
    company: text("company"),
    city: text("city"),
    timezone: text("timezone"),
    circle,
    tags: fields.tags
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean),
    how_met: text("how_met"),
    met_where: text("met_where"),
    met_on: text("met_on"),
    notes: text("notes"),
    photo,
    cadence_override_days: fields.cadence_override_days
      ? Math.max(1, Number(fields.cadence_override_days))
      : null,
    checkins_off: checkinsOff,
    snoozed_until: text("snoozed_until"),
  });

  const save = async () => {
    if (!fields.name.trim()) {
      setError(t("nameRequired"));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const saved = existing
        ? await api.updatePerson(existing.id, body())
        : await api.createPerson(body());
      await refresh();
      toast(
        existing
          ? t.i("personUpdated", { name: saved.name })
          : t.i("personAdded", { name: saved.name }),
      );
      onSaved?.(saved);
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      large
      title={
        existing ? t.i("editName", { name: existing.name }) : t("addAPerson")
      }
      icon={<ImagePlus size={17} className="modal-icon" />}
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
            disabled={saving}
          >
            {(() => {
              if (saving) return t("saving");
              if (existing) return t("saveChanges");
              return t("addPerson");
            })()}
          </button>
        </>
      }
    >
      <div className="photo-picker">
        <Avatar name={fields.name || t("newPerson")} photo={photo} size="xl" />
        <div>
          <div className="row" style={{ gap: 8 }}>
            <button
              className="btn btn-sm"
              onClick={() => fileRef.current?.click()}
              type="button"
            >
              <ImagePlus size={14} /> {t("uploadPhoto")}
            </button>
            {photo && (
              <button
                className="btn btn-sm"
                onClick={() => setPhoto(null)}
                type="button"
              >
                <Trash2 size={14} /> {t("remove")}
              </button>
            )}
          </div>
          <div className="hint">{t("photoHint")}</div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="visually-hidden"
            aria-label={t("photoFile")}
            onChange={(e) => onPickPhoto(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      <div className="form-grid">
        <Field label={t("nameLabel")} wide>
          <input
            value={fields.name}
            onChange={(e) => set("name")(e.target.value)}
            placeholder="Ada Lovelace"
          />
        </Field>
        <Field label={t("email")}>
          <input
            value={fields.email}
            onChange={(e) => set("email")(e.target.value)}
            placeholder="ada@example.com"
          />
        </Field>
        <Field label={t("phone")}>
          <input
            value={fields.phone}
            onChange={(e) => set("phone")(e.target.value)}
            placeholder="+44 20 7000 0000"
          />
        </Field>
        <Field label={t("jobTitle")}>
          <input
            value={fields.job_title}
            onChange={(e) => set("job_title")(e.target.value)}
            placeholder="Product Designer"
          />
        </Field>
        <Field label={t("company")}>
          <input
            value={fields.company}
            onChange={(e) => set("company")(e.target.value)}
            placeholder="Figma"
          />
        </Field>
        <Field label={t("city")}>
          <input
            value={fields.city}
            onChange={(e) => set("city")(e.target.value)}
            placeholder="London"
          />
        </Field>
        <Field label={t("timezone")}>
          <input
            list="tz-list"
            value={fields.timezone}
            onChange={(e) => set("timezone")(e.target.value)}
            placeholder="Europe/London"
          />
          <datalist id="tz-list">
            {COMMON_TZ.map((tz) => (
              <option key={tz} value={tz} />
            ))}
          </datalist>
        </Field>
        <FieldGroup label={t("circle")} wide hint={t("circleHint")}>
          <div className="row wrap" style={{ gap: 6 }}>
            {CIRCLES.map((c) => (
              <button
                key={c}
                type="button"
                className={`btn btn-sm${circle === c ? " btn-blue" : ""}`}
                aria-pressed={circle === c}
                onClick={() => setCircle(c)}
              >
                {circleLabel(t, c)}
              </button>
            ))}
          </div>
        </FieldGroup>
        <Field label={t("tags")} wide hint={t("tagsHint")}>
          <input
            value={fields.tags}
            onChange={(e) => set("tags")(e.target.value)}
            placeholder="family, university, cycling"
          />
        </Field>
        <Field label={t("howMet")}>
          <input
            value={fields.how_met}
            onChange={(e) => set("how_met")(e.target.value)}
            placeholder="University flatmates"
          />
        </Field>
        <Field label={t("metWhere")}>
          <input
            value={fields.met_where}
            onChange={(e) => set("met_where")(e.target.value)}
            placeholder="Manchester"
          />
        </Field>
        <Field label={t("whenMet")}>
          <input
            type="date"
            value={fields.met_on}
            onChange={(e) => set("met_on")(e.target.value)}
          />
        </Field>
        <Field label={t("cadenceOverrideDays")} hint={t("cadenceOverrideHint")}>
          <input
            type="number"
            min={1}
            value={fields.cadence_override_days}
            onChange={(e) => set("cadence_override_days")(e.target.value)}
            placeholder={t("circleDefault")}
          />
        </Field>
        <Field label={t("snoozeUntil")} hint={t("snoozeHint")}>
          <input
            type="date"
            value={fields.snoozed_until}
            onChange={(e) => set("snoozed_until")(e.target.value)}
          />
        </Field>
        <label className="field field-check">
          <input
            type="checkbox"
            checked={checkinsOff}
            onChange={(e) => setCheckinsOff(e.target.checked)}
          />
          {t("checkinsOffLabel")}
        </label>
        <Field label={t("notes")} wide>
          <textarea
            value={fields.notes}
            onChange={(e) => set("notes")(e.target.value)}
            placeholder="Freeform notes about them"
          />
        </Field>
      </div>
    </Modal>
  );
}
