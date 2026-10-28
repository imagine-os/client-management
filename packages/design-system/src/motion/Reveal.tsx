import * as React from "react";
import { cx } from "../components/cx";

export type RevealEffect = "fade-up" | "scale-in" | "blur-in" | "slide-left" | "slide-right" | "clip-up" | "tilt-in" | "pop";
export const revealEffects: RevealEffect[] = ["fade-up", "scale-in", "blur-in", "slide-left", "slide-right", "clip-up", "tilt-in", "pop"];

export interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  /** How it arrives. Default "fade-up". */
  effect?: RevealEffect;
  /** Delay in ms, for staggering a group: index * 60. */
  delay?: number;
  /** Play again each time it re-enters the viewport. Default: once. */
  repeat?: boolean;
  /** How much must be visible before it plays, 0 to 1. Default 0.2. */
  threshold?: number;
}

/** Animates its content in as it scrolls into view. Content stays in the DOM and readable; under reduced motion it simply shows. */
export function Reveal({ effect = "fade-up", delay = 0, repeat = false, threshold = 0.2, className, style, children, ...rest }: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [shown, setShown] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setShown(true); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShown(true); if (!repeat) io.disconnect(); }
      else if (repeat) setShown(false);
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [repeat, threshold]);
  return (
    <div ref={ref} data-reveal={effect} data-shown={shown ? "" : undefined}
      style={{ ...style, ["--reveal-delay" as string]: `${delay}ms` }} className={cx(className)} {...rest}>
      {children}
    </div>
  );
}
