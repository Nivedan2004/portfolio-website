import {
  bookingConfig,
  bookingResponse,
  limitBookingRequests,
  reserveMeeting,
} from "@/lib/google-booking";
import { validTimezone } from "@/lib/booking-slots";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  const origin = process.env.BOOKING_SITE_ORIGIN || new URL(request.url).origin;
  if (request.headers.get("origin") !== origin)
    return Response.json(
      { message: "Please book directly through this website." },
      { status: 403 },
    );
  const config = bookingConfig();
  if (!config)
    return Response.json(
      {
        message:
          "Live booking is not connected yet. Please email me to arrange a time.",
      },
      { status: 503 },
    );
  try {
    await limitBookingRequests(config, request, "book");
    if (
      !request.headers.get("content-type")?.includes("application/json") ||
      Number(request.headers.get("content-length") || 0) > 4096
    )
      return Response.json(
        { message: "Invalid booking request." },
        { status: 400 },
      );
    const raw = await request.text();
    if (raw.length > 4096)
      return Response.json(
        { message: "Invalid booking request." },
        { status: 400 },
      );
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return Response.json(
        { message: "Invalid booking request." },
        { status: 400 },
      );
    }
    if (!data || typeof data !== "object" || Array.isArray(data))
      return Response.json(
        { message: "Invalid booking request." },
        { status: 400 },
      );
    const { name, email, start, timezone, requestId, website } = data;
    if (
      website ||
      typeof name !== "string" ||
      name.trim().length < 2 ||
      name.length > 100 ||
      /[<>\r\n\x00-\x1f]/.test(name) ||
      typeof email !== "string" ||
      email.length > 254 ||
      /[\x00-\x1f]/.test(email) ||
      !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(email) ||
      typeof start !== "string" ||
      start.length > 40 ||
      !Number.isFinite(Date.parse(start)) ||
      typeof timezone !== "string" ||
      !validTimezone(timezone) ||
      typeof requestId !== "string" ||
      !/^[\da-f-]{36}$/i.test(requestId)
    )
      return Response.json(
        {
          message:
            "Please enter a valid name and email and choose an available time.",
        },
        { status: 400 },
      );
    return Response.json(
      await reserveMeeting(config, {
        name: name.trim(),
        email: email.trim(),
        start,
        timezone,
        requestId,
      }),
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return bookingResponse(error);
  }
}
