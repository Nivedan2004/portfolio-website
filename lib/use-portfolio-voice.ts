"use client";
import { useConversation } from "@elevenlabs/react";
import { useCallback, useEffect, useRef, useState } from "react";
export function readableVoiceError(error: unknown) {
  const message =
    error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  if (/NotAllowed|Permission|denied/i.test(message))
    return "Microphone permission was denied. Allow microphone access in your browser, then retry.";
  if (/NotFound|NotReadable|device|microphone/i.test(message))
    return "No available microphone was found. Connect a microphone and retry.";
  return "The voice connection failed. Check your connection and try again.";
}
/** Public-agent adapter. Secrets and authenticated credential exchange never enter this client. */
export function usePortfolioVoice() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [ended, setEnded] = useState(false);
  const [captions, setCaptions] = useState<{ role: string; text: string }[]>(
    [],
  );
  const starting = useRef(false);
  const mounted = useRef(true);
  const generation = useRef(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const releasePending = () => {
    starting.current = false;
    clearTimeout(timeout.current);
    if (mounted.current) setPending(false);
  };
  const conversation = useConversation({
    onConnect: () => {
      releasePending();
    },
    onError: (message, details) => {
      releasePending();
      current.current.endSession();
      if (mounted.current) setError(readableVoiceError(details || message));
    },
    onDisconnect: () => {
      releasePending();
      if (mounted.current) setEnded(true);
    },
    onMessage: (message) => {
      if (mounted.current)
        setCaptions((previous) => [
          ...previous.slice(-5),
          {
            role: message.source === "user" ? "You" : "AI",
            text: message.message,
          },
        ]);
    },
  });
  const current = useRef(conversation);
  current.current = conversation;
  const end = useCallback(() => {
    generation.current++;
    starting.current = false;
    clearTimeout(timeout.current);
    current.current.endSession();
    if (mounted.current) {
      setPending(false);
      setEnded(true);
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    window.addEventListener("pagehide", end);
    return () => {
      mounted.current = false;
      generation.current++;
      starting.current = false;
      clearTimeout(timeout.current);
      window.removeEventListener("pagehide", end);
      current.current.endSession();
    };
  }, [end]);
  const start = async () => {
    if (
      starting.current ||
      current.current.status === "connected" ||
      current.current.status === "connecting"
    )
      return;
    starting.current = true;
    setPending(true);
    setError("");
    setEnded(false);
    setCaptions([]);
    const attempt = ++generation.current;
    try {
      if (!navigator.mediaDevices?.getUserMedia)
        throw new Error("Microphone unavailable");
      // Preflight gives precise device/permission feedback. Never retain this stream.
      const permission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      permission.getTracks().forEach((track) => track.stop());
      if (!mounted.current || generation.current !== attempt) return;
      current.current.setMuted(false);
      // SDK v1.21 controls are synchronous; failures arrive through onError.
      current.current.startSession({
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!,
        connectionType: "webrtc",
      });
      timeout.current = setTimeout(() => {
        if (
          mounted.current &&
          generation.current === attempt &&
          starting.current
        ) {
          end();
          setError("The connection timed out. Please try again.");
        }
      }, 30000);
    } catch (error) {
      if (mounted.current && generation.current === attempt) {
        releasePending();
        setError(readableVoiceError(error));
      }
    }
  };
  const readAudio = useCallback(() => {
    const c = current.current;
    return {
      volume: c.isSpeaking
        ? c.getOutputVolume()
        : c.isMuted
          ? 0
          : c.getInputVolume(),
      frequencies: c.isSpeaking
        ? c.getOutputByteFrequencyData()
        : c.getInputByteFrequencyData(),
    };
  }, []);
  return {
    conversation,
    start,
    end,
    readAudio,
    error,
    ended,
    captions,
    active: conversation.status === "connected",
    connecting: pending || conversation.status === "connecting",
  };
}
