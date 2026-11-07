import {
  bookingConfig,
  bookingResponse,
  limitBookingRequests,
  liveAvailability,
} from "@/lib/google-booking";
import { monthRange, validTimezone } from "@/lib/booking-slots";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const url = new URL(request.url),
    month = url.searchParams.get("month") || "",
    timezone = url.searchParams.get("timezone") || "";
  try {
    monthRange(month);
    if (!validTimezone(timezone)) throw new Error();
  } catch {
    return Response.json(
      { message: "Choose a valid month and timezone." },
      { status: 400 },
    );
  }
  const config = bookingConfig();
  if (!config)
    return Response.json(
      { configured: false, slots: [] },
      { headers: { "Cache-Control": "no-store" } },
    );
  try {
    await limitBookingRequests(config, request, "read");
    return Response.json(
      {
        configured: true,
        slots: await liveAvailability(config, month, timezone),
        duration: config.duration,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return bookingResponse(error);
  }
}
