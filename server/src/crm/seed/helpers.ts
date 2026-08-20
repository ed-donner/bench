/** Shared date helpers for locale-specific CRM seed data. */
export function daysFromNow(days: number): string {
  const d = new Date(Date.now() + days * 86400000);
  return d.toISOString().slice(0, 10);
}

export function timestampDaysAgo(days: number, hour = 10): string {
  const d = new Date(Date.now() - days * 86400000);
  d.setHours(hour, 15, 0, 0);
  return d.toISOString().replace("T", " ").slice(0, 19);
}
