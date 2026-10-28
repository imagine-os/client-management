import * as React from "react";

/* Internal glyphs the components draw themselves. Product icons come from Lucide. */
type GlyphProps = React.SVGProps<SVGSVGElement>;
const glyph = (d: React.ReactNode) =>
  function Glyph(props: GlyphProps) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{d}</svg>
    );
  };

export const ChevronDown = glyph(<path d="m6 9 6 6 6-6" />);
export const ChevronLeft = glyph(<path d="m15 18-6-6 6-6" />);
export const ChevronRight = glyph(<path d="m9 18 6-6-6-6" />);
export const Check = glyph(<path d="M20 6 9 17l-5-5" />);
export const Close = glyph(<><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>);
export const Info = glyph(<><circle cx="12" cy="12" r="9" /><path d="M12 16v-4" /><path d="M12 8h.01" /></>);
export const Alert = glyph(<><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>);
export const CheckCircle = glyph(<><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>);
export const XCircle = glyph(<><circle cx="12" cy="12" r="9" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></>);

export function Spinner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={"animate-spin " + (className ?? "")}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* Step-type glyphs for empty previews on the funnel canvas. */
export const PageGlyph = glyph(<><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8" /><path d="M8 12h8" /><path d="M8 16h5" /></>);
export const FormGlyph = glyph(<><rect x="4" y="3" width="16" height="18" rx="2" /><rect x="7.5" y="7" width="9" height="3" rx="1" /><rect x="7.5" y="13" width="9" height="3" rx="1" /></>);
export const MailGlyph = glyph(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 6.5 8.5 6 8.5-6" /></>);
export const StoreGlyph = glyph(<><path d="M4 9.5 5.5 4h13L20 9.5" /><path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0" /><path d="M5.5 12v8h13v-8" /><path d="M10 20v-4h4v4" /></>);
export const SignalGlyph = glyph(<><circle cx="12" cy="12" r="2" /><path d="M7.8 7.8a6 6 0 0 0 0 8.4" /><path d="M16.2 7.8a6 6 0 0 1 0 8.4" /><path d="M5 5a10 10 0 0 0 0 14" /><path d="M19 5a10 10 0 0 1 0 14" /></>);
/** Founding card: a numbered Founding 20 member card. Drawn with the create-icon skill (icons/custom/founding-card.svg). */
export const FoundingCardGlyph = glyph(<><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M8.5 8.3 L9.53 10.78 L12.21 10.99 L10.16 12.74 L10.79 15.36 L8.5 13.95 L6.21 15.36 L6.84 12.74 L4.79 10.99 L7.47 10.78Z" /><path d="M15 10h3" /><path d="M15 14h2" /></>);
