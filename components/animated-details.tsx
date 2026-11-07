"use client";
import {
  useEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type MouseEvent,
} from "react";
type Props = Omit<ComponentPropsWithoutRef<"details">, "open" | "onClick">;
/** Keep native details semantics; retain content until the closing height animation finishes. */
export function AnimatedDetails({ children, ...props }: Props) {
  const element = useRef<HTMLDetailsElement>(null);
  const animation = useRef<Animation | null>(null);
  const targetOpen = useRef<boolean | null>(null);
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const settle = () => {
      const root = element.current;
      if (!root) return;
      animation.current?.cancel();
      animation.current = null;
      if (targetOpen.current !== null) root.open = targetOpen.current;
      targetOpen.current = null;
      root.style.removeProperty("height");
      root.style.removeProperty("overflow");
      delete root.dataset.animating;
    };
    const preference = () => {
      if (reduced.matches) settle();
    };
    const resize = () => settle();
    reduced.addEventListener("change", preference);
    window.addEventListener("resize", resize);
    return () => {
      animation.current?.cancel();
      reduced.removeEventListener("change", preference);
      window.removeEventListener("resize", resize);
    };
  }, []);
  const toggle = (event: MouseEvent<HTMLDetailsElement>) => {
    const root = element.current;
    if (!root || event.defaultPrevented || event.button !== 0) return;
    const target = event.target as HTMLElement;
    const summary = target.closest("summary");
    if (
      !summary ||
      summary.parentElement !== root ||
      target.closest("a,button,input,select,textarea")
    )
      return;
    event.preventDefault();
    const opening = !(targetOpen.current ?? root.open);
    targetOpen.current = opening;
    const from = root.getBoundingClientRect().height;
    animation.current?.cancel();
    animation.current = null;
    if (
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof root.animate !== "function"
    ) {
      root.open = opening;
      targetOpen.current = null;
      root.style.removeProperty("height");
      root.style.removeProperty("overflow");
      delete root.dataset.animating;
      return;
    }
    root.style.height = `${from}px`;
    root.style.overflow = "hidden";
    root.dataset.animating = "true";
    let to: number;
    if (opening) {
      root.open = true;
      root.style.height = "auto";
      to = root.getBoundingClientRect().height;
      root.style.height = `${from}px`;
    } else {
      const style = getComputedStyle(root);
      to =
        summary.getBoundingClientRect().bottom -
        root.getBoundingClientRect().top +
        parseFloat(style.borderBottomWidth || "0") +
        parseFloat(style.paddingBottom || "0");
    }
    const next = root.animate(
      { height: [`${from}px`, `${to}px`] },
      {
        duration: 400,
        easing: "cubic-bezier(.22, 1, .36, 1)",
        fill: "forwards",
      },
    );
    animation.current = next;
    next.onfinish = () => {
      if (animation.current !== next) return;
      root.open = opening;
      next.cancel();
      animation.current = null;
      targetOpen.current = null;
      root.style.removeProperty("height");
      root.style.removeProperty("overflow");
      delete root.dataset.animating;
    };
  };
  return (
    <details {...props} ref={element} onClick={toggle}>
      {children}
    </details>
  );
}
