import { differenceInCalendarDays, parseISO } from "date-fns";
import type { MessageKey } from "../shared/locales";
import type {
  CheckInStatus,
  Circle,
  InteractionType,
  ImportantDateType,
} from "./types";

export interface RolodexT {
  (key: MessageKey<"rolodex">): string;
  i(key: MessageKey<"rolodex">, vars: Record<string, string | number>): string;
}

const STATUS_KEYS: Record<CheckInStatus, MessageKey<"rolodex">> = {
  in_touch: "statusInTouch",
  due_soon: "statusDueSoon",
  overdue: "statusOverdue",
  snoozed: "statusSnoozed",
  off: "statusOff",
};

const CIRCLE_KEYS: Record<Circle, MessageKey<"rolodex">> = {
  inner: "circleInner",
  close: "circleClose",
  wider: "circleWider",
  distant: "circleDistant",
};

const INTERACTION_LABEL_KEYS: Record<InteractionType, MessageKey<"rolodex">> = {
  call: "interactionCall",
  message: "interactionMessage",
  email: "interactionEmail",
  met: "interactionMet",
  other: "interactionOther",
};

const INTERACTION_VERB_KEYS: Record<InteractionType, MessageKey<"rolodex">> = {
  call: "verbCalled",
  message: "verbMessaged",
  email: "verbEmailed",
  met: "verbMet",
  other: "verbOther",
};

const DATE_TYPE_KEYS: Record<ImportantDateType, MessageKey<"rolodex">> = {
  birthday: "dateBirthday",
  anniversary: "dateAnniversary",
  work_anniversary: "dateWorkAnniversary",
  child_birthday: "dateChildBirthday",
  other: "dateOther",
};

const CADENCE_KEYS: Record<Circle, MessageKey<"rolodex">> = {
  inner: "cadenceMonthly",
  close: "cadenceQuarterly",
  wider: "cadenceSixMonths",
  distant: "cadenceYearly",
};

const BLURB_KEYS: Record<Circle, MessageKey<"rolodex">> = {
  inner: "innerBlurb",
  close: "closeBlurb",
  wider: "widerBlurb",
  distant: "distantBlurb",
};

export function statusLabel(t: RolodexT, status: CheckInStatus): string {
  return t(STATUS_KEYS[status]);
}

export function circleLabel(t: RolodexT, circle: Circle): string {
  return t(CIRCLE_KEYS[circle]);
}

export function circleCadence(t: RolodexT, circle: Circle): string {
  return t(CADENCE_KEYS[circle]);
}

export function circleBlurb(t: RolodexT, circle: Circle): string {
  return t(BLURB_KEYS[circle]);
}

export function interactionMeta(
  t: RolodexT,
  type: InteractionType,
): { label: string; verb: string } {
  return {
    label: t(INTERACTION_LABEL_KEYS[type]),
    verb: t(INTERACTION_VERB_KEYS[type]),
  };
}

export function dateTypeLabel(
  t: RolodexT,
  type: ImportantDateType,
  label?: string | null,
): string {
  if (type === "other" && label) return label;
  if (type === "child_birthday" && label)
    return t.i("dateChildBirthdayNamed", { name: label });
  return t(DATE_TYPE_KEYS[type]);
}

export function relativeDays(
  t: RolodexT,
  iso: string | null | undefined,
  fromToday?: string,
): string {
  if (!iso) return t("relativeNever");
  const ref = fromToday ? parseISO(fromToday) : new Date();
  const diff = differenceInCalendarDays(parseISO(iso), ref);
  if (diff === 0) return t("relativeToday");
  if (diff === 1) return t("relativeTomorrow");
  if (diff === -1) return t("relativeYesterday");
  if (diff < 0) return t.i("relativeDaysAgo", { n: -diff });
  return t.i("relativeDaysFromNow", { n: diff });
}
