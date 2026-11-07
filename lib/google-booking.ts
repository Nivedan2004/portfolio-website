import "server-only";
import { bookingSettings } from "./booking-settings";
import { OAuth2Client } from "google-auth-library";
import { createHash, randomUUID } from "node:crypto";
import {
  candidateSlots,
  monthRange,
  parseHours,
  removeBusy,
  validTimezone,
  type BusyPeriod,
  type Hours,
  type Slot,
} from "./booking-slots";
export class BookingError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
type Config = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  calendarId: string;
  timezone: string;
  hours: Hours;
  duration: number;
  noticeHours: number;
  horizonDays: number;
  buffer: number;
  redisUrl: string;
  redisToken: string;
};
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export function bookingConfig(): Config | null {
  if (process.env.BOOKING_ENABLED !== "true") return null;
  const env = process.env;
  if (
    !env.GOOGLE_CLIENT_ID ||
    !env.GOOGLE_CLIENT_SECRET ||
    !env.GOOGLE_REFRESH_TOKEN ||
    !env.GOOGLE_CALENDAR_ID ||
    !env.BOOKING_REDIS_REST_URL ||
    !env.BOOKING_REDIS_REST_TOKEN
  )
    return null;
  try {
    const duration = Number(
        env.BOOKING_DURATION_MINUTES || bookingSettings.duration,
      ),
      noticeHours = Number(
        env.BOOKING_NOTICE_HOURS || bookingSettings.noticeHours,
      ),
      horizonDays = Number(
        env.BOOKING_HORIZON_DAYS || bookingSettings.horizonDays,
      ),
      buffer = Number(env.BOOKING_BUFFER_MINUTES || 0);
    const timezone = env.BOOKING_TIMEZONE || bookingSettings.timezone;
    if (
      !validTimezone(timezone) ||
      ![15, 30, 45, 60, 90, 120].includes(duration) ||
      !Number.isFinite(noticeHours) ||
      noticeHours < 1 ||
      noticeHours > 720 ||
      !Number.isInteger(horizonDays) ||
      horizonDays < 1 ||
      horizonDays > 90 ||
      !Number.isFinite(buffer) ||
      buffer < 0 ||
      buffer > 120 ||
      new URL(env.BOOKING_REDIS_REST_URL).protocol !== "https:"
    )
      return null;
    return {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      refreshToken: env.GOOGLE_REFRESH_TOKEN,
      calendarId: env.GOOGLE_CALENDAR_ID,
      timezone,
      hours: parseHours(
        env.BOOKING_WEEKLY_HOURS || JSON.stringify(bookingSettings.hours),
      ),
      duration,
      noticeHours,
      horizonDays,
      buffer,
      redisUrl: env.BOOKING_REDIS_REST_URL,
      redisToken: env.BOOKING_REDIS_REST_TOKEN,
    };
  } catch {
    return null;
  }
}
async function redis<T>(
  config: Config,
  command: (string | number)[],
): Promise<T> {
  const response = await fetch(config.redisUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.redisToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok)
    throw new BookingError(
      503,
      "Booking is temporarily unavailable. Please try again later.",
    );
  const data = await response.json();
  if (data.error)
    throw new BookingError(503, "Booking is temporarily unavailable.");
  return data.result as T;
}
export async function limitBookingRequests(
  config: Config,
  request: Request,
  action: "read" | "book",
) {
  const address =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const key = `portfolio:rate:${action}:${hash(address).slice(0, 24)}`;
  const seconds = action === "read" ? 60 : 3600,
    limit = action === "read" ? 40 : 6;
  const count = await redis<number>(config, [
    "EVAL",
    "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return n",
    1,
    key,
    seconds,
  ]);
  if (count > limit)
    throw new BookingError(429, "Too many requests. Please try again later.");
}
const calendarKey = (config: Config) =>
  `portfolio:calendar:${hash(config.calendarId).slice(0, 24)}`;
const slotKey = (config: Config, start: string) =>
  `${calendarKey(config)}:slot:${Date.parse(start)}`;
function auth(config: Config) {
  const client = new OAuth2Client(config.clientId, config.clientSecret);
  client.setCredentials({ refresh_token: config.refreshToken });
  return client;
}
async function busyPeriods(
  config: Config,
  from: number,
  to: number,
): Promise<BusyPeriod[]> {
  const client = auth(config);
  const response = await client.request<{
    calendars: Record<string, { busy?: BusyPeriod[]; errors?: unknown[] }>;
  }>({
    url: "https://www.googleapis.com/calendar/v3/freeBusy",
    method: "POST",
    timeout: 10000,
    data: {
      timeMin: new Date(from).toISOString(),
      timeMax: new Date(to).toISOString(),
      items: [{ id: config.calendarId }],
    },
  });
  const calendar = response.data.calendars?.[config.calendarId];
  // Fail closed: inaccessible calendars must never be interpreted as empty calendars.
  if (!calendar || calendar.errors?.length || !Array.isArray(calendar.busy))
    throw new BookingError(
      503,
      "Live availability could not be checked. Please try again later.",
    );
  return calendar.busy;
}
function candidates(config: Config, from: number, to: number) {
  return candidateSlots({
    from,
    to,
    now: Date.now(),
    timezone: config.timezone,
    hours: config.hours,
    duration: config.duration,
    noticeHours: config.noticeHours,
    horizonDays: config.horizonDays,
  });
}
export async function liveAvailability(
  config: Config,
  month: string,
  timezone: string,
) {
  const { from, to } = monthRange(month);
  if (to < Date.now() || from > Date.now() + 100 * 86400000) return [];
  const possible = candidates(config, from, to);
  const free = removeBusy(
    possible,
    await busyPeriods(
      config,
      from - config.buffer * 60000,
      to + config.buffer * 60000,
    ),
    config.buffer,
  );
  const reserved = free.length
    ? await redis<(string | null)[]>(config, [
        "MGET",
        ...free.map((slot) => slotKey(config, slot.start)),
      ])
    : [];
  const format = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return free.filter(
    (slot, index) =>
      !reserved[index] && format.format(new Date(slot.start)).startsWith(month),
  );
}
type Submission = {
  start: string;
  name: string;
  email: string;
  timezone: string;
  requestId: string;
  website?: string;
};
type Reservation = {
  requestId: string;
  state: "pending" | "confirmed";
  start: string;
  end: string;
};
export async function reserveMeeting(
  config: Config,
  submission: Submission,
): Promise<{ status: "confirmed"; start: string; end: string }> {
  const begin = Date.parse(submission.start);
  const slot = candidates(config, begin, begin + config.duration * 60000)[0];
  if (!slot || Date.parse(slot.start) !== begin)
    throw new BookingError(
      409,
      "That time is no longer available. Please choose another.",
    );
  const lock = `${calendarKey(config)}:lock`,
    token = randomUUID();
  if (
    (await redis<string | null>(config, [
      "SET",
      lock,
      token,
      "NX",
      "EX",
      90,
    ])) !== "OK"
  )
    throw new BookingError(
      409,
      "Another booking is being confirmed. Please try again in a moment.",
    );
  const key = slotKey(config, slot.start);
  const eventId = `portfolio${hash(config.calendarId + slot.start).slice(0, 48)}`;
  const client = auth(config);
  const ttl = Math.max(
    3600,
    Math.ceil((Date.parse(slot.end) - Date.now()) / 1000) + 86400,
  );
  try {
    const stored = await redis<string | null>(config, ["GET", key]);
    if (stored) {
      const reservation = JSON.parse(stored) as Reservation;
      if (reservation.requestId !== submission.requestId)
        throw new BookingError(
          409,
          "That time has just been reserved. Please choose another.",
        );
      if (reservation.state === "confirmed")
        return {
          status: "confirmed",
          start: reservation.start,
          end: reservation.end,
        };
      // Recover a prior request whose response was interrupted, without creating another event.
      try {
        const existing = await client.request<{
          status: string;
          extendedProperties?: { private?: { requestId?: string } };
        }>({
          url: `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(config.calendarId)}/events/${eventId}`,
          timeout: 10000,
        });
        if (
          existing.data.status === "confirmed" &&
          existing.data.extendedProperties?.private?.requestId ===
            submission.requestId
        ) {
          await redis(config, [
            "SET",
            key,
            JSON.stringify({ ...reservation, state: "confirmed" }),
            "EX",
            ttl,
          ]);
          return { status: "confirmed", start: slot.start, end: slot.end };
        }
      } catch {}
      throw new BookingError(
        503,
        "We could not verify the previous booking attempt. Please email me before submitting again.",
      );
    }
    if (
      !removeBusy(
        [slot],
        await busyPeriods(
          config,
          begin - config.buffer * 60000,
          Date.parse(slot.end) + config.buffer * 60000,
        ),
        config.buffer,
      ).length
    )
      throw new BookingError(
        409,
        "That time has just been booked. Please choose another.",
      );
    const reservation: Reservation = {
      requestId: submission.requestId,
      state: "pending",
      ...slot,
    };
    await redis(config, ["SET", key, JSON.stringify(reservation), "EX", ttl]);
    try {
      const result = await client.request<{ id: string; status: string }>({
        url: `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(config.calendarId)}/events`,
        method: "POST",
        params: { sendUpdates: "all" },
        timeout: 15000,
        retry: false,
        data: {
          id: eventId,
          summary: "Catch up with Nivedan",
          description: `Catch up with ${submission.name}.\nBooked through the portfolio website.`,
          start: { dateTime: slot.start, timeZone: config.timezone },
          end: { dateTime: slot.end, timeZone: config.timezone },
          attendees: [
            { email: submission.email, displayName: submission.name },
          ],
          visibility: "private",
          guestsCanInviteOthers: false,
          guestsCanModify: false,
          extendedProperties: { private: { requestId: submission.requestId } },
          transparency: "opaque",
        },
      });
      if (result.data.status !== "confirmed" || !result.data.id)
        throw new Error("Unconfirmed event");
      await redis(config, [
        "SET",
        key,
        JSON.stringify({ ...reservation, state: "confirmed" }),
        "EX",
        ttl,
      ]);
      return { status: "confirmed", ...slot };
    } catch (error) {
      // Keep uncertain reservations blocked. A retry with the same ID safely recovers them.
      const status = (error as { response?: { status?: number } }).response
        ?.status;
      if (status && status >= 400 && status < 500 && status !== 409) {
        await redis(config, ["DEL", key]);
      }
      if (status === 409)
        throw new BookingError(
          409,
          "That time has already been reserved. Please choose another.",
        );
      throw new BookingError(
        503,
        "The booking could not be confirmed. Retry once, or email me if this continues.",
      );
    }
  } finally {
    await redis(config, [
      "EVAL",
      "if redis.call('GET',KEYS[1])==ARGV[1] then return redis.call('DEL',KEYS[1]) else return 0 end",
      1,
      lock,
      token,
    ]).catch(() => {});
  }
}
export function bookingResponse(error: unknown) {
  if (error instanceof BookingError)
    return Response.json(
      { message: error.message },
      { status: error.status, headers: { "Cache-Control": "no-store" } },
    );
  return Response.json(
    {
      message:
        "Live booking is temporarily unavailable. Please try again later.",
    },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
