# Native calendar setup

The Contact page uses the portfolio’s own dark date/time picker. No Google iframe, payment flow, or provider profile is shown. The booking-link URL is retained as source information but does not power this custom flow.

## What is already configured

Owner-confirmed schedule in `lib/booking-settings.ts`:

- Timezone: America/Los_Angeles (Seattle; daylight saving handled automatically).
- Monday, Wednesday, Thursday: unavailable 17:45–19:45.
- Tuesday: unavailable 15:30–19:45.
- Other times, including weekends: permitted, subject to actual busy events.
- Duration: 60 minutes, matching the supplied Google booking schedule.
- Operational defaults: two hours minimum notice, 60-day booking horizon, zero additional buffer. These can be edited before enabling.

Public Google appointment links do not provide a supported API for retrieving slots or creating bookings from a custom interface. This implementation connects directly to the Google Calendar API instead. Google’s existing appointment schedule settings are not imported; the owner-confirmed rules above drive the native calendar.

## Connect Google Calendar

1. In Google Cloud Console, enable the Google Calendar API for your project.
2. Configure Google Auth Platform / OAuth consent for your own account. If the app is in testing, add your account as a test user. Google testing-mode refresh tokens can expire; use the appropriate publishing/verification setup for production.
3. Create an OAuth **Web application** client. Register `http://localhost:3344/callback` as an authorized redirect URI.
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in the ignored `.env.local`. Never send these secrets in chat or commit them.
5. Run `npm run calendar:connect`, open the printed Google consent URL, and authorize your own calendar. The script validates OAuth state and PKCE, then saves the refresh token directly into `.env.local`; it does not print the token.
6. Set `GOOGLE_CALENDAR_ID=primary`, or the actual calendar identifier you want to use. This account needs permission to read availability and create events on that calendar.

## Shared reservations

Set `BOOKING_REDIS_REST_URL` and `BOOKING_REDIS_REST_TOKEN` for a persistent Upstash-compatible Redis REST store with write access. This is used for shared rate limits, a calendar-wide lock, and slot reservations across simultaneous requests/server instances. It stores hashed request buckets and slot/request IDs, not visitor names or email addresses. Names/emails are sent to Google only to create the calendar invitation. The visitor is told this before confirming.

The app fails closed while required configuration is absent. Set `BOOKING_ENABLED=true` only after both connections work. Restart/rebuild Next.js after setting environment variables. The UI then retrieves real free/busy data, applies your hours, and shows available times.

Set `BOOKING_SITE_ORIGIN` to your exact public origin (e.g. `https://yourdomain.com`) on deployment. POST requests must come from that origin. Configure your hosting proxy to replace client-supplied forwarding headers, and apply platform abuse protections to the booking endpoints. The shared store limits read requests to 40/minute and booking attempts to 6/hour per forwarded IP; rate buckets automatically expire.

## Booking behavior and practical limits

- The server validates the requested time against owner-local hours, notice and horizon rules.
- It checks Google free/busy again under a shared lock, reserves the slot, then inserts a private Google event and requests attendee invitations.
- Same-request retries are idempotent. An uncertain provider response keeps the slot reserved; retries reconcile using the deterministic Google event ID, without creating another invitation.
- Success is shown only after a confirmed Google event response (or recovery of that exact confirmed event).
- No payment code is present. No Google Meet is promised or generated; meeting location can be added after the owner chooses that policy.
- Google does not provide a transaction spanning a free/busy query and event insertion. The shared lock serializes this app’s requests; a separate calendar editor could still add an event during that small interval.
- A canceled booking may stay reserved until its reservation expires (one day after the event end). For early reopening, remove the matching Redis slot key after confirming cancellation. Calendar event IDs are deterministic and Google may retain deleted-event tombstones, so manual reconciliation can be necessary.
- Only the configured calendar is checked. Put other conflicts on that calendar or extend the adapter before enabling multiple-calendar scheduling.

## Verify

`npm run test:booking` checks schedule exclusions, DST behavior, busy-event overlaps, and month boundaries. `npm run test:e2e` covers the native interface using mocked server responses, including slot selection, the details form, confirmed booking, and slot conflicts. Mocked tests do not verify live Google access, email delivery, or real reservations.

Sources: [Google free/busy](https://developers.google.com/workspace/calendar/api/v3/reference/freebusy/query), [event insertion](https://developers.google.com/workspace/calendar/api/v3/reference/events/insert), [OAuth web flow](https://developers.google.com/identity/protocols/oauth2/web-server), [official Node auth library](https://github.com/googleapis/google-auth-library-nodejs), [Redis REST commands](https://upstash.com/docs/redis/features/restapi).
