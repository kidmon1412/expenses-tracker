// Date-only ("YYYY-MM-DD") helpers that avoid Date -> toISOString() round-trips.
// toISOString() converts through UTC, which silently shifts local midnight to the
// previous day in any timezone ahead of UTC (e.g. UTC+8) — that bug zeroed out
// every "this month" calculation on this server. Build/parse strings directly instead.

export function ymd(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

export function parseDateOnly(dateStr: string): { year: number; month: number; day: number } {
  const [y, m, d] = dateStr.split("-").map(Number);
  return { year: y, month: m - 1, day: d };
}

export function monthStartStr(date = new Date()): string {
  return ymd(date.getFullYear(), date.getMonth(), 1);
}

export function monthRangeStr(monthStr: string): { start: string; end: string } {
  const { year, month } = parseDateOnly(monthStr);
  const start = ymd(year, month, 1);
  const nextMonth = month + 1;
  const end = nextMonth > 11 ? ymd(year + 1, 0, 1) : ymd(year, nextMonth, 1);
  return { start, end };
}

// Inclusive [start, end] range for a "YYYY-MM" value, for reports.
export function monthInclusiveRange(monthValue: string): { start: string; end: string } {
  const [y, m] = monthValue.split("-").map(Number);
  const start = ymd(y, m - 1, 1);
  const lastDay = new Date(y, m, 0).getDate();
  const end = ymd(y, m - 1, lastDay);
  return { start, end };
}
