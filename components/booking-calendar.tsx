"use client";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { links } from "@/lib/content";
type Slot = { start: string; end: string };
type Availability = {
  configured: boolean;
  slots: Slot[];
  duration?: number;
  message?: string;
};
const dateKey = (date: Date, timezone: string) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
export function BookingCalendar() {
  const [month, setMonth] = useState<Date | null>(null);
  const [timezone, setTimezone] = useState("");
  const [today, setToday] = useState("");
  const [selected, setSelected] = useState("");
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [hour12, setHour12] = useState(true);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [step, setStep] = useState<"calendar" | "details" | "confirmed">(
    "calendar",
  );
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState("");
  const requestId = useRef("");
  useEffect(() => {
    const now = new Date();
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(zone);
    setToday(dateKey(now, zone));
    setSelected(dateKey(now, zone));
    setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  }, []);
  const monthString = month ? monthKey(month) : "";
  useEffect(() => {
    if (!monthString || !timezone) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setAvailability(null);
    setSlot(null);
    setStep("calendar");
    setToday(dateKey(new Date(), timezone));
    fetch(
      `/api/booking/availability?month=${monthString}&timezone=${encodeURIComponent(timezone)}`,
      { signal: controller.signal, cache: "no-store" },
    )
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(
            data.message ||
              "Availability could not be loaded. Please try again.",
          );
        return data as Availability;
      })
      .then(setAvailability)
      .catch((error) => {
        if (error.name !== "AbortError") setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [monthString, timezone, reload]);
  const slotsByDay = useMemo(() => {
    const days: Record<string, Slot[]> = {};
    for (const time of availability?.slots || []) {
      const key = dateKey(new Date(time.start), timezone);
      (days[key] ||= []).push(time);
    }
    return days;
  }, [availability, timezone]);
  const zones = useMemo(
    () =>
      timezone
        ? [
            ...new Set([
              timezone,
              "America/Los_Angeles",
              "America/New_York",
              "Europe/London",
              "Europe/Berlin",
              "Asia/Kolkata",
              "Asia/Singapore",
              "Australia/Sydney",
              "UTC",
            ]),
          ]
        : [],
    [timezone],
  );
  const formatTime = (value: string) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12,
    }).format(new Date(value));
  const selectedLabel = selected
    ? new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${selected}T12:00:00Z`))
    : "";
  const changeMonth = (direction: number) => {
    if (!month) return;
    const next = new Date(month.getFullYear(), month.getMonth() + direction, 1);
    setMonth(next);
    setSelected(`${monthKey(next)}-01`);
  };
  const book = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!slot || submitting) return;
    const data = new FormData(event.currentTarget);
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: slot.start,
          timezone,
          name: data.get("name"),
          email: data.get("email"),
          website: data.get("website"),
          requestId: requestId.current,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          setAvailability((previous) =>
            previous
              ? {
                  ...previous,
                  slots: previous.slots.filter(
                    (time) => time.start !== slot.start,
                  ),
                }
              : null,
          );
          setSlot(null);
          setStep("calendar");
        }
        throw new Error(
          result.message ||
            "The booking could not be confirmed. Please try again.",
        );
      }
      if (result.status !== "confirmed")
        throw new Error(
          "The booking has not been confirmed. Please email me before trying again.",
        );
      setConfirmed(result.start);
      setStep("confirmed");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "The booking could not be confirmed.",
      );
    } finally {
      setSubmitting(false);
    }
  };
  if (!month)
    return (
      <section
        className="booking-panel native-booking"
        aria-labelledby="booking-title"
      >
        <h2 id="booking-title">Find a time.</h2>
        <p role="status">Loading calendar…</p>
      </section>
    );
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Array.from(
    { length: Math.ceil((month.getDay() + days) / 7) * 7 },
    (_, index) => {
      const day = index - month.getDay() + 1;
      return day > 0 && day <= days ? day : null;
    },
  );
  const currentMonth = monthString === today.slice(0, 7);
  const maxMonth = monthKey(
    new Date(new Date().getFullYear(), new Date().getMonth() + 3, 1),
  );
  return (
    <section
      className="booking-panel native-booking"
      aria-labelledby="booking-title"
    >
      <div className="native-booking-heading">
        <h2 id="booking-title">Find a time.</h2>
        </div>
      <p className="calendar-event"><Image src="/logos/google-calendar.png" alt="" width={20} height={20} />
        {availability?.duration || 60}-minute chat
      </p>
      
      {step === "confirmed" ? (
        <div className="booking-confirmation" role="status">
          <span className="confirmation-check">
            <Check size={24} />
          </span>
          <h3>You’re booked.</h3>
          <p>
            {selectedLabel} · {formatTime(confirmed)}
          </p>
          <p>Your calendar invitation is on its way.</p>
          <button
            className="calendar-text-button"
            onClick={() => {
              setStep("calendar");
              setSlot(null);
              setAvailability((previous) =>
                previous
                  ? {
                      ...previous,
                      slots: previous.slots.filter(
                        (time) => time.start !== confirmed,
                      ),
                    }
                  : null,
              );
            }}
          >
            Back to calendar
          </button>
        </div>
      ) : step === "details" && slot ? (
        <>
          <button
            className="calendar-back"
            onClick={() => {
              setStep("calendar");
              setError("");
            }}
            disabled={submitting}
          >
            <ArrowLeft size={15} />
            Back to times
          </button>
          <div className="booking-selected-summary">
            <strong>{selectedLabel}</strong>
            <span>
              {formatTime(slot.start)} · {timezone.replaceAll("_", " ")}
            </span>
          </div>
          <form className="booking-form" onSubmit={book}>
            <label>
              Your name
              <input
                name="name"
                autoComplete="name"
                maxLength={100}
                required
                autoFocus
                disabled={submitting}
              />
            </label>
            <label>
              Email address
              <input
                name="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                required
                disabled={submitting}
              />
            </label>
            <div className="booking-honeypot" aria-hidden="true">
              <label>
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <p>
              Your name and email will be used to send the calendar invitation.
            </p>
            <button className="button calendar-continue" disabled={submitting}>
              {submitting ? "Confirming…" : "Confirm booking"}
              <ArrowRight size={16} />
            </button>
          </form>
        </>
      ) : (
        <>
          <div className="calendar-month">
            <h3 aria-live="polite">
              {new Intl.DateTimeFormat("en-US", {
                month: "long",
                year: "numeric",
              }).format(month)}
            </h3>
            <div>
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                disabled={currentMonth}
                aria-label="Previous month"
              >
                <ChevronLeft size={19} />
              </button>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                disabled={monthString >= maxMonth}
                aria-label="Next month"
              >
                <ChevronRight size={19} />
              </button>
            </div>
          </div>
          <div className="calendar-weekdays" aria-hidden="true">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day, index) => (
              <span key={index}>{day}</span>
            ))}
          </div>
          <div
            className="calendar-days"
            role="group"
            aria-label="Choose a date"
          >
            {cells.map((day, index) => {
              if (!day)
                return (
                  <span key={`blank-${index}`} className="calendar-empty" />
                );
              const key = `${monthString}-${String(day).padStart(2, "0")}`;
              const hasTimes = Boolean(slotsByDay[key]?.length);
              const disabled =
                key < today || Boolean(availability?.configured && !hasTimes);
              return (
                <button
                  type="button"
                  key={key}
                  className={`${key === selected ? "is-selected " : ""}${key === today ? "is-today " : ""}${hasTimes ? "has-times" : ""}`}
                  disabled={disabled}
                  aria-pressed={key === selected}
                  aria-current={key === today ? "date" : undefined}
                  aria-label={new Intl.DateTimeFormat("en-US", {
                    dateStyle: "full",
                    timeZone: "UTC",
                  }).format(new Date(`${key}T12:00:00Z`))}
                  onClick={() => {
                    setSelected(key);
                    setSlot(null);
                    setError("");
                  }}
                >
                  {day}
                  {hasTimes && <span className="availability-dot" />}
                </button>
              );
            })}
          </div>
          <div className="calendar-times" aria-busy={loading}>
            <h3>{selectedLabel}</h3>
            {loading ? (
              <p className="calendar-message" role="status">
                Checking availability…
              </p>
            ) : !availability && error ? null : !availability?.configured ? (
              <p className="calendar-message" role="status">
                Live availability isn’t connected yet.
                <br />
                <a href={links.email}>
                  Email me to find a time <ArrowRight size={12} />
                </a>
              </p>
            ) : !slotsByDay[selected]?.length ? (
              <p className="calendar-message">
                No available times on this day. Try another date.
              </p>
            ) : (
              <div className="calendar-time-options">
                {slotsByDay[selected].map((time) => (
                  <button
                    type="button"
                    key={time.start}
                    aria-pressed={slot?.start === time.start}
                    onClick={() => setSlot(time)}
                  >
                    {formatTime(time.start)}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="calendar-preferences">
            <label className="calendar-timezone">
              
              <span className="sr-only">Timezone</span>
              <select
                aria-label="Timezone"
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
              >
                {zones.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone === "America/Los_Angeles" ? "Pacific Time" : zone.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <div className="clock-format" role="group" aria-label="Time format">
              <button
                type="button"
                aria-pressed={hour12}
                onClick={() => setHour12(true)}
              >
                12h
              </button>
              <button
                type="button"
                aria-pressed={!hour12}
                onClick={() => setHour12(false)}
              >
                24h
              </button>
            </div>
          </div>
          {slot && (
            <button
              className="button calendar-continue"
              onClick={() => {
                requestId.current = crypto.randomUUID();
                setStep("details");
              }}
              type="button"
            >
              Continue
              <ArrowRight size={17} />
            </button>
          )}
        </>
      )}
      {error && (
        <div className="calendar-error" role="alert">
          <p>{error}</p>
          {step === "calendar" && (
            <button
              className="calendar-text-button"
              onClick={() => setReload((value) => value + 1)}
            >
              Try again
            </button>
          )}
        </div>
      )}
    </section>
  );
}
