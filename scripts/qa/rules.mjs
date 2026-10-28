// The measurable rules from docs/ui-rules.md, checked in the page. Returns [{ rule, detail }].
// Runs in the browser (page.evaluate), so it sees real computed styles at the real width.
export async function checkRules(page, { width }) {
  return page.evaluate(({ width }) => {
    const out = [];
    const add = (rule, el, extra = "") => {
      const text = (el.getAttribute?.("aria-label") || el.textContent || el.getAttribute?.("placeholder") || el.tagName).trim().replace(/\s+/g, " ").slice(0, 50);
      out.push({ rule, detail: `"${text}"${extra ? ` ${extra}` : ""}` });
    };
    const visible = (el) => {
      if (el.closest("[aria-hidden=true], [hidden], .sr-only, [inert]")) return false;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false;
      const s = getComputedStyle(el);
      return s.visibility !== "hidden" && s.display !== "none" && Number(s.opacity) > 0.05;
    };
    const px = (v) => parseFloat(v) || 0;

    // Touch targets (phones): 44×44 minimum. Links inside running text are exempt (WCAG's inline exception).
    if (width < 600) {
      for (const el of document.querySelectorAll("button, a[href], input:not([type=hidden]), select, textarea, [role=button], [role=tab], [role=checkbox], [role=radio], [role=switch]")) {
        if (!visible(el) || el.closest("iframe")) continue;
        // A labelled checkbox, radio or switch: the label is part of the target.
        if (el.matches("input[type=checkbox], input[type=radio], [role=switch]") && (el.closest("label") || el.labels?.length || el.getAttribute("aria-labelledby"))) continue;
        let r = el.getBoundingClientRect();
        // A link or button whose ::after covers its card (after:absolute after:inset-0): the card is the target.
        const after = getComputedStyle(el, "::after");
        if (after.content !== "none" && after.position === "absolute") {
          let host = el.parentElement;
          while (host && getComputedStyle(host).position === "static") host = host.parentElement;
          if (host) r = host.getBoundingClientRect();
        }
        if (el.tagName === "A" || el.tagName === "BUTTON") {
          // Inside running text (WCAG's inline exception): a link or text button within a longer sentence.
          let block = el.parentElement;
          while (block && getComputedStyle(block).display.startsWith("inline")) block = block.parentElement;
          if (block && getComputedStyle(el).display.startsWith("inline") && block.textContent.trim().length > el.textContent.trim().length + 12) continue;
          const sentence = el.closest("p, dd, td, label");
          if (sentence && sentence.textContent.trim().length > el.textContent.trim().length + 12) continue;
        }
        if (Math.min(r.width, r.height) < 24 || (r.height < 44 && r.width < 44) || r.height < 32) add("touch-target", el, `(${Math.round(r.width)}×${Math.round(r.height)}px)`);
      }
    }

    // Text: running text at least 14px (16px for long text), line height ~1.5, 45–80 characters a line, left aligned.
    for (const el of document.querySelectorAll("p, li, dd, blockquote")) {
      if (!visible(el) || el.closest("iframe, [role=dialog] footer, nav, button, a, label, table")) continue;
      const text = el.textContent.trim();
      if (text.length < 60 || el.querySelector("p, li, ul, ol, div")) continue;
      const s = getComputedStyle(el), size = px(s.fontSize), lh = s.lineHeight === "normal" ? size * 1.2 : px(s.lineHeight);
      const r = el.getBoundingClientRect(), lines = Math.round(r.height / lh);
      if (size < 14) add("text-too-small", el, `(${size}px)`);
      else if (text.length > 160 && size < 16 && lines >= 3) add("long-text-below-16px", el, `(${size}px, ${lines} lines)`);
      if (lines >= 2 && lh / size < 1.35) add("line-height", el, `(${(lh / size).toFixed(2)})`);
      if (lines >= 3) {
        const perLine = text.length / lines;
        if (perLine > 85) add("line-too-long", el, `(~${Math.round(perLine)} chars a line)`);
      }
      if (lines >= 3 && s.textAlign === "center") add("centered-long-text", el, `(${lines} lines)`);
    }

    // Long all-caps: uppercase text of more than four words.
    for (const el of document.querySelectorAll("p, span, h1, h2, h3, h4, li, a, button, dt, th")) {
      if (!visible(el) || el.children.length) continue;
      const text = el.textContent.trim();
      const words = text.split(/\s+/).filter((w) => /[a-z]/i.test(w)).length;
      if (words > 4 && (getComputedStyle(el).textTransform === "uppercase" || (text === text.toUpperCase() && /[A-Z]{3}/.test(text)))) add("long-all-caps", el, `(${words} words)`);
    }

    // Placeholders are examples, never the label.
    for (const el of document.querySelectorAll("input[placeholder], textarea[placeholder]")) {
      if (!visible(el) || el.type === "search") continue;
      // A visible label, or an accessible name inside a labelled group (a list of credits under "Credits").
      const labelled = el.labels?.length || el.getAttribute("aria-labelledby") || (el.getAttribute("aria-label") && el.closest("fieldset, [role=group], [aria-labelledby]"));
      if (!labelled) add("placeholder-as-label", el);
    }

    // One primary action per view: count visible mint buttons outside dialogs (dialogs are their own view).
    const probe = document.createElement("span");
    probe.style.background = "var(--action)";
    document.body.append(probe);
    const mint = getComputedStyle(probe).backgroundColor;
    probe.remove();
    const primaries = [...document.querySelectorAll("button, a[href]")].filter((el) => visible(el) && !el.closest("[role=dialog], dialog, [aria-modal=true]") && getComputedStyle(el).backgroundColor === mint && el.getBoundingClientRect().height >= 28);
    // A view is roughly a screenful: count primaries that share the first screen.
    const firstScreen = primaries.filter((el) => { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; });
    if (firstScreen.length > 1) out.push({ rule: "one-primary-per-view", detail: firstScreen.map((el) => `"${el.textContent.trim().slice(0, 30)}"`).join(", ") });

    // Disabled buttons need a reason nearby (pagination, steppers, zoom and carousels are exempt).
    for (const el of document.querySelectorAll("button:disabled, [aria-disabled=true]")) {
      if (!visible(el)) continue;
      const name = (el.getAttribute("aria-label") || el.textContent || "").trim();
      if (/previous|next|zoom|page|scroll|back|forward|earlier|later|more/i.test(name)) continue;
      if (el.getAttribute("aria-describedby") || el.title) continue;
      add("disabled-without-reason", el);
    }
    return out;
  }, { width });
}
