// Every route QA visits. `ready` waits for content; `act` interacts before the checks and the shot.
// Each context starts with empty storage, so every route sees the seed clients.
export const routes = [
  { name: "clients-board", path: "/", ready: "[data-stage]" },
  { name: "clients-list", path: "/", ready: "[data-stage]", act: async (page) => { await page.getByRole("radio", { name: "List" }).click(); await page.locator("main ul li").first().waitFor(); } },
  { name: "client-overview", path: "/?c=between-gigs", ready: "#ms-h" },
  { name: "client-projects", path: "/?c=between-gigs&tab=projects", ready: "#ws-h" },
  { name: "client-tasks", path: "/?c=between-gigs&tab=tasks", ready: "main ul li" },
  { name: "client-notes", path: "/?c=between-gigs&tab=notes", ready: "main ol li" },
  { name: "client-sample", path: "/?c=northlight", ready: "#ms-h" },
  { name: "client-empty-projects", path: "/?c=harbor&tab=projects", ready: "main [role=tabpanel]" },
  { name: "new-project", path: "/?new=1&type=web-app", ready: "#np-plan" },
  { name: "templates", path: "/templates/", ready: "main h1" },
  { name: "portal", path: "/portal/?c=between-gigs", ready: "#hello-h" },
  { name: "portal-sample", path: "/portal/?c=kestrel", ready: "#hello-h" },
  { name: "not-found", path: "/nowhere/", ready: "h1" },
];
