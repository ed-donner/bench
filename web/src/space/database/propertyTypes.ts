import type { PropertyType } from "../api";
import type { MessageKey } from "../../shared/i18n";

/** i18n keys for each property type label. */
export const PROPERTY_TYPE_KEYS: Record<PropertyType, MessageKey> = {
  text: "space.property.text",
  number: "space.property.number",
  select: "space.property.select",
  multi_select: "space.property.multi_select",
  date: "space.property.date",
  checkbox: "space.property.checkbox",
  url: "space.property.url",
};
