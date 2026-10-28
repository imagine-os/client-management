import * as React from "react";
import { cx } from "./cx";

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "value"> {
  label: string;
  value: number;
  onChange: (value: number) => void;
  /** Formats the value shown at the end ("25%", "92px"). Omit to hide it. */
  format?: (value: number) => string;
}

/** Picks a value on a continuous range (Card size, Shine, Pointer size). */
export function Slider({ label, value, onChange, format, min = 0, max = 100, step = 1, className, id, ...rest }: SliderProps) {
  const auto = React.useId();
  const sid = id ?? auto;
  const pct = ((value - Number(min)) / (Number(max) - Number(min))) * 100;
  return (
    <div className={cx("grid gap-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={sid} className="text-label-md text-ink">{label}</label>
        {format && <output htmlFor={sid} className="font-mono text-data-sm text-ink-muted tabular-nums">{format(value)}</output>}
      </div>
      <input
        id={sid}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--fill": `${pct}%` } as React.CSSProperties}
        className="range h-5 w-full cursor-pointer appearance-none bg-transparent"
        {...rest}
      />
    </div>
  );
}
