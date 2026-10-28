import * as React from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Calendar, Check, ChevronLeft, ChevronRight, MapPin, MessageSquare, Quote, Star, Wallet } from "lucide-react";
import { Accordion, Badge, Button, Field, IconButton, Input, Modal, Select, Tag, Textarea, cx } from "../../components";
import { Reveal } from "../../motion";
import { availabilityLabel, exampleReviews, faqs, people, type Person } from "./data";
import { Portrait, SiteFooter, SiteHeader, useImg, type GigsPage } from "./parts";

export interface GigsterProfileProps {
  /** Which sample person. Default "maya". */
  personId?: string;
  imageBase?: string;
  onBack?: () => void;
  onOpenProfile?: (id: string) => void;
  onNavigate?: (page: GigsPage) => void;
}

const sections = [["overview", "Overview"], ["services", "Services"], ["portfolio", "Portfolio"], ["reviews", "Reviews"], ["experience", "Experience"], ["faqs", "FAQs"]] as const;

/** A Gigster's public profile: who they are, what they do, their work, and how to book them. */
export function GigsterProfile({ personId = "maya", imageBase = "img/", onBack, onOpenProfile, onNavigate }: GigsterProfileProps) {
  const p = people.find((x) => x.id === personId) ?? people[0];
  const img = useImg(imageBase);
  const [active, setActive] = React.useState<string>("overview");
  const [lightbox, setLightbox] = React.useState<number | null>(null);
  const [request, setRequest] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const root = React.useRef<HTMLDivElement>(null);

  // Scrollspy: the tab for the section in view lights up.
  React.useEffect(() => {
    // Scoped to this page, so a second copy elsewhere (a preview) never steals the lookup.
    const els = Array.from(root.current?.querySelectorAll<HTMLElement>("[data-section]") ?? []);
    const io = new IntersectionObserver((es) => {
      const vis = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (vis) setActive(vis.target.getAttribute("data-section") ?? "overview");
    }, { rootMargin: "-35% 0px -55% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [p.id]);
  const jump = (id: string) => root.current?.querySelector(`[data-section="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const others = people.filter((x) => x.id !== p.id).slice(0, 3);
  const glance: [string, React.ReactNode, string?][] = [
    ["Location", `${p.area}, Los Angeles area`, `${p.miles} miles from central Los Angeles`],
    ["Rate", <>From <b className="text-ink">${p.rate}/hour</b></>, "Project scope agreed together"],
    ["Availability", availabilityLabel[p.availability], "Illustrative, not a live calendar"],
    ["Travel & work mode", "To be discussed for your project"],
    ["Tools & equipment", p.tools],
    ["Insurance", "Not provided · Not verified"],
  ];

  return (
    <div ref={root} className="min-h-full bg-bg text-ink">
      <SiteHeader current="search" onNavigate={onNavigate} />

      {/* Ambient glow from the person's own work */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-16 -z-0 h-96 overflow-hidden">
        <img src={img(p.portfolio[0].src)} alt="" className="size-full scale-125 object-cover opacity-30 blur-3xl" />
        <span className="absolute inset-0 bg-linear-to-b from-transparent to-bg" />
      </div>

      <main className="relative mx-auto max-w-7xl px-4 pt-6 pb-20 sm:px-6">
        <Button variant="ghost" size="sm" iconStart={<ArrowLeft />} onClick={onBack}>Back to search results</Button>

        <div className="mt-4 grid gap-10 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-8">
            {/* Hero */}
            <section className="grid gap-6 sm:grid-cols-12 sm:items-end">
              <div className="relative sm:col-span-5">
                <Portrait person={p} src={img(`${p.id}.jpg`)} className="aspect-square w-full rounded-2xl shadow-lg ring-1 ring-line" />
                <Badge tone={p.availability === "this-week" ? "success" : "info"} className="absolute top-3 left-3 shadow-sm">{availabilityLabel[p.availability]}</Badge>
              </div>
              <div className="sm:col-span-7">
                <Reveal effect="fade-up"><p className="text-eyebrow text-ink-brand uppercase">{p.service}</p></Reveal>
                <Reveal effect="fade-up" delay={80}><h1 className="mt-2 font-display text-display-md text-ink sm:text-display-lg">{p.name}</h1></Reveal>
                <Reveal effect="fade-up" delay={160}>
                  <p className="mt-2 text-body-lg text-ink-muted">{p.helps.slice(0, 3).join(" · ")}</p>
                  <ul className="mt-5 grid gap-2 text-body-md text-ink">
                    <li className="flex items-center gap-2"><MapPin className="size-4 text-ink-brand" />{p.area}, Los Angeles area · {p.miles} miles away</li>
                    <li className="flex items-center gap-2"><Wallet className="size-4 text-ink-brand" />From <b>${p.rate}/hour</b> · scope agreed together</li>
                    <li className="flex items-center gap-2"><Calendar className="size-4 text-ink-brand" />{availabilityLabel[p.availability]}</li>
                  </ul>
                  <div className="mt-5 flex flex-wrap gap-2"><Badge tone="neutral" size="sm">Fictional profile</Badge><Badge tone="neutral" size="sm">Sample availability</Badge><Badge tone="warning" size="sm">Credits not verified</Badge></div>
                </Reveal>
              </div>
            </section>

            {/* Section nav */}
            <nav aria-label="Profile sections" className="sticky top-16 z-sticky -mx-4 mt-10 border-b border-line bg-bg/90 px-4 backdrop-blur-md sm:mx-0 sm:px-0">
              <ul className="flex gap-1 overflow-x-auto">
                {sections.map(([id, label]) => (
                  <li key={id}>
                    <button type="button" onClick={() => jump(id)} aria-current={active === id ? "true" : undefined}
                      className={cx("relative inline-flex min-h-12 items-center px-3 text-label-md whitespace-nowrap transition-colors duration-fast",
                        active === id ? "text-ink after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-action" : "text-ink-muted hover:text-ink")}>
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <Section id={`${p.id}-overview`} name="overview" title="About me">
              <p className="font-serif text-editorial-lg text-ink">{p.about}</p>
              <p className="mt-2 text-caption text-ink-subtle">Illustrative biography for this fictional profile.</p>
              <h3 className="mt-10 font-display text-heading-lg text-ink">What I can help you with</h3>
              <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                {p.helps.map((h, i) => (
                  <li key={h}>
                    <Reveal effect="fade-up" delay={i * 50} className="group flex items-center gap-3 rounded-xl border border-line bg-surface p-2.5 transition duration-base hover:-translate-y-0.5 hover:border-ink-brand hover:shadow-md">
                      <img src={img(p.portfolio[i % p.portfolio.length].src)} alt="" className="size-12 shrink-0 rounded-lg object-cover transition-transform duration-slow group-hover:scale-105" />
                      <span className="text-label-md text-ink">{h}</span>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </Section>

            <Section id={`${p.id}-services`} name="services" title="Popular services" meta="Sample rates match the search result">
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {p.helps.slice(0, 4).map((h, i) => (
                  <li key={h}>
                    <Reveal effect="fade-up" delay={i * 70} className="group overflow-hidden rounded-2xl border border-line bg-surface transition duration-base hover:-translate-y-0.5 hover:shadow-lg">
                      <div className="aspect-video overflow-hidden"><img src={img(p.portfolio[i % p.portfolio.length].src)} alt="" className="size-full object-cover transition-transform duration-slow group-hover:scale-105" /></div>
                      <div className="grid gap-1 p-4">
                        <h3 className="font-display text-heading-md text-ink">{h}</h3>
                        <p className="text-body-sm text-ink-muted">Discuss scope and details</p>
                        <p className="mt-2 text-body-sm text-ink-muted">From <b className="font-display text-heading-md text-ink">${p.rate}/hr</b></p>
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </Section>

            <Section id={`${p.id}-portfolio`} name="portfolio" title="Portfolio" meta={`${p.portfolio.length} illustrative concepts`}>
              <p className="-mt-2 mb-4 text-body-sm text-ink-muted">Example imagery showing the kinds of projects we could discuss. Concept images, not completed client work.</p>
              {/* Bento: 4 images = one large, one wide, two small; 6 = one large, two stacked, three across. */}
              <ul className={cx("grid grid-cols-2 gap-3", p.portfolio.length === 4 ? "md:grid-cols-4" : "md:grid-cols-3")}>
                {p.portfolio.map((it, i) => (
                  <li key={it.src} className={cx(i === 0 ? "col-span-2 row-span-2" : "h-36 md:h-44", p.portfolio.length === 4 && i === 1 && "col-span-2")}>
                    <Reveal effect="fade-up" delay={i * 60} className="h-full">
                      <button type="button" onClick={() => setLightbox(i)} aria-label={`Open ${it.caption}`}
                        className="group relative block size-full min-h-36 overflow-hidden rounded-xl">
                        <img src={img(it.src)} alt="" className="size-full object-cover transition-transform duration-slow group-hover:scale-105" />
                        <span className="absolute inset-x-0 bottom-0 translate-y-2 bg-linear-to-t from-surface-brand to-transparent p-3 pt-8 text-left text-label-md text-ink-on-brand opacity-0 transition duration-base group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">{it.caption}</span>
                      </button>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </Section>

            <Section id={`${p.id}-reviews`} name="reviews" title="Reviews" meta="Illustrative layout only">
              <p className="-mt-2 mb-4 text-body-sm text-ink-muted">No real client reviews exist for fictional profiles. These show the proposed layout.</p>
              <ul className="grid gap-4 md:grid-cols-3">
                {exampleReviews.map((r, i) => (
                  <li key={r.by}>
                    <Reveal effect="fade-up" delay={i * 90} className="flex h-full flex-col gap-4 rounded-2xl border border-line bg-surface p-5">
                      <Quote className="size-6 text-ink-brand" aria-hidden="true" />
                      <p className="font-serif text-editorial-lg text-ink">{r.quote}</p>
                      <div className="mt-auto flex items-center justify-between"><span className="text-body-sm text-ink-subtle">{r.by}</span><Badge tone="neutral" size="sm">Example · fictional</Badge></div>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </Section>

            <Section id={`${p.id}-experience`} name="experience" title="Professional experience">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-line bg-surface p-5">
                  <p className="text-body-md text-ink">{p.experience}</p>
                  <h3 className="mt-5 text-label-md text-ink">Selected credits</h3>
                  <p className="mt-1 text-body-sm text-ink-muted">No real credits or IMDb profile are attached to this fictional sample.</p>
                </div>
                <div className="rounded-2xl border border-line bg-surface p-5">
                  <h3 className="text-label-md text-ink">Certifications & training</h3>
                  <p className="mt-1 text-body-sm text-ink-muted">No certifications, background checks or verified credentials are claimed in this demo.</p>
                  <h3 className="mt-5 text-label-md text-ink">Languages</h3>
                  <p className="mt-1 text-body-sm text-ink-muted">Not specified in this sample.</p>
                </div>
              </div>
            </Section>

            <Section id={`${p.id}-faqs`} name="faqs" title="FAQs">
              <Accordion variant="flush" items={faqs(p.first).map((f, i) => ({ id: `${p.id}-faq-${i}`, title: f.q, content: f.a }))} />
            </Section>

            {/* Similar */}
            <section aria-labelledby={`${p.id}-similar`} className="mt-16">
              <h2 id={`${p.id}-similar`} className="font-display text-display-sm text-ink">You might also like</h2>
              <ul className="mt-5 grid gap-4 sm:grid-cols-3">
                {others.map((o, i) => (
                  <li key={o.id}>
                    <Reveal effect="fade-up" delay={i * 80}>
                      <button type="button" onClick={() => onOpenProfile?.(o.id)} className="group block w-full overflow-hidden rounded-2xl border border-line bg-surface text-left transition duration-base hover:-translate-y-0.5 hover:shadow-lg">
                        <div className="aspect-video overflow-hidden"><Portrait person={o} morph={false} src={img(`${o.id}.jpg`)} className="size-full transition-transform duration-slow group-hover:scale-105" /></div>
                        <div className="flex items-center justify-between gap-2 p-4">
                          <span><b className="block font-display text-heading-md text-ink">{o.name}</b><span className="text-body-sm text-ink-muted">{o.service}</span></span>
                          <ArrowUpRight className="size-5 text-ink-brand transition-transform duration-base group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                      </button>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Booking rail */}
          <aside className="lg:col-span-4">
            <div className="grid gap-5 lg:sticky lg:top-24">
              <Reveal effect="fade-up" className="rounded-2xl border border-line bg-surface p-5 shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <p><span className="block text-caption text-ink-subtle">From</span><span className="font-display text-display-sm text-ink">${p.rate}</span><span className="text-body-md text-ink-muted">/hour</span></p>
                  <IconButton label={saved ? "Unsave" : "Save"} pressed={saved} onClick={() => setSaved(!saved)} variant="ghost" icon={<Star className={cx(saved && "fill-current")} />} />
                </div>
                <p className="mt-1 flex items-center gap-2 text-body-sm text-ink-muted"><span className="size-2 rounded-full bg-success" aria-hidden="true" />{availabilityLabel[p.availability]}</p>
                <div className="mt-5 grid gap-2">
                  <Button variant="primary" size="lg" fullWidth className="glow-hover" iconEnd={<ArrowRight />} onClick={() => setRequest(true)}>Request {p.first}</Button>
                  <Button variant="secondary" size="lg" fullWidth iconStart={<Calendar />} onClick={() => setRequest(true)}>Check availability</Button>
                </div>
                <p className="mt-4 text-center text-body-sm text-ink-muted">Not sure what you need? <button type="button" onClick={() => setRequest(true)} className="inline-flex min-h-6 items-center font-semibold text-link underline underline-offset-4">Tell us about your project</button></p>
                <p className="mt-2 text-center text-caption text-ink-subtle">Preview only · no message is sent</p>
              </Reveal>

              <section aria-labelledby={`${p.id}-glance`} className="rounded-2xl border border-line bg-surface p-5">
                <h2 id={`${p.id}-glance`} className="font-display text-heading-lg text-ink">At a glance</h2>
                <dl className="mt-3 grid gap-3">
                  {glance.map(([k, v, note]) => (
                    <div key={k} className="grid gap-0.5 border-t border-line pt-3 first:border-0 first:pt-0">
                      <dt className="text-label-sm text-ink-subtle">{k}</dt>
                      <dd className="text-body-md text-ink-muted">{v}{note && <span className="block text-caption text-ink-subtle">{note}</span>}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section data-theme="dark" className="relative isolate overflow-hidden rounded-2xl bg-surface-brand p-6">
                <span aria-hidden="true" className="glow-horizon" />
                <div className="relative z-raised">
                  <h2 className="font-display text-heading-lg text-ink">Have a larger project?</h2>
                  <p className="mt-2 text-body-md text-ink-muted">Tell us what you need and we'll suggest a team of Gigsters.</p>
                  <Button variant="primary" className="glow-hover mt-4" iconEnd={<ArrowRight />} onClick={() => setRequest(true)}>Preview a custom match</Button>
                </div>
              </section>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter onNavigate={onNavigate} />

      <Lightbox person={p} img={img} index={lightbox} onIndex={setLightbox} />
      <RequestModal person={p} open={request} onClose={() => setRequest(false)} />
    </div>
  );
}

function Section({ id, name, title, meta, children }: { id: string; name: string; title: string; meta?: string; children: React.ReactNode }) {
  return (
    <section id={id} data-section={name} aria-labelledby={`${id}-h`} className="scroll-mt-32 pt-14">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <Reveal effect="fade-up"><h2 id={`${id}-h`} className="font-display text-display-sm text-ink">{title}</h2></Reveal>
        {meta && <span className="text-caption text-ink-subtle">{meta}</span>}
      </div>
      {children}
    </section>
  );
}

function Lightbox({ person: p, img, index, onIndex }: { person: Person; img: (f: string) => string; index: number | null; onIndex: (i: number | null) => void }) {
  const n = p.portfolio.length;
  const it = index === null ? null : p.portfolio[index];
  React.useEffect(() => {
    if (index === null) return;
    const key = (e: KeyboardEvent) => { if (e.key === "ArrowRight") onIndex((index + 1) % n); if (e.key === "ArrowLeft") onIndex((index - 1 + n) % n); };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [index, n, onIndex]);
  return (
    <Modal open={index !== null} onClose={() => onIndex(null)} size="lg" title={it?.caption ?? ""} description={`${p.name} · concept ${index === null ? "" : index + 1} of ${n} · illustrative, not client work`}>
      {it && (
        <div className="grid gap-3">
          <img key={it.src} src={img(it.src)} alt={it.caption} className="aspect-video w-full rounded-xl object-cover" />
          <div className="flex items-center justify-between">
            <Button variant="secondary" size="sm" iconStart={<ChevronLeft />} onClick={() => onIndex(((index ?? 0) - 1 + n) % n)}>Previous</Button>
            <span className="font-mono text-data-sm text-ink-subtle">{(index ?? 0) + 1} / {n}</span>
            <Button variant="secondary" size="sm" iconEnd={<ChevronRight />} onClick={() => onIndex(((index ?? 0) + 1) % n)}>Next</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function RequestModal({ person: p, open, onClose }: { person: Person; open: boolean; onClose: () => void }) {
  const [sent, setSent] = React.useState(false);
  const [what, setWhat] = React.useState("");
  const [err, setErr] = React.useState<string>();
  React.useEffect(() => { if (!open) { setSent(false); setErr(undefined); } }, [open]);
  return (
    <Modal open={open} onClose={onClose} title={sent ? "Request drafted" : `Request ${p.first}`} description={sent ? undefined : "Preview only. Nothing is sent from this concept."}
      footer={sent ? <Button variant="primary" onClick={onClose}>Done</Button> : (
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" iconStart={<MessageSquare />} onClick={() => { if (what.trim().length < 10) { setErr("Add a sentence about the project, like what and where."); return; } setSent(true); }}>Draft request</Button>
        </>
      )}>
      {sent ? (
        <div className="grid justify-items-center gap-3 py-6 text-center">
          <Reveal effect="fade-up" className="grid size-16 place-items-center rounded-full bg-action text-on-action shadow-lg"><Check className="size-8" /></Reveal>
          <p className="max-w-sm text-body-md text-ink-muted">In the live product, {p.first} would get your note and reply to agree scope, timing and the final rate. In this concept, nothing was sent.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          <Field label="What's the project?" error={err} hint={err ? undefined : `For example: "Hem two pairs of trousers and take in a jacket."`}>
            <Textarea rows={3} value={what} onChange={(e) => setWhat(e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="When?"><Select defaultValue="this-week" options={[{ value: "this-week", label: "This week" }, { value: "next-week", label: "Next week" }, { value: "flexible", label: "I'm flexible" }]} /></Field>
            <Field label="Where?"><Input defaultValue="Los Angeles, CA" start={<MapPin />} /></Field>
          </div>
        </div>
      )}
    </Modal>
  );
}
