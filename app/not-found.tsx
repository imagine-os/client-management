import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto grid min-h-dvh max-w-xl content-center gap-3 px-4 py-16">
      <p className="text-eyebrow text-ink-brand uppercase">Not found</p>
      <h1 className="font-display text-display-sm text-ink">There's nothing at this address</h1>
      <p className="text-body-md text-ink-muted">The link may be old. Everything lives under Clients and Templates.</p>
      <Link href="/" className="inline-flex min-h-11 w-fit items-center text-body-md text-link underline underline-offset-2">Go to clients</Link>
    </main>
  );
}
