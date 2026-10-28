/*
 * The team in view, kept in this browser: "Our studio" sees every client; the Between Gigs team sees only its own.
 * One small store with a subscribe, so the switcher and the board change together.
 */
import * as React from "react";

export const teams = [
  { id: "studio", name: "Our studio", sub: "Every client and project" },
  { id: "between-gigs", name: "Between Gigs team", sub: "Only the Between Gigs client" },
] as const;
export type TeamId = (typeof teams)[number]["id"];

const KEY = "cm-team";
const subs = new Set<() => void>();
const read = (): TeamId => { try { return localStorage.getItem(KEY) === "between-gigs" ? "between-gigs" : "studio"; } catch { return "studio"; } };

export const teamStore = {
  set(team: TeamId) {
    try { localStorage.setItem(KEY, team); } catch { /* storage blocked: kept for this visit */ }
    subs.forEach((f) => f());
  },
};

/** The team in view. "studio" until mounted, so the static build and the first paint agree. */
export function useTeam() {
  const [id, setId] = React.useState<TeamId>("studio");
  React.useEffect(() => {
    const sync = () => setId(read());
    sync();
    subs.add(sync);
    return () => { subs.delete(sync); };
  }, []);
  return teams.find((t) => t.id === id) ?? teams[0];
}

/** The clients a team sees. */
export const scoped = <T extends { id: string }>(clients: T[], team: TeamId) => (team === "between-gigs" ? clients.filter((c) => c.id === "between-gigs") : clients);
