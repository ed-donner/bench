import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import type { Circle, PersonComputed, PersonInput } from "../types";
import { CIRCLES } from "../types";
import { api } from "../api";
import { Modal } from "./Modal";
import { Avatar } from "./Avatar";
import { Field, FieldGroup } from "./Field";
import { useToast, useStore } from "../store";
import { useTranslation } from "react-i18next";

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

/** Every field of the form that is just text, so they can be held and updated as one. */
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
  const { t } = useTranslation("rolodex");
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
      setError(t("form.photoTooLarge"));
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
      .map((t) => t.trim().toLowerCase())
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
      setError(t("form.nameRequired"));
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
          ? t("form.updated", { name: saved.name })
          : t("form.added", { name: saved.name }),
      );
      onSaved?.(saved);
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const saveLabel = existing ? t("form.saveChanges") : t("action.addPerson");
  return (
    <Modal
      large
      title={
        existing
          ? t("form.editPerson", { name: existing.name })
          : t("form.addPerson")
      }
      icon={<ImagePlus size={17} className="modal-icon" />}
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
            disabled={saving}
          >
            {saving ? t("action.saving") : saveLabel}
          </button>
        </>
      }
    >
      <div className="photo-picker">
        <Avatar
          name={fields.name || t("form.newPerson")}
          photo={photo}
          size="xl"
        />
        <div>
          <div className="row" style={{ gap: 8 }}>
            <button
              className="btn btn-sm"
              onClick={() => fileRef.current?.click()}
              type="button"
            >
              <ImagePlus size={14} /> {t("form.uploadPhoto")}
            </button>
            {photo && (
              <button
                className="btn btn-sm"
                onClick={() => setPhoto(null)}
                type="button"
              >
                <Trash2 size={14} /> {t("form.removePhoto")}
              </button>
            )}
          </div>
          <div className="hint">{t("form.photoHint")}</div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="visually-hidden"
            aria-label={t("form.photo")}
            onChange={(e) => onPickPhoto(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      <div className="form-grid">
        <Field label={t("form.nameLabel")} wide>
          <input
            value={fields.name}
            onChange={(e) => set("name")(e.target.value)}
            placeholder={t("form.example.name")}
          />
        </Field>
        <Field label={t("field.email")}>
          <input
            value={fields.email}
            onChange={(e) => set("email")(e.target.value)}
            placeholder={t("form.placeholder.email")}
          />
        </Field>
        <Field label={t("field.phone")}>
          <input
            value={fields.phone}
            onChange={(e) => set("phone")(e.target.value)}
            placeholder={t("form.placeholder.phone")}
          />
        </Field>
        <Field label={t("field.jobTitle")}>
          <input
            value={fields.job_title}
            onChange={(e) => set("job_title")(e.target.value)}
            placeholder={t("form.example.jobTitle")}
          />
        </Field>
        <Field label={t("field.company")}>
          <input
            value={fields.company}
            onChange={(e) => set("company")(e.target.value)}
            placeholder={t("form.example.company")}
          />
        </Field>
        <Field label={t("field.city")}>
          <input
            value={fields.city}
            onChange={(e) => set("city")(e.target.value)}
            placeholder={t("form.example.city")}
          />
        </Field>
        <Field label={t("field.timezone")}>
          <input
            list="tz-list"
            value={fields.timezone}
            onChange={(e) => set("timezone")(e.target.value)}
            placeholder={t("form.placeholder.timezone")}
          />
          <datalist id="tz-list">
            {COMMON_TZ.map((tz) => (
              <option key={tz} value={tz} />
            ))}
          </datalist>
        </Field>
        <FieldGroup label={t("field.circle")} wide hint={t("form.circleHint")}>
          <div className="row wrap" style={{ gap: 6 }}>
            {CIRCLES.map((c) => (
              <button
                key={c}
                type="button"
                className={`btn btn-sm${circle === c ? " btn-blue" : ""}`}
                aria-pressed={circle === c}
                onClick={() => setCircle(c)}
              >
                {t(`circle.${c}`)}
              </button>
            ))}
          </div>
        </FieldGroup>
        <Field label={t("field.tags")} wide hint={t("form.tagsHint")}>
          <input
            value={fields.tags}
            onChange={(e) => set("tags")(e.target.value)}
            placeholder={t("form.placeholder.tags")}
          />
        </Field>
        <Field label={t("form.howYouMet")}>
          <input
            value={fields.how_met}
            onChange={(e) => set("how_met")(e.target.value)}
            placeholder={t("form.example.tags")}
          />
        </Field>
        <Field label={t("form.whereYouMet")}>
          <input
            value={fields.met_where}
            onChange={(e) => set("met_where")(e.target.value)}
            placeholder={t("form.example.metWhere")}
          />
        </Field>
        <Field label={t("form.whenYouMet")}>
          <input
            type="date"
            value={fields.met_on}
            onChange={(e) => set("met_on")(e.target.value)}
          />
        </Field>
        <Field label={t("form.cadenceOverride")} hint={t("form.cadenceHint")}>
          <input
            type="number"
            min={1}
            value={fields.cadence_override_days}
            onChange={(e) => set("cadence_override_days")(e.target.value)}
            placeholder={t("form.circleDefault")}
          />
        </Field>
        <Field label={t("form.snoozeUntil")} hint={t("form.snoozeHint")}>
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
          {t("form.turnOff")}
        </label>
        <Field label={t("field.notes")} wide>
          <textarea
            value={fields.notes}
            onChange={(e) => set("notes")(e.target.value)}
            placeholder={t("form.notesHint")}
          />
        </Field>
      </div>
    </Modal>
  );
}
