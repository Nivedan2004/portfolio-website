"use client";
import { ConversationProvider } from "@elevenlabs/react";
import { useState } from "react";
import { Mic, MicOff, PhoneOff } from "lucide-react";
import { usePortfolioVoice } from "@/lib/use-portfolio-voice";
import { Waveform } from "./waveform";
function Session() {
  const [consent, setConsent] = useState(false);
  const {
    conversation,
    start,
    end,
    readAudio,
    error,
    ended,
    captions,
    active,
    connecting,
  } = usePortfolioVoice();
  return (
    <>
      <Waveform readAudio={readAudio} active={active} />
      <div className="voice-copy">
        <h2 id="voice-title">Ask me anything.</h2>
        {!consent ? (
          <div className="voice-consent">
            <p>
              You’ll be speaking with an AI version of me. Your microphone and
              conversation are sent to ElevenLabs.
            </p>
            <p>{process.env.NEXT_PUBLIC_VOICE_PRIVACY_NOTICE}</p>
            <button
              className="button"
              onClick={() => {
                setConsent(true);
                void start();
              }}
            >
              <Mic size={17} />
              Agree & start
            </button>
          </div>
        ) : (
          <>
            <div className="voice-controls">
              {!active && !connecting ? (
                <button className="button" onClick={() => void start()}>
                  <Mic size={17} />
                  {error ? "Retry" : "Let’s talk"}
                </button>
              ) : (
                <>
                  <button className="button secondary" onClick={end}>
                    <PhoneOff size={16} />
                    {connecting ? "Cancel" : "End call"}
                  </button>
                  {active && (
                    <button
                      className="mute-button"
                      aria-label={
                        conversation.isMuted
                          ? "Unmute microphone"
                          : "Mute microphone"
                      }
                      aria-pressed={conversation.isMuted}
                      onClick={() =>
                        conversation.setMuted(!conversation.isMuted)
                      }
                    >
                      {conversation.isMuted ? (
                        <MicOff size={19} />
                      ) : (
                        <Mic size={19} />
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
            <p className="voice-status" role="status">
              {error ||
                (connecting
                  ? "Connecting…"
                  : active
                    ? conversation.isMuted
                      ? "Microphone muted"
                      : conversation.isSpeaking
                        ? "AI speaking"
                        : "Listening…"
                    : ended
                      ? "Conversation ended."
                      : "Ready when you are.")}
            </p>
          </>
        )}
        <p className="voice-credit">AI voice · Powered by ElevenLabs</p>
        {captions.length > 0 && (
          <div
            className="captions"
            role="log"
            aria-label="Live captions"
            aria-live="polite"
          >
            {captions.map((caption, i) => (
              <p key={i}>
                <strong>{caption.role}:</strong> {caption.text}
              </p>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
export default function LiveVoice() {
  return (
    <ConversationProvider>
      <Session />
    </ConversationProvider>
  );
}
