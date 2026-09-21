/**
 * All "today" aggregations and date display use Asia/Karachi regardless of the
 * server or visitor's timezone. Timestamps are stored as absolute Unix ms.
 */
export const TIMEZONE = "Asia/Karachi";
export const DAY_MS = 24 * 60 * 60 * 1000;

interface Parts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function karachiParts(instantMs: number): Parts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date(instantMs));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);

  const hour = get("hour") === 24 ? 0 : get("hour");

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour,
    minute: get("minute"),
    second: get("second"),
  };
}

/** Wall-clock ms of an instant's Karachi components, treated as UTC (for offset math). */
function wallClockMs(p: Parts): number {
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
}

/** Offset Local − UTC for the instant (positive for UTC+05:00), in ms. */
/**
 * Start of the Karachi calendar day that contains `instantMs`, expressed as an
 * absolute UTC ms. e.g. for 2026-09-21 10:00 PKT → 2026-09-20T19:00:00Z.
 */
export function startOfDay(instantMs: number): number {
  const snapped = instantMs - (instantMs % 1000);
  const parts = karachiParts(snapped);
  const offset = wallClockMs(parts) - snapped;
  const midnight = { ...parts, hour: 0, minute: 0, second: 0 };
  return wallClockMs(midnight) - offset;
}

/** Start of "today" in Karachi as UTC ms (inclusive). */
export function startOfToday(): number {
  return startOfDay(Date.now());
}

/** End of "today" in Karachi as UTC ms (exclusive). */
export function endOfToday(): number {
  return startOfToday() + DAY_MS;
}

/** True when the given instant falls inside the current Karachi calendar day. */
export function isToday(instantMs: number): boolean {
  return startOfDay(instantMs) === startOfToday();
}

const shortTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIMEZONE,
  hour: "numeric",
  minute: "2-digit",
});

/**
 * "21 Sep" — day before month, stable 3-letter month abbreviation
 * (language- and ICU-data independent).
 */
function shortDate(instantMs: number): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    day: "numeric",
    month: "short",
  }).formatToParts(instantMs);
  const day = parts.find((p) => p.type === "day")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  return `${day} ${month}`;
}

/** e.g. "Today 3:45 PM" / "21 Sep" */
export function formatActivityDate(instantMs: number): string {
  if (isToday(instantMs)) {
    return `Today ${shortTimeFormatter.format(instantMs)}`;
  }
  return shortDate(instantMs);
}

/** e.g. "3:45 PM" */
export function formatTime(instantMs: number): string {
  return shortTimeFormatter.format(instantMs);
}