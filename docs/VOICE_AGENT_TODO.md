# TODO - Restore the portfolio voice agent

Temporarily hidden at the owner's request on November 7, 2026. The next planned feature is a conversational portfolio voice agent, powered by ElevenLabs, that answers visitors' questions about Nivedan using the portfolio and approved résumé facts.

The intended UI is the existing circular white waveform, “Ask me anything.” heading, “Let’s talk” microphone button, and “AI voice · Powered by ElevenLabs” credit. Keep the waveform plain white.

Implementation is preserved:

- `app/page.tsx`: commented import and `<VoiceWidget />` mount. Uncomment both when ready.
- `components/voice-widget.tsx`: entry UI and lazy loading.
- `components/live-voice.tsx`: conversation controls and session UI.
- `components/waveform.tsx`: waveform rendering.
- `lib/use-portfolio-voice.ts`: ElevenLabs session adapter.
- `content/agent-knowledge.md`: portfolio knowledge for the agent.
- Existing voice CSS and dependencies are retained.

Before restoring:

1. Create/configure the ElevenLabs agent with the approved knowledge, speaking style, and voice authorization.
2. Set `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`, `NEXT_PUBLIC_VOICE_ENABLED=true`, and `NEXT_PUBLIC_VOICE_PRIVACY_NOTICE` to match the provider's actual recording/retention settings. Keep API secrets server-side.
3. Verify explicit microphone consent, denied-permission retry, start/end/cancel, mute, real input/output waveform levels, and session cleanup on navigation. Keep transcripts in browser memory only.
4. Test real conversations on desktop and mobile, then uncomment the homepage import and mount. Check the mobile spacing around the illustration after restoring the widget.

Do not treat this as a working live agent until the real provider configuration and calls have been verified.
