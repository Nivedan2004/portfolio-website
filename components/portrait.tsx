"use client";
import { useEffect, useRef } from "react";
export function Portrait() {
  const head = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const media = matchMedia(
      "(prefers-reduced-motion: reduce), (pointer: coarse)",
    );
    let frame = 0,
      last = 0,
      targetX = 0,
      targetY = 0,
      x = 0,
      y = 0;
    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000 || 0.016, 0.05);
      last = now;
      const alpha = 1 - Math.exp(-dt * 9);
      x += (targetX - x) * alpha;
      y += (targetY - y) * alpha;
      if (head.current)
        head.current.style.transform = `translate(${x * 4}px,${y * 3}px) rotate(${x * 5}deg)`;
      if (Math.abs(targetX - x) + Math.abs(targetY - y) > 0.001)
        frame = requestAnimationFrame(draw);
      else frame = 0;
    };
    const wake = () => {
      if (!frame && !document.hidden && !media.matches) {
        last = 0;
        frame = requestAnimationFrame(draw);
      }
    };
    const reset = () => {
      targetX = 0;
      targetY = 0;
      wake();
    };
    const move = (event: PointerEvent) => {
      if (media.matches || event.pointerType !== "mouse") return;
      targetX = Math.max(
        -1,
        Math.min(1, (event.clientX / window.innerWidth - 0.5) * 2),
      );
      targetY = Math.max(
        -1,
        Math.min(1, (event.clientY / window.innerHeight - 0.5) * 2),
      );
      wake();
    };
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
        x = y = targetX = targetY = 0;
        if (head.current) head.current.style.transform = "none";
      } else reset();
    };
    const preference = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      x = y = targetX = targetY = 0;
      if (head.current) head.current.style.transform = "none";
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", reset);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", visibility);
    media.addEventListener("change", preference);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", reset);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", visibility);
      media.removeEventListener("change", preference);
    };
  }, []);
  return (
    <figure className="portrait">
      <div
        className="portrait-art"
        role="img"
        aria-label="Illustration of me wearing headphones, holding my brother Simba and a phone"
      >
        <img
          className="portrait-base"
          src="/images/portrait-base-transparent.png"
          alt=""
          width="1024"
          height="1536"
        />
        <img
          ref={head}
          className="simba-head"
          src="/images/simba-head.png"
          alt=""
          width="320"
          height="300"
        />
      </div>
      <figcaption>
        My brother,
        <br />
        <span>Simba.</span>
        <svg viewBox="0 0 40 62" aria-hidden="true">
          <path
            d="M10 2C-2 28 8 44 32 52M21 51l13 3-1-14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          />
        </svg>
      </figcaption>
    </figure>
  );
}
