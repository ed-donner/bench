import type { PropertyType } from "../api";
import type { SpaceT } from "../i18n";
import { propertyTypeLabel } from "../i18n";

/** How each property type is named in the UI. */
export function propertyTypeLabels(tr: SpaceT): Record<PropertyType, string> {
  return {
    text: propertyTypeLabel("text", tr),
    number: propertyTypeLabel("number", tr),
    select: propertyTypeLabel("select", tr),
    multi_select: propertyTypeLabel("multi_select", tr),
    date: propertyTypeLabel("date", tr),
    checkbox: propertyTypeLabel("checkbox", tr),
    url: propertyTypeLabel("url", tr),
  };
}
