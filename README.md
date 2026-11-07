# Personal portfolio

A Next.js 16 App Router application using React 19 and TypeScript. Two real routes: About (`/`) and Contact (`/contact`). Built from `PORTFOLIO_BUILD_BRIEF.md` and the two supplied approved references.

## Run locally

Requires Node.js 20.9+ (Node 22 LTS recommended).

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open http://127.0.0.1:3000. For production: `npm run build` then `npm start`. This is a standard Next.js application; deploy on a host supporting Next.js. No database or login is needed. Nothing has been published automatically.

## Configuration still needed

The voice widget is temporarily hidden on the homepage; its import and render are commented out with TODOs. See `docs/VOICE_AGENT_TODO.md` to resume the feature. The preserved widget handles missing configuration without requesting microphone access. To connect a **public** ElevenLabs agent, set its `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`, set `NEXT_PUBLIC_VOICE_ENABLED=true`, and supply `NEXT_PUBLIC_VOICE_PRIVACY_NOTICE` describing the agent’s actual provider recording and retention settings. Review the agent’s cloned-voice authorization, knowledge, recording/retention, allowed website origins, and provider cost/concurrency limits before enabling. Restart/rebuild after changing environment variables. No API key is required for public agents, and no secret belongs in a `NEXT_PUBLIC_` variable.

The adapter in `lib/use-portfolio-voice.ts` uses the current SDK’s supported session, mute, level, and frequency APIs. The SDK loads only after the visitor starts the voice UI. Consent precedes microphone capture. The waveform uses actual microphone or playback measurements; its idle line is static. SDK ownership plus explicit cancellation handles session cleanup on end, error, route unmount, or page exit. Captions remain in browser memory only. This app does not persist audio or transcripts; provider retention depends on your reviewed settings.

Private/authenticated agents are deliberately not exposed through a generic credential endpoint. If you choose private authentication, add an authorized server-side short-lived credential exchange, origin validation, shared rate limiting/abuse protection, and update the adapter before enabling. Keep `ELEVENLABS_API_KEY` server-only. Do not paste credentials into chat or source control.

The Contact page now uses a native dark calendar and time picker. The owner-confirmed Seattle schedule is in `lib/booking-settings.ts`. Real availability and booking require server-side Google OAuth authorization and shared reservation storage; the public appointment link is not API authorization. Until those settings are present, the calendar honestly shows that live availability is disconnected and does not fabricate time slots.

See [docs/CALENDAR_SETUP.md](docs/CALENDAR_SETUP.md) for the one-time connection procedure (`npm run calendar:connect`), environment variables, shared reservation store, and practical limits. No iframe, pricing, or payment flow is used. Booking success is shown only after Google confirms creation of the calendar event.

## Content and artwork

- Edit résumé-backed copy and social URLs in `lib/content.ts`.
- `public/resume.pdf` is an unchanged copy of the supplied résumé.
- Agent instructions and factual knowledge live separately under `content/`, for owner review before uploading.
- `public/images/portrait-base-transparent.png` and `simba-head.png` are the optimized separate layers. `assets/source/` preserves imagegen output. The supplied illustration is preserved at the repository root; only Simba’s head transforms.
- Pointer movement is bounded to ±5° rotation, ±4px horizontal and ±3px vertical translation. Touch and reduced-motion users see a neutral pose. Motion listeners and frames are cleaned up; hidden tabs pause work.
- Official organization assets are stored locally; provenance is in `assets/SOURCES.md`. DM Sans is hosted locally with its OFL license.

## Verification

```sh
npm run typecheck
npm run build
# With the app running locally, after installing browser binaries:
npx playwright install chromium webkit
npm run test:e2e
```

Browser checks cover direct routes/reload, navigation/back, keyboard accordions, résumé and social destinations, missing voice configuration, native calendar availability and booking states, image loading, responsive overflow, and head movement/reduced motion in Chromium and WebKit. Isolated Chromium checks additionally verified denied microphone permission, retry, cancellation, and cleanup of a permission stream resolving after cancellation using mocked media responses. Live voice calls, provider interruptions, actual mute/playback, and booking confirmation require the owner’s real agent and schedule; these cannot be validated with missing configuration.
