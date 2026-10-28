"use client";
import { ToastProvider } from "@ds/components";

/** Client-side roots: the toast queue and a skip link. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <a href="#main" className="sr-only z-toast rounded-md bg-surface-raised px-4 py-2 text-label-md text-ink shadow-md focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>
      {children}
    </ToastProvider>
  );
}
