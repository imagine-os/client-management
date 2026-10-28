import * as React from "react";
import { ArrowLeft, ArrowRight, Check, Film, Link2, MapPin, Pencil, Plus, Sparkles, Trash2, X } from "lucide-react";
import { Badge, Banner, Button, Field, IconButton, Input, Progress, Select, Stepper, Textarea, cx } from "../../components";
import { Reveal, startPageTransition } from "../../motion";
import { laServiceAreas, offSetServices, onSetSkills, people } from "./data";
import { ChipPicker, SiteHeader, useImg, type GigsPage } from "./parts";

export interface GigsterOnboardingProps {
  imageBase?: string;
  onNavigate?: (page: GigsPage) => void;
}

interface Draft {
  photo: boolean; name: string; years: string; position: string; imdb: string; credits: string[];
  skills: string[]; services: string[]; other: string;
  market: string; otherCity: string; zip: string; areas: string[]; travel: string; month: string; status: string; dates: string; rate: string; basis: string;
  about: string; languages: string; insurance: string; insuranceNotes: string; tools: string; transport: string; mode: string;
}

const maya = people[0];
const start: Draft = {
  photo: true, name: "Maya Chen", years: "0", position: "Costume & wardrobe", imdb: "https://www.imdb.com/name/nm0000000/", credits: ["Fictional production · Wardrobe assistant (sample credit)"],
  skills: ["Wardrobe & costume"], services: ["Wardrobe & Personal Styling", "Wardrobe & Laundry Care"], other: "",
  market: "la", otherCity: "", zip: "90026", areas: ["Eastside", "Downtown"], travel: "", month: "October 2026", status: "available", dates: "Weekday mornings; exact project dates to confirm", rate: "45", basis: "hourly",
  about: "Thoughtful alterations, wardrobe edits and custom pieces for everyday life. I bring a costume and wardrobe perspective to the clothes you already own. We can explore alterations, closet styling and garment care. My approach is thoughtful, practical and collaborative. We will agree the scope, timing and final rate before starting.",
  languages: "English, Spanish", insurance: "private", insuranceNotes: "", tools: "Sewing kit and garment-care tools; project-specific equipment to discuss", transport: "Personal vehicle; material transport to discuss", mode: "on-site",
};

const STEPS = ["About you", "Skills", "Where & when", "Your story", "Review"];
const HEADS: [string, string][] = [
  ["Meet your Gigster", "Start with the experience that makes you, you."],
  ["Your skills & services", "Pick everything that fits. Tap again to remove."],
  ["Where & when", "Where you work, and when you're free this month."],
  ["A little more about you", "One About Me tells your story. A few optional details set expectations."],
  ["Review your profile", "Check it top to bottom. You can jump back to any step."],
];

function validate(step: number, d: Draft): Record<string, string> {
  const e: Record<string, string> = {};
  if (step === 0) {
    if (!d.photo) e.photo = "Add a profile photo.";
    if (!d.name.trim()) e.name = "Enter your full name.";
    if (d.years === "" || Number.isNaN(Number(d.years))) e.years = "Enter years in the business, like 6.";
    if (!d.position.trim()) e.position = "Enter your industry position or department.";
    if (!/^https:\/\/(www\.)?imdb\.com\/name\/nm\d+\/?$/.test(d.imdb.trim())) e.imdb = "Use an IMDb name-profile link, like https://www.imdb.com/name/nm1234567/.";
    if (!d.credits.some((c) => c.trim())) e.credits = "Add at least one credit.";
  }
  if (step === 1) {
    if (!d.skills.length) e.skills = "Pick at least one on-set skill.";
    if (!d.services.length && !d.other.trim()) e.services = "Pick at least one service you'd offer.";
  }
  if (step === 2) {
    if (d.market === "other" && !d.otherCity.trim()) e.otherCity = "Enter your city, region and country.";
    if (!/^\d{5}$/.test(d.zip)) e.zip = "Enter a 5-digit ZIP code, like 90026.";
    if (d.market === "la" && !d.areas.length) e.areas = "Pick at least one service area.";
    if (!d.dates.trim()) e.dates = "Add the dates or times you're free this month.";
  }
  if (step === 3 && d.about.trim().length < 80) e.about = "Write a few sentences, about 5 to 7 lines.";
  return e;
}

/** Gigster onboarding: five steps from "about you" to a profile ready for review, with a live preview beside the form. */
export function GigsterOnboarding({ imageBase = "img/", onNavigate }: GigsterOnboardingProps) {
  const img = useImg(imageBase);
  const [step, setStep] = React.useState(0);
  const [d, setD] = React.useState<Draft>(start);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [done, setDone] = React.useState(false);
  const top = React.useRef<HTMLDivElement>(null);
  const stage = React.useRef<HTMLDivElement>(null);
  const set = <K extends keyof Draft>(k: K) => (v: Draft[K]) => { setD((x) => ({ ...x, [k]: v })); setErrors((e) => { const n = { ...e }; delete n[k as string]; return n; }); };

  // Bring the card's top into view instantly (no smooth scroll racing the transition).
  const toTop = () => { const r = stage.current?.parentElement?.getBoundingClientRect(); if (r && r.top < 64) top.current?.scrollIntoView({ block: "start" }); };
  const go = (to: number, origin?: Element | null) => {
    startPageTransition(() => { setStep(to); setErrors({}); toTop(); }, { effect: "shift", direction: to < step ? "back" : "forward", origin, target: stage.current });
  };
  const next = (e: React.MouseEvent) => {
    const errs = validate(step, d);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (step === 4) { startPageTransition(() => setDone(true), { effect: "shift", target: stage.current }); return; }
    go(step + 1, e.currentTarget);
  };
  const error = (k: string) => errors[k];

  return (
    <div className="min-h-full bg-bg text-ink">
      <SiteHeader current="onboarding" onNavigate={onNavigate} />
      <div ref={top} className="scroll-mt-16" />

      {/* Intro band */}
      <section data-theme="dark" className="relative isolate overflow-hidden bg-surface-brand">
        <span aria-hidden="true" className="glow-horizon opacity-50" />
        <div className="relative z-raised mx-auto max-w-7xl px-4 pt-12 pb-24 sm:px-6">
          <Reveal effect="fade-up"><p className="text-eyebrow text-ink-brand uppercase">Good work. Great people. Your next chapter.</p></Reveal>
          <Reveal effect="fade-up" delay={60}><h1 className="mt-3 max-w-3xl font-display text-display-md text-balance text-ink sm:text-display-lg">Let's meet the person <span className="glow-text text-ink-brand">behind the experience.</span></h1></Reveal>
          <Reveal effect="fade-up" delay={120}><p className="mt-4 max-w-xl text-body-lg text-ink-muted">Bring your on-set know-how to everyday life. Build a profile that feels like you.</p></Reveal>
        </div>
      </section>

      <main className="relative z-raised mx-auto -mt-14 grid max-w-7xl gap-8 px-4 pb-20 sm:px-6 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">
          <div className="rounded-2xl border border-line bg-surface shadow-lg">
            {!done && (
              <div className="border-b border-line px-5 pt-5 pb-4 sm:px-8">
                <Stepper steps={STEPS} current={step} onStepClick={(i) => i < step && go(i)} />
                <Progress value={step + 1} max={5} size="sm" className="mt-4" label={`Step ${step + 1} of 5`} valueText={`${Math.round(((step + 1) / 5) * 100)}%`} />
              </div>
            )}
            <div ref={stage} className="vt-page overflow-hidden rounded-b-2xl bg-surface px-5 py-7 sm:px-8">
              {done ? <Finished first={d.name.split(" ")[0] || "there"} onNavigate={onNavigate} onEdit={() => startPageTransition(() => { setDone(false); setStep(4); }, { effect: "shift", direction: "back", target: stage.current })} /> : (
                <>
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-display text-display-sm text-ink">{HEADS[step][0]}</h2>
                      <p className="mt-1 text-body-md text-ink-muted">{HEADS[step][1]}</p>
                    </div>
                    <Badge tone="neutral" size="sm">Fictional example</Badge>
                  </div>

                  {Object.keys(errors).length > 0 && (
                    <Banner tone="danger" className="mb-6" title={`Fix ${Object.keys(errors).length === 1 ? "one thing" : `${Object.keys(errors).length} things`} to continue`}>The fields that need attention are marked below.</Banner>
                  )}

                  {step === 0 && (
                    <div className="grid gap-5">
                      <div className="flex items-center gap-4 rounded-xl border border-line bg-surface-sunken p-4">
                        {d.photo
                          ? <img src={img("maya.jpg")} alt="Sample profile portrait" className="size-20 rounded-xl object-cover shadow-md" />
                          : <span className="grid size-20 place-items-center rounded-xl border border-dashed border-line-strong text-ink-subtle"><Plus /></span>}
                        <div className="grid gap-2">
                          <p className="text-label-md text-ink">Profile photo</p>
                          <p className="text-body-sm text-ink-muted">A clear, friendly photo of you. This concept uses a generated sample portrait.</p>
                          {error("photo") && <p className="text-body-sm text-danger">{error("photo")}</p>}
                          <div><Button size="sm" variant="secondary" onClick={() => set("photo")(!d.photo)}>{d.photo ? "Remove sample photo" : "Use sample photo"}</Button></div>
                        </div>
                      </div>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Full name" error={error("name")}><Input value={d.name} onChange={(e) => set("name")(e.target.value)} /></Field>
                        <Field label="Years in the business" error={error("years")}><Input inputMode="numeric" value={d.years} placeholder="e.g. 6" onChange={(e) => set("years")(e.target.value.replace(/\D/g, "").slice(0, 2))} /></Field>
                      </div>
                      <Field label="Industry position / department" error={error("position")}><Input value={d.position} start={<Film />} onChange={(e) => set("position")(e.target.value)} /></Field>
                      <Field label="IMDb profile link" error={error("imdb")} hint="Your IMDb name page. We use it to confirm credits before going live."><Input value={d.imdb} start={<Link2 />} onChange={(e) => set("imdb")(e.target.value)} /></Field>
                      <div className="grid gap-2">
                        <p className="text-label-md text-ink">Notable credits <span className="font-normal text-ink-subtle">· at least one, up to five</span></p>
                        {d.credits.map((c, i) => (
                          <div key={i} className="flex gap-2">
                            <Input aria-label={`Credit ${i + 1}`} value={c} placeholder="Production · Role" className="flex-1" onChange={(e) => set("credits")(d.credits.map((x, j) => (j === i ? e.target.value : x)))} />
                            <IconButton label={`Remove credit ${i + 1}`} variant="ghost" icon={<Trash2 />} onClick={() => set("credits")(d.credits.filter((_, j) => j !== i))} />
                          </div>
                        ))}
                        {error("credits") && <p className="text-body-sm text-danger">{error("credits")}</p>}
                        {d.credits.length < 5 && <div><Button size="sm" variant="ghost" iconStart={<Plus />} onClick={() => set("credits")([...d.credits, ""])}>Add a credit</Button></div>}
                      </div>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="grid gap-7">
                      <div className="grid gap-3">
                        <p className="text-label-md text-ink">On-set skills <span className="font-normal text-ink-subtle">· your professional background</span></p>
                        <ChipPicker label="On-set skills" options={onSetSkills} value={d.skills} onChange={set("skills")} />
                        {error("skills") && <p className="text-body-sm text-danger">{error("skills")}</p>}
                      </div>
                      <div className="grid gap-3">
                        <p className="text-label-md text-ink">Off-set services <span className="font-normal text-ink-subtle">· what you'd offer between gigs</span></p>
                        <ChipPicker label="Off-set services" options={offSetServices} value={d.services} onChange={set("services")} />
                        {error("services") && <p className="text-body-sm text-danger">{error("services")}</p>}
                      </div>
                      <Field label="Something else?" optional hint="Other services go to a private review. They don't appear on your profile or become bookable automatically.">
                        <Textarea rows={2} value={d.other} placeholder="Describe a service that isn't listed" onChange={(e) => set("other")(e.target.value)} />
                      </Field>
                      <Banner tone="info">Specialist production selections describe your background only. They don't establish qualifications or make regulated work bookable.</Banner>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="grid gap-5">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Home market"><Select value={d.market} onValueChange={set("market")} options={[{ value: "la", label: "Los Angeles" }, { value: "other", label: "Another market" }]} /></Field>
                        <Field label="Home ZIP code" error={error("zip")}><Input inputMode="numeric" value={d.zip} start={<MapPin />} onChange={(e) => set("zip")(e.target.value.replace(/\D/g, "").slice(0, 5))} /></Field>
                      </div>
                      {d.market === "other" ? (
                        <div className="grid gap-3">
                          <Field label="City / region and country" error={error("otherCity")}><Input value={d.otherCity} onChange={(e) => set("otherCity")(e.target.value)} /></Field>
                          <Banner tone="info">Los Angeles is the launch market. Your profile would be held for a future market.</Banner>
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          <p className="text-label-md text-ink">Los Angeles service areas <span className="font-normal text-ink-subtle">· you'll only appear in these</span></p>
                          <ChipPicker label="Service areas" options={laServiceAreas} value={d.areas} onChange={set("areas")} />
                          {error("areas") && <p className="text-body-sm text-danger">{error("areas")}</p>}
                        </div>
                      )}
                      <Field label="Travel notes" optional hint="Only a limit or exception. No need to repeat the areas above."><Input value={d.travel} onChange={(e) => set("travel")(e.target.value)} /></Field>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Availability month"><Input value={d.month} readOnly /></Field>
                        <Field label="This month"><Select value={d.status} onValueChange={set("status")} options={[{ value: "available", label: "Available this month" }, { value: "limited", label: "Limited availability" }, { value: "away", label: "Not available this month" }]} /></Field>
                      </div>
                      <Field label="Dates or times this month" error={error("dates")} hint="Exact project dates are agreed with each client."><Input value={d.dates} onChange={(e) => set("dates")(e.target.value)} /></Field>
                      <Banner tone="success" title="Keep availability fresh">Confirm it each month. An availability-only edit keeps your review status unchanged.</Banner>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Rate" optional hint="Final scope and rate are agreed with the client."><Input inputMode="numeric" value={d.rate} start={<span className="text-label-md">$</span>} end={<span className="text-label-sm text-ink-subtle">USD</span>} onChange={(e) => set("rate")(e.target.value.replace(/\D/g, "").slice(0, 4))} /></Field>
                        <Field label="Rate basis" optional><Select value={d.basis} onValueChange={set("basis")} options={[{ value: "hourly", label: "Hourly" }, { value: "project", label: "Per project" }, { value: "day", label: "Day rate" }]} /></Field>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="grid gap-5">
                      <Field label="About me" error={error("about")} hint="Aim for 5 to 7 lines: your experience, the help you offer and what it's like to work with you.">
                        <Textarea rows={6} showCount maxLength={600} value={d.about} onChange={(e) => set("about")(e.target.value)} />
                      </Field>
                      <Field label="Languages" optional><Input value={d.languages} onChange={(e) => set("languages")(e.target.value)} /></Field>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Insurance" optional hint="Self-reported; not verified."><Select value={d.insurance} onValueChange={set("insurance")} options={[{ value: "private", label: "Prefer to discuss privately" }, { value: "yes", label: "I have liability insurance" }, { value: "no", label: "No insurance" }]} /></Field>
                        <Field label="Work mode" optional><Select value={d.mode} onValueChange={set("mode")} options={[{ value: "on-site", label: "On site" }, { value: "studio", label: "At my studio" }, { value: "both", label: "Both" }]} /></Field>
                      </div>
                      <Field label="Tools / equipment" optional><Input value={d.tools} onChange={(e) => set("tools")(e.target.value)} /></Field>
                      <Field label="Transport" optional><Input value={d.transport} onChange={(e) => set("transport")(e.target.value)} /></Field>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="grid gap-4">
                      <Banner tone="success" title="Ready for your review">Go back and edit anything. This is a rehearsal, not a submission.</Banner>
                      {[
                        [0, "About you", [["Name", d.name], ["Position", d.position], ["Years", d.years || "Not supplied"], ["IMDb", d.imdb], ["Credits", d.credits.filter(Boolean).join(" · ")]]],
                        [1, "Skills & services", [["On set", d.skills.join(" · ")], ["Off set", [...d.services, d.other && "Other · private review"].filter(Boolean).join(" · ")]]],
                        [2, "Where & when", [["Market", d.market === "la" ? `Los Angeles · ${d.zip}` : `${d.otherCity} · ${d.zip}`], ["Areas", d.market === "la" ? d.areas.join(" · ") : "Held for a future market"], ["Availability", `${d.month} · ${d.dates}`], ["Rate", d.rate ? `$${d.rate} USD · ${d.basis}` : "Not supplied"]]],
                        [3, "Your story", [["About me", d.about], ["Languages", d.languages || "Not supplied"], ["Tools", d.tools || "Not supplied"], ["Transport", d.transport || "Not supplied"]]],
                      ].map(([i, title, rows]) => (
                        <section key={title as string} className="rounded-xl border border-line p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <h3 className="font-display text-heading-md text-ink"><span className="mr-2 font-mono text-data-md text-ink-subtle">0{(i as number) + 1}</span>{title as string}</h3>
                            <Button size="sm" variant="ghost" iconStart={<Pencil />} onClick={(e) => go(i as number, e.currentTarget)}>Edit</Button>
                          </div>
                          <dl className="grid gap-2">
                            {(rows as string[][]).map(([k2, v]) => (
                              <div key={k2} className="grid gap-1 sm:grid-cols-4"><dt className="text-label-sm text-ink-subtle">{k2}</dt><dd className="text-body-sm text-ink sm:col-span-3">{v}</dd></div>
                            ))}
                          </dl>
                        </section>
                      ))}
                      <p className="text-body-sm text-ink-muted">Going live would also need staff approval, a current available status, an active market and a matching service area.</p>
                    </div>
                  )}

                  <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
                    {step > 0 ? <Button variant="secondary" iconStart={<ArrowLeft />} onClick={(e) => go(step - 1, e.currentTarget)}>Back</Button> : <span />}
                    <span className="font-mono text-data-sm text-ink-subtle">{step + 1} / 5</span>
                    <Button variant="primary" className="glow-hover" iconEnd={step === 4 ? <Sparkles /> : <ArrowRight />} onClick={next}>{step === 4 ? "Submit for review" : "Continue"}</Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Live preview */}
        <aside className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <Preview d={d} img={img} />
            <p className="mt-3 text-caption text-ink-subtle">Profile details and credits are self-reported. No identity, qualifications or coverage have been verified.</p>
          </div>
        </aside>
      </main>
    </div>
  );
}

function Preview({ d, img }: { d: Draft; img: (f: string) => string }) {
  const tags = [...d.services].slice(0, 2);
  const area = d.market === "la" ? (d.areas[0] ? `${d.areas[0]}, Los Angeles` : "Los Angeles") : d.otherCity || "Another market";
  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-surface shadow-lg">
      {/* Cover: a strip of their work, the way clients first meet them. */}
      <div className="relative grid h-36 grid-cols-3 gap-0.5 bg-surface-sunken">
        {maya.portfolio.slice(0, 3).map((it) => <img key={it.src} src={img(it.src)} alt="" className="size-full object-cover" />)}
        <span className="absolute inset-0 bg-linear-to-t from-surface via-transparent to-transparent" />
        <Badge tone="brand" size="sm" className="absolute top-3 left-3 shadow-sm">Live preview</Badge>
        <Badge tone="neutral" size="sm" className="absolute top-3 right-3 shadow-sm">Sample · never published</Badge>
      </div>
      <div className="relative grid gap-3 px-5 pb-5">
        <div className="-mt-10 size-20 overflow-hidden rounded-2xl border-4 border-surface bg-surface-sunken shadow-lg">
          {d.photo ? <img src={img("maya.jpg")} alt="Sample portrait" className="size-full object-cover" /> : <span className="grid size-full place-items-center text-ink-subtle"><Plus /></span>}
        </div>
        <div>
          <h3 className="font-display text-heading-lg text-ink">{d.name || "Your name"}</h3>
          <p className="text-label-md text-ink-brand">{d.position || "Your position"}{d.years && ` · ${d.years} years`}</p>
        </div>
        {tags.length > 0 && <div className="flex flex-wrap gap-1.5">{tags.map((t) => <Badge key={t} tone="brand" size="sm">{t}</Badge>)}{d.services.length > 2 && <Badge tone="neutral" size="sm">+{d.services.length - 2}</Badge>}</div>}
        <p className="line-clamp-4 text-body-sm text-ink-muted">{d.about || "Your story appears here."}</p>
        <div className="flex items-center justify-between border-t border-line pt-3 text-body-sm">
          <span className="flex items-center gap-1 text-ink-subtle"><MapPin className="size-3.5" />{area}</span>
          {d.rate && <b className="font-display text-heading-md text-ink">${d.rate}<span className="text-body-sm font-normal text-ink-muted">/{d.basis === "hourly" ? "hr" : d.basis === "day" ? "day" : "project"}</span></b>}
        </div>
      </div>
    </article>
  );
}

function Finished({ first, onNavigate, onEdit }: { first: string; onNavigate?: (p: GigsPage) => void; onEdit: () => void }) {
  return (
    <div className="grid justify-items-center gap-5 py-10 text-center">
      <Reveal effect="scale-in" className="grid size-20 place-items-center rounded-full bg-action text-on-action shadow-md">
        <Check className="size-10" />
      </Reveal>
      <h2 className="font-display text-display-md text-ink">You're in the queue, {first}.</h2>
      <p className="max-w-md text-body-lg text-ink-muted">In the live product, our team would review your profile and let you know within a few days. In this concept, nothing was sent or saved.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="secondary" iconStart={<X />} onClick={onEdit}>Back to review</Button>
        <Button variant="primary" iconEnd={<ArrowRight />} onClick={() => onNavigate?.("search")}>See Gigsters in search</Button>
      </div>
    </div>
  );
}
