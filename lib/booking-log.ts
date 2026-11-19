import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

type Context = { requestId: string; operation: string };
type Fields = Record<string, string | number | boolean | string[] | undefined>;
const context = new AsyncLocalStorage<Context>();

/** Log only explicit fields; never pass provider errors, request bodies or headers. */
export function bookingLog(level: "info" | "warn" | "error", event: string, fields: Fields = {}) {
  console[level](JSON.stringify({ timestamp: new Date().toISOString(), service: "booking", ...context.getStore(), event, ...fields }));
}

/** Provider errors may contain Authorization headers, refresh tokens and attendee data. */
export function safeBookingError(error: unknown): Fields {
  const value = error as { name?: unknown; status?: unknown; code?: unknown; response?: { status?: unknown; data?: { error?: unknown } }; cause?: { code?: unknown } } | null;
  const data = value?.response?.data?.error;
  const code = typeof data === "string" ? data : typeof data === "object" && data !== null ? (data as { status?: unknown }).status : value?.code ?? value?.cause?.code;
  const allowed = new Set(["invalid_grant", "invalid_client", "unauthorized_client", "access_denied", "insufficient_scope", "PERMISSION_DENIED", "UNAUTHENTICATED", "RESOURCE_EXHAUSTED", "NOT_FOUND", "ENOTFOUND", "ECONNREFUSED", "ETIMEDOUT", "ECONNRESET"]);
  const providerCode = typeof code === "string" && allowed.has(code) ? code : undefined;
  const status = value?.response?.status ?? value?.status;
  return {
    errorType: value?.name === "TimeoutError" || value?.name === "AbortError" ? value.name : "BookingDependencyError",
    upstreamStatus: typeof status === "number" ? status : undefined,
    providerCode,
    hint: providerCode === "invalid_grant" ? "Reconnect Google with npm run calendar:connect; update GOOGLE_REFRESH_TOKEN in Production and redeploy. Check OAuth consent publishing status if tokens expire repeatedly."
      : providerCode === "invalid_client" ? "Check that the Google client ID, client secret and refresh token belong to the same OAuth client."
      : status === 401 ? "Check the provider credentials for this stage."
      : status === 403 ? "Check provider permissions, Calendar API enablement and calendar access."
      : undefined,
  };
}

export async function bookingStage<T>(stage: string, action: () => Promise<T>, fields: Fields = {}): Promise<T> {
  const started = performance.now();
  bookingLog("info", "stage.started", { stage, ...fields });
  try {
    const result = await action();
    bookingLog("info", "stage.succeeded", { stage, durationMs: Math.round(performance.now() - started), ...fields });
    return result;
  } catch (error) {
    bookingLog("error", "stage.failed", { stage, durationMs: Math.round(performance.now() - started), ...fields, ...safeBookingError(error) });
    throw error;
  }
}

export function withBookingLogging(request: Request, operation: "availability" | "reserve", action: () => Promise<Response>) {
  const requestId = randomUUID();
  return context.run({ requestId, operation }, async () => {
    const started = performance.now();
    bookingLog("info", "request.started", { method: request.method });
    try {
      const response = await action();
      response.headers.set("X-Booking-Request-Id", requestId);
      bookingLog(response.status >= 500 ? "error" : response.status >= 400 ? "warn" : "info", "request.completed", { status: response.status, durationMs: Math.round(performance.now() - started) });
      return response;
    } catch (error) {
      bookingLog("error", "request.failed", { durationMs: Math.round(performance.now() - started), ...safeBookingError(error) });
      return Response.json({ message: "Live booking is temporarily unavailable. Please try again later." }, { status: 503, headers: { "Cache-Control": "no-store", "X-Booking-Request-Id": requestId } });
    }
  });
}
