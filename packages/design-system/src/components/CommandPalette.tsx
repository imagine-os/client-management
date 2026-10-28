import * as React from "react";
import { cx } from "./cx";
import { Kbd } from "./Kbd";

export interface Command {
  id: string;
  label: string;
  /** Group heading ("Modules", "Actions", "Companies"). */
  group: string;
  onRun: () => void;
  icon?: React.ReactNode;
  /** Extra words that should match ("settings" for "Workspace settings"). */
  keywords?: string;
  shortcut?: string[];
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  commands: Command[];
  placeholder?: string;
}

/** ⌘K: jump to any module, company or action by typing. Pair with useCommandShortcut to open it from the keyboard. */
export function CommandPalette({ open, onClose, commands, placeholder = "Search modules, companies and actions…" }: CommandPaletteProps) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const listId = React.useId();

  React.useEffect(() => {
    const d = ref.current; if (!d) return;
    if (open && !d.open) { setQuery(""); setActive(0); d.showModal(); }
    if (!open && d.open) d.close();
  }, [open]);

  const q = query.trim().toLowerCase();
  const shown = commands.filter((c) => !q || (c.label + " " + c.group + " " + (c.keywords ?? "")).toLowerCase().includes(q));
  const groups: string[] = [];
  shown.forEach((c) => { if (!groups.includes(c.group)) groups.push(c.group); });
  const ordered = groups.flatMap((g) => shown.filter((c) => c.group === g));
  React.useEffect(() => { setActive(0); }, [query]);
  const run = (c: Command) => { onClose(); c.onRun(); };

  return (
    <dialog
      ref={ref}
      aria-label="Command palette"
      onClose={onClose}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-x-4 top-24 mx-auto w-auto max-w-xl border-0 bg-transparent p-0 text-ink backdrop:bg-scrim"
    >
      <div className="overflow-hidden rounded-xl border border-line bg-surface-raised shadow-lg">
        <input
          autoFocus
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={ordered[active] ? `${listId}-${active}` : undefined}
          aria-label="Search commands"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, ordered.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            if (e.key === "Enter" && ordered[active]) { e.preventDefault(); run(ordered[active]); }
          }}
          placeholder={placeholder}
          className="h-14 w-full border-b border-line bg-transparent px-5 text-body-lg text-ink outline-none placeholder:text-ink-subtle focus-visible:outline-none"
        />
        <div id={listId} role="listbox" aria-label="Commands" className="max-h-96 overflow-auto p-2">
          {ordered.length === 0 && <p className="px-3 py-6 text-center text-body-md text-ink-muted">Nothing matches “{query}”.</p>}
          {groups.map((g) => (
            <div key={g} role="group" aria-label={g} className="grid">
              <div className="px-3 pt-3 pb-1 text-eyebrow text-ink-subtle uppercase">{g}</div>
              {ordered.map((c, i) => c.group !== g ? null : (
                <div
                  key={c.id}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onClick={() => run(c)}
                  onMouseEnter={() => setActive(i)}
                  className={cx("flex h-10 cursor-pointer items-center gap-3 rounded-md px-3 text-body-md text-ink [&_svg]:size-4 [&_svg]:text-ink-muted", i === active && "bg-surface-hover")}
                >
                  {c.icon}
                  <span className="min-w-0 flex-1 truncate">{c.label}</span>
                  {c.shortcut && <Kbd keys={c.shortcut} />}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 border-t border-line px-4 py-2 text-caption text-ink-subtle">
          <span className="flex items-center gap-1.5"><Kbd keys={["↑", "↓"]} /> move</span>
          <span className="flex items-center gap-1.5"><Kbd keys={["↵"]} /> open</span>
          <span className="flex items-center gap-1.5"><Kbd keys={["Esc"]} /> close</span>
        </div>
      </div>
    </dialog>
  );
}

/** Calls onOpen on ⌘K (Mac) or Ctrl+K (Windows, Linux). */
export function useCommandShortcut(onOpen: () => void) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); onOpen(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpen]);
}
