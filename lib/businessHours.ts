export type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export const DAY_ORDER: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

/** The venue is in Germany, so "today" means today in Berlin. YYYY-MM-DD. */
export function todayInBerlin(): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Weekday of a YYYY-MM-DD date string. */
export function dayKeyOf(date: string): DayKey {
  // getUTCDay: 0 = Sunday. DAY_ORDER starts on Monday.
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
  return DAY_ORDER[(weekday + 6) % 7];
}

export interface DayHours {
  /** 24-hour "HH:mm", ignored when closed is true. */
  open: string;
  /** 24-hour "HH:mm" — may be past midnight (e.g. "05:00" for a 5am close). */
  close: string;
  closed: boolean;
}

export type BusinessHours = Record<DayKey, DayHours>;

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** A well-formed day entry: closed flag plus HH:mm open/close times. */
export function isValidDayHours(value: unknown): value is DayHours {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.closed === "boolean" &&
    typeof v.open === "string" &&
    typeof v.close === "string" &&
    TIME_RE.test(v.open) &&
    TIME_RE.test(v.close)
  );
}

// Matches the venue's real Google Business listing.
export const BUSINESS_HOURS_DEFAULTS: BusinessHours = {
  monday: { open: "09:00", close: "01:00", closed: false },
  tuesday: { open: "09:00", close: "01:00", closed: false },
  wednesday: { open: "09:00", close: "01:00", closed: false },
  thursday: { open: "09:00", close: "01:00", closed: false },
  friday: { open: "09:00", close: "05:00", closed: false },
  saturday: { open: "09:00", close: "05:00", closed: false },
  sunday: { open: "09:00", close: "01:00", closed: false },
};

export const DAY_LABELS: Record<"de" | "en", Record<DayKey, string>> = {
  de: {
    monday: "Montag",
    tuesday: "Dienstag",
    wednesday: "Mittwoch",
    thursday: "Donnerstag",
    friday: "Freitag",
    saturday: "Samstag",
    sunday: "Sonntag",
  },
  en: {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  },
};

const DAY_ABBR: Record<"de" | "en", Record<DayKey, string>> = {
  de: {
    monday: "Mo",
    tuesday: "Di",
    wednesday: "Mi",
    thursday: "Do",
    friday: "Fr",
    saturday: "Sa",
    sunday: "So",
  },
  en: {
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
  },
};

function to12Hour(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour12} ${period}` : `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function formatRange(day: DayHours, locale: "de" | "en"): string {
  if (day.closed) return locale === "de" ? "Geschlossen" : "Closed";
  return locale === "de"
    ? `${day.open} – ${day.close} Uhr`
    : `${to12Hour(day.open)} – ${to12Hour(day.close)}`;
}

/**
 * Groups consecutive days that share identical hours into single lines,
 * e.g. "Mon – Thu, Sun · 9 AM – 1 AM" / "Fri – Sat · 9 AM – 5 AM".
 */
export function groupBusinessHours(hours: BusinessHours, locale: "de" | "en"): string[] {
  const abbr = DAY_ABBR[locale];
  const lines: string[] = [];
  let i = 0;

  // Track which days have already been folded into a run.
  const used = new Set<DayKey>();

  while (i < DAY_ORDER.length) {
    const day = DAY_ORDER[i];
    if (used.has(day)) {
      i++;
      continue;
    }
    const key = formatRange(hours[day], locale);
    const run: DayKey[] = [day];
    used.add(day);

    let j = i + 1;
    while (j < DAY_ORDER.length) {
      const next = DAY_ORDER[j];
      if (used.has(next) || formatRange(hours[next], locale) !== key) break;
      run.push(next);
      used.add(next);
      j++;
    }

    const dayLabel =
      run.length === 1 ? abbr[run[0]] : `${abbr[run[0]]} – ${abbr[run[run.length - 1]]}`;

    lines.push(`${dayLabel} · ${key}`);
    i++;
  }

  return lines;
}
