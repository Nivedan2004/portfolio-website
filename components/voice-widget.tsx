"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Mic } from "lucide-react";
import { Waveform } from "./waveform";
const LiveVoice = dynamic(() => import("./live-voice"), {
  ssr: false,
  loading: () => <p role="status">Loading voice controls…</p>,
});
const configured =
  process.env.NEXT_PUBLIC_VOICE_ENABLED === "true" &&
  Boolean(process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID) &&
  Boolean(process.env.NEXT_PUBLIC_VOICE_PRIVACY_NOTICE);
export function VoiceWidget() {
  const [opened, setOpened] = useState(false);
  return (
    <section className="voice-widget" aria-labelledby="voice-title">
      {opened && configured ? (
        <LiveVoice />
      ) : (
        <>
          <Waveform />
          <div className="voice-copy">
            <h2 id="voice-title">Ask me anything.</h2>
            <button
              className="button talk-button"
              onClick={() => setOpened(true)}
            >
              <Mic size={19} />
              Let’s talk
            </button>
            <p className="voice-credit">AI voice · Powered by ElevenLabs</p>
            {opened && (
              <p className="voice-notice" role="status">
                Voice chat isn’t available just yet. You can reach me on the{" "}
                <a href="/contact">contact page</a>.
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
