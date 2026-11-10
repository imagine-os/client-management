# Edge cases in the user flow, Nov 10

Each case: what someone does, what went wrong, and the fix. Severity is how likely and how confusing it is:
**High** loses work or looks broken, **Medium** confuses, **Low** is a rough edge.

## Data and storage
| # | Case | What happened | Fix | Sev |
|---|---|---|---|---|
| 1 | Two tabs open; edit in one | The other tab kept its old copy and overwrote the edit on its next change | Both stores listen for changes from other tabs and reload | High |
| 2 | Saved data unreadable (cleared halfway, edited by hand, a different shape) | The app crashed on load | Anything that isn't a list of clients falls back to the sample | High |
| 3 | "Reset sample" pressed by mistake | Every edit was gone at once, no way back | Asks first, and says what will be lost | High |

## Clients
| # | Case | What happened | Fix | Sev |
|---|---|---|---|---|
| 4 | A link to a client that doesn't exist (`/?c=old-id`) | The board showed with no word about the link | "We can't find that client" with a way back | Medium |
| 5 | A link to a client hidden by the team switch (Between Gigs team opens Harbor & Co.) | Same: silently the board | Says it's hidden by the team and offers "Show all clients" | Medium |
| 6 | Add a client while viewing the Between Gigs team | The new client was created but hidden by the team, so its page never opened | Switches to JAM Studio and says so | High |
| 7 | `?tab=` with an unknown tab | A client page with no tab content at all | Falls back to Overview | Low |
| 8 | Close New project that was opened from a link (`?new=1`, Templates → Use template) | The link kept `?new=1`, so a refresh or Back opened it again | Closing clears it from the address | Medium |
| 9 | Clear the start date in New project | Created a project with "Invalid Date" as its start | Start date is required, with a message | Medium |
| 10 | A client with no people or no milestones | An empty "People" heading; the portal ring said "0 of 0" | Short empty states instead | Low |

## Tasks
| # | Case | What happened | Fix | Sev |
|---|---|---|---|---|
| 11 | Empty the task name in the task panel | The task saved with no name: an invisible, unclickable row | The name can't be saved empty; an empty field explains why and keeps the last name | High |
| 12 | Board with done tasks hidden (the default) | The Done column always said 0, and a card dropped there vanished | Done shows how many are hidden, with "Show them" | High |
| 13 | Quick add in a filtered view ("Waiting on clients", "Urgent and high") | The new task didn't match the filters and disappeared as soon as it was added | New tasks take the view's single filter values (assignee, priority, client); if one still doesn't fit, a message says it's hidden by the filters | High |
| 14 | A search or filters that match nothing | List and Calendar showed empty groups with nothing to explain why | "No tasks match" with Clear filters and search | Medium |
| 15 | The bell's "Due soon" | Mixed overdue tasks in with ones due in the next days | Overdue tasks are marked as overdue | Low |
| 17 | The bell's assignee | Showed the internal id ("Studio") instead of the name ("JAM Studio") | Shows the person's name | Low |
| 18 | A count of one | "1 clients", "1 open tasks" in the status bar and headers | Singular and plural follow the number | Low |
| 19 | New project late in the evening (west of UTC) | The start date defaulted to tomorrow: it was read in UTC | Today in the viewer's own time zone | Low |

## Portal
| # | Case | What happened | Fix | Sev |
|---|---|---|---|---|
| 16 | A client with no notes yet | An empty "Latest updates" heading | "No updates yet" | Low |

## Checked
Each fix is covered by `pnpm qa`: the missing, hidden-by-team and unknown-tab client links, no search results and a
client portal with no milestones are QA routes (checked for the UI rules and axe in light and dark, desktop and
phone); emptying a task's name, adding a task in a saved view, the hidden-done count, reset asking first, closing
New project clearing the address, an edit in one tab showing in another, and unreadable saved data are steps in the
end-to-end flow.
