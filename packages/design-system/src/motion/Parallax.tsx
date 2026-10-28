import * as React from "react";
import { cx } from "../components/cx";

export interface ParallaxProps extends React.HTMLAttributes<HTMLDivElement> {
  /** How much slower (positive) or faster (negative) than the scroll it moves. 0.2 is gentle; keep it under 0.5. */
  speed?: number;
}

/** Moves its content at a different speed from the scroll, for depth on decorative art (hero marks, covers). Never for text people read. */
export function Parallax({ speed = 0.2, className, children, ...rest }: ParallaxProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const move = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const offset = (r.top + r.height / 2 - window.innerHeight / 2) * speed;
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    };
    const on = () => { if (!frame) frame = requestAnimationFrame(move); };
    move();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(frame); };
  }, [speed]);
  return <div ref={ref} className={cx("will-change-transform", className)} {...rest}>{children}</div>;
}
