"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
const targets =
  ".credential-heading, .entries > .entry, .work > .section-heading, .work > .project, .toolkit-heading, .skills-grid > .skill-group, .recognition, .site-footer, .contact-intro > *, .contact-page > .booking-panel";
/** Progressive enhancement: content remains visible without JavaScript or with reduced motion. */
export function ScrollReveals() {
  const pathname = usePathname();
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(targets),
    );
    let observer: IntersectionObserver | null = null;
    const reveal = (element: HTMLElement, delay = 0, animate = true) => {
      element.style.setProperty("--reveal-delay", `${delay}ms`);
      element.dataset.scrollReveal = animate ? "visible" : "settled";
      observer?.unobserve(element);
    };
    const start = () => {
      observer?.disconnect();
      if (media.matches) {
        elements.forEach((element) => reveal(element, 0, false));
        return;
      }
      observer = new IntersectionObserver(
        (entries) => {
          const entering = entries
            .filter((entry) => entry.isIntersecting)
            .sort(
              (a, b) =>
                a.boundingClientRect.top - b.boundingClientRect.top ||
                a.boundingClientRect.left - b.boundingClientRect.left,
            );
          entering.forEach((entry, index) =>
            reveal(entry.target as HTMLElement, Math.min(index * 65, 195)),
          );
        },
        { rootMargin: "0px 0px -32px 0px", threshold: 0.06 },
      );
      for (const element of elements) {
        if (
          element.dataset.scrollReveal === "visible" ||
          element.dataset.scrollReveal === "settled"
        )
          continue;
        // Keep the content currently on screen in place; animate the next items as they arrive.
        if (element.getBoundingClientRect().top < innerHeight)
          reveal(element, 0, false);
        else {
          element.dataset.scrollReveal = "pending";
          observer.observe(element);
        }
      }
    };
    const focus = (event: FocusEvent) => {
      const element = (event.target as Element | null)?.closest<HTMLElement>(
        '[data-scroll-reveal="pending"]',
      );
      if (element) reveal(element, 0, false);
    };
    start();
    media.addEventListener("change", start);
    document.addEventListener("focusin", focus);
    return () => {
      observer?.disconnect();
      media.removeEventListener("change", start);
      document.removeEventListener("focusin", focus);
      for (const element of elements) {
        delete element.dataset.scrollReveal;
        element.style.removeProperty("--reveal-delay");
      }
    };
  }, [pathname]);
  return null;
}
