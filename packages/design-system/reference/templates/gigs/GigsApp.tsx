import * as React from "react";
import { flushSync } from "react-dom";
import { GigsterOnboarding } from "./GigsterOnboarding";
import { GigsterProfile } from "./GigsterProfile";
import { SearchResults } from "./SearchResults";
import type { GigsPage } from "./parts";

export interface GigsRoute { page: GigsPage; id?: string }

export interface GigsAppProps {
  imageBase?: string;
  /** Where the prototype starts. Default: search. */
  initial?: GigsRoute;
  /** Keep the route in location.hash (#/profile/maya), so pages can be linked and reloaded. */
  useHash?: boolean;
}

const parse = (hash: string): GigsRoute | null => {
  const [page, id] = hash.replace(/^#\/?/, "").split("/");
  return page === "search" || page === "profile" || page === "onboarding" ? { page, id } : null;
};

/** Nearest scrolling ancestor, or the page. */
function scroller(el: HTMLElement | null): HTMLElement {
  for (let n = el?.parentElement; n; n = n.parentElement) {
    const o = getComputedStyle(n).overflowY;
    if ((o === "auto" || o === "scroll") && n.scrollHeight > n.clientHeight) return n;
  }
  return (document.scrollingElement as HTMLElement) ?? document.documentElement;
}

/**
 * The three Between Gigs pages as one clickable prototype. Moving between them is a view transition:
 * the header holds still, the page cross-fades, and a person's portrait flies from their search card
 * into their profile and back.
 */
export function GigsApp({ imageBase = "img/", initial = { page: "search" }, useHash = false }: GigsAppProps) {
  const [route, setRoute] = React.useState<GigsRoute>(() => (useHash && parse(location.hash)) || initial);
  const root = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!useHash) return;
    const on = () => { const r = parse(location.hash); if (r) setRoute(r); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, [useHash]);

  const go = React.useCallback((next: GigsRoute) => {
    const apply = () => {
      flushSync(() => setRoute(next));
      scroller(root.current).scrollTop = 0;
      if (useHash) history.pushState(null, "", `#/${next.page}${next.id ? `/${next.id}` : ""}`);
    };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (!doc.startViewTransition || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) apply();
    else doc.startViewTransition(apply);
  }, [useHash]);

  const navigate = (page: GigsPage) => go({ page });
  const open = (id: string) => go({ page: "profile", id });

  return (
    <div ref={root} className="min-h-full">
      {route.page === "search" && <SearchResults imageBase={imageBase} onOpenProfile={open} onNavigate={navigate} />}
      {route.page === "profile" && <GigsterProfile key={route.id} personId={route.id} imageBase={imageBase} onBack={() => navigate("search")} onOpenProfile={open} onNavigate={navigate} />}
      {route.page === "onboarding" && <GigsterOnboarding imageBase={imageBase} onNavigate={navigate} />}
    </div>
  );
}
