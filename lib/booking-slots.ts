export type BusyPeriod = { start: string; end: string };
export type Slot = { start: string; end: string };
export type Hours = { days: number[]; start: string; end: string }[];
export const minuteOfDay = (value: string) =>
  Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
export function validTimezone(zone: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: zone }).format();
    return true;
  } catch {
    return false;
  }
}
export function parseHours(value: string): Hours {
  const hours: Hours = JSON.parse(value);
  if (!Array.isArray(hours) || !hours.length || hours.length > 14)
    throw new Error("Invalid booking hours");
  for (const range of hours) {
    if (
      !Array.isArray(range.days) ||
      !range.days.length ||
      range.days.some((day) => !Number.isInteger(day) || day < 0 || day > 6) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(range.start) ||
      !/^(([01]\d|2[0-3]):[0-5]\d|24:00)$/.test(range.end) ||
      minuteOfDay(range.start) >= minuteOfDay(range.end) ||
      minuteOfDay(range.start) % 15 ||
      minuteOfDay(range.end) % 15
    )
      throw new Error("Invalid booking hours");
  }
  for (let day = 0; day < 7; day++) {
    const ranges = hours
      .filter((range) => range.days.includes(day))
      .sort((a, b) => minuteOfDay(a.start) - minuteOfDay(b.start));
    for (let i = 1; i < ranges.length; i++)
      if (minuteOfDay(ranges[i].start) < minuteOfDay(ranges[i - 1].end))
        throw new Error("Overlapping booking hours");
  }
  return hours;
}
export function monthRange(month: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error("Invalid month");
  const [year, number] = month.split("-").map(Number);
  return {
    from: Date.UTC(year, number - 1, 1) - 15 * 3600000,
    to: Date.UTC(year, number, 1) + 15 * 3600000,
  };
}
/** Walk real UTC instants, then evaluate owner-local working hours (including DST). */
export function candidateSlots(options: {
  from: number;
  to: number;
  now: number;
  timezone: string;
  hours: Hours;
  duration: number;
  noticeHours: number;
  horizonDays: number;
}): Slot[] {
  const { from, to, now, timezone, hours, duration, noticeHours, horizonDays } =
    options;
  const format = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const slots: Slot[] = [];
  const step = 15 * 60000;
  const first =
    Math.ceil(Math.max(from, now + noticeHours * 3600000) / step) * step;
  const last = Math.min(to, now + horizonDays * 86400000);
  for (let start = first; start + duration * 60000 <= last; start += step) {
    const parts = format.formatToParts(start);
    const part = (name: string) =>
      parts.find((item) => item.type === name)?.value || "";
    const day = weekdays.indexOf(part("weekday"));
    const minute = Number(part("hour")) * 60 + Number(part("minute"));
    const range = hours.find(
      (range) =>
        range.days.includes(day) &&
        minute >= minuteOfDay(range.start) &&
        minute + duration <= minuteOfDay(range.end) &&
        (minute - minuteOfDay(range.start)) % duration === 0,
    );
    if (!range) continue;
    const end = start + duration * 60000;
    // A DST transition inside a slot must not change its intended wall-clock duration.
    const endParts = format.formatToParts(end - 1);
    const endPart = (name: string) =>
      endParts.find((item) => item.type === name)?.value || "";
    if (
      endPart("weekday") !== part("weekday") ||
      Number(endPart("hour")) * 60 + Number(endPart("minute")) !==
        minute + duration - 1
    )
      continue;
    slots.push({
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
    });
  }
  return slots;
}
export function removeBusy(
  slots: Slot[],
  busy: BusyPeriod[],
  bufferMinutes = 0,
) {
  const buffer = bufferMinutes * 60000;
  return slots.filter(
    (slot) =>
      !busy.some(
        (period) =>
          Date.parse(slot.start) - buffer < Date.parse(period.end) &&
          Date.parse(slot.end) + buffer > Date.parse(period.start),
      ),
  );
}
