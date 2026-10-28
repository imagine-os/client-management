import * as React from "react";
import { cx } from "../components/cx";

export interface ScrollProgressProps {
  /** Element that scrolls. Default: the page. */
  target?: React.RefObject<HTMLElement | null>;
  /** "top" pins a thin bar to the top of the viewport; "inline" sits in the flow (inside a panel header). */
  placement?: "top" | "inline";
  className?: string;
  "aria-label"?: string;
}

/** A thin mint bar that fills as you scroll: reading progress on long pages and panels. */
export function ScrollProgress({ target, placement = "top", className, ...aria }: ScrollProgressProps) {
  const bar = React.useRef<HTMLDivElement>(null);
  const [value, setValue] = React.useState(0);
  React.useEffect(() => {
    const el = target?.current ?? null;
    let frame = 0;
    const read = () => {
      frame = 0;
      const top = el ? el.scrollTop : window.scrollY;
      const max = el ? el.scrollHeight - el.clientHeight : document.documentElement.scrollHeight - window.innerHeight;
      const v = max > 0 ? Math.min(1, Math.max(0, top / max)) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${v})`;
      setValue(Math.round(v * 100));
    };
    const on = () => { if (!frame) frame = requestAnimationFrame(read); };
    read();
    const src: HTMLElement | Window = el ?? window;
    src.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { src.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(frame); };
  }, [target]);
  return (
    <div role="progressbar" aria-label={aria["aria-label"] ?? "Scroll progress"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}
      className={cx(placement === "top" ? "fixed inset-x-0 top-0 z-toast h-1" : "relative h-1 w-full", "overflow-hidden", className)}>
      <div ref={bar} className="h-full origin-left scale-x-0 bg-action" />
    </div>
  );
}
