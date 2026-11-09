"use client";
import { useEffect, useRef } from "react";
export function Portrait() {
  const head = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const touch = matchMedia("(pointer: coarse)");
    const portrait = head.current?.closest("figure");
    let inView = false;
    let lastTouch = -Infinity;
    let frame = 0,
      last = 0,
      targetX = 0,
      targetY = 0,
      x = 0,
      y = 0;
    const draw = (now: number) => {
      if (touch.matches && now - lastTouch > 2200) {
        targetX = Math.sin(now / 2400) * 0.55;
        targetY = Math.sin(now / 3100 + 0.8) * 0.4;
      }
      const dt = Math.min((now - last) / 1000 || 0.016, 0.05);
      last = now;
      const alpha = 1 - Math.exp(-dt * 9);
      x += (targetX - x) * alpha;
      y += (targetY - y) * alpha;
      if (head.current)
        head.current.style.transform = `perspective(700px) translate(${x * 9}px,${y * 6}px) rotateY(${x * 7}deg) rotateX(${-y * 4}deg) rotateZ(${x * 0.9}deg)`;
      if (
        (touch.matches && inView) ||
        Math.abs(targetX - x) + Math.abs(targetY - y) > 0.001
      )
        frame = requestAnimationFrame(draw);
      else frame = 0;
    };
    const wake = () => {
      if (!frame && inView && !document.hidden && !media.matches) {
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
      if (media.matches) return;
      if (event.pointerType !== "mouse") {
        const bounds = portrait?.getBoundingClientRect();
        if (
          !bounds ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom ||
          event.clientX < bounds.left ||
          event.clientX > bounds.right
        )
          return;
        lastTouch = performance.now();
        targetX = Math.max(
          -1,
          Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2),
        );
        targetY = Math.max(
          -1,
          Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2),
        );
        wake();
        return;
      }
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
      wake();
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) wake();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    if (portrait) observer.observe(portrait);
    window.addEventListener("pointerdown", move, { passive: true });
    touch.addEventListener("change", preference);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", reset);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", visibility);
    media.addEventListener("change", preference);
    return () => {
      observer.disconnect();
      touch.removeEventListener("change", preference);
      window.removeEventListener("pointerdown", move);
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
