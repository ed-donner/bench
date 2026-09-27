import type { PropertyType } from "../api";
import { t } from "../strings";

export const PROPERTY_TYPES: PropertyType[] = [
  "text",
  "number",
  "select",
  "multi_select",
  "date",
  "checkbox",
  "url",
];

/** How each property type is named in the UI. */
export const propertyTypeLabel = (type: PropertyType) => t(`propType.${type}`);
