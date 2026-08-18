import type { PropertyType } from "../api";
import { translate } from "../../shared/i18n";

/** How each property type is named in the UI. */
export function propertyTypeLabel(type: PropertyType): string {
  return translate(`space:propertyType.${type}`);
}

export const PROPERTY_TYPES: PropertyType[] = [
  "text",
  "number",
  "select",
  "multi_select",
  "date",
  "checkbox",
  "url",
];
