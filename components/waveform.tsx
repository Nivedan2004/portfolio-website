"use client";
import { useEffect, useId, useRef } from "react";
export type AudioReader = () => { volume: number; frequencies: Uint8Array };
const idle =
  "M 15 90 L 35 90 L 40 88 L 44 92 L 48 87 L 52 93 L 56 90 L 64 90 L 68 89 L 72 91 L 78 90 L 165 90";
export function Waveform({
  readAudio,
  active = false,
}: {
  readAudio?: AudioReader;
  active?: boolean;
}) {
  const path = useRef<SVGPathElement>(null);
  const id = useId().replaceAll(":", "");
  useEffect(() => {
    if (!active || !readAudio) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0,
      last = 0;
    const smooth = new Float32Array(61);
    function draw(now: number) {
      if (document.hidden || media.matches) {
        if (path.current) path.current.setAttribute("d", idle);
        frame = 0;
        return;
      }
      const dt = Math.min((now - last) / 1000 || 0.016, 0.1);
      last = now;
      const { volume, frequencies } = readAudio!();
      let d = "";
      for (let i = 0; i < 61; i++) {
        const frequency = frequencies.length
          ? frequencies[
              Math.min(
                frequencies.length - 1,
                Math.floor((i / 61) * frequencies.length * 0.6),
              )
            ] / 255
          : 0;
        const target =
          (i % 2 ? 1 : -1) *
          Math.min(1, volume * 3) *
          frequency *
          53 *
          Math.sin((i / 60) * Math.PI);
        smooth[i] += (target - smooth[i]) * (1 - Math.exp(-dt * 14));
        d += `${i ? "L" : "M"} ${15 + i * 2.5} ${90 + smooth[i]} `;
      }
      path.current?.setAttribute("d", d);
      frame = requestAnimationFrame(draw);
    }
    const resume = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      if (!document.hidden && !media.matches)
        frame = requestAnimationFrame(draw);
      else path.current?.setAttribute("d", idle);
    };
    resume();
    document.addEventListener("visibilitychange", resume);
    media.addEventListener("change", resume);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", resume);
      media.removeEventListener("change", resume);
    };
  }, [active, readAudio]);
  return (
    <div className="waveform" aria-hidden="true">
      <svg viewBox="0 0 180 180">
        <defs>
          <clipPath id={`${id}-clip`}>
            <circle cx="90" cy="90" r="78" />
          </clipPath>
        </defs>
        <circle
          cx="90"
          cy="90"
          r="88"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.1"
        />
        <path
          ref={path}
          d={idle}
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          clipPath={`url(#${id}-clip)`}
        />
      </svg>
    </div>
  );
}
