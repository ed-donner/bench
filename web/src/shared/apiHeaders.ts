import { localeHeader } from "./locale";

/** JSON fetch headers including the active UI locale. */
export function apiHeaders(
  extra?: Record<string, string>,
): Record<string, string> {
  return {
    "Content-Type": "application/json",
    ...localeHeader(),
    ...extra,
  };
}
