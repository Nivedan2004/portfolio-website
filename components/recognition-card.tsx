"use client";
import { useEffect, useState, type ReactNode } from "react";
import { RotateCcw, ArrowUpRight } from "lucide-react";

export function RecognitionCard({
  children,
  title,
  story,
  award = false,
}: {
  children: ReactNode;
  title: string;
  story: string;
  award?: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  useEffect(() => {
    if (!flipped) return;
    let furthest = window.scrollY;
    const onScroll = () => {
      if (window.scrollY < furthest - 12) setFlipped(false);
      furthest = Math.max(furthest, window.scrollY);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [flipped]);
  return (
    <article
      className={`recognition-flip${award ? " recognition-flip-award" : ""}`}
    >
      <button
        type="button"
        className="recognition-flip-trigger"
        aria-label={`${title}: ${flipped ? "show overview" : "read the story"}`}
        aria-pressed={flipped}
        onClick={() => setFlipped((value) => !value)}
      />
      <div className={`recognition-flip-inner${flipped ? " is-flipped" : ""}`}>
        <div
          className={`recognition-card recognition-front${award ? " recognition-award" : ""}`}
          aria-hidden={flipped}
        >
          {children}
          <span className="recognition-flip-hint">
            Read the story <ArrowUpRight size={15} />
          </span>
        </div>
        <div
          className={`recognition-card recognition-back${award ? " recognition-award" : ""}`}
          aria-hidden={!flipped}
        >
          <p className="recognition-back-label">{title}</p>
          <p className="recognition-story">{story}</p>
          <span className="recognition-flip-hint">
            Back to overview <RotateCcw size={14} />
          </span>
        </div>
      </div>
    </article>
  );
}
