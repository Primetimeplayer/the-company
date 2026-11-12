import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  ListChecks,
  Send,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { FooterDisclaimer } from "@/components/footer-disclaimer";
import { MobileMenu } from "@/components/mobile-menu";
import { Button } from "@/components/ui/button";
import { WALKTHROUGH_URL } from "@/lib/config";

const STEPS = [
  {
    number: "01",
    title: "Upload",
    description:
      "Add your valuation, variations, insurance certificates and site evidence in one place.",
    Icon: UploadCloud,
  },
  {
    number: "02",
    title: "Check",
    description:
      "Payment Ready reconciles the figures against the subcontract and the client's own requirements.",
    Icon: ListChecks,
  },
  {
    number: "03",
    title: "Submit with confidence",
    description:
      "Fix what is flagged, then submit knowing the dates that protect your payment.",
    Icon: Send,
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <Brand />
          <nav
            aria-label="Main"
            className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex"
          >
            <a
              href="#product"
              className="rounded transition hover:text-brand-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Product
            </a>
            <a
              href="#how-it-works"
              className="rounded transition hover:text-brand-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              How it works
            </a>
            <a
              href="#pricing"
              className="rounded transition hover:text-brand-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="h-9 px-4">
              <Link href="/app">
                Try the demo
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </Button>
            <MobileMenu />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section
          id="product"
          className="relative overflow-hidden border-b border-border/80"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade opacity-80"
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white via-white/40 to-transparent" aria-hidden />

          <div className="relative mx-auto w-full max-w-4xl px-5 pb-20 pt-16 text-center sm:px-8 sm:pb-24 sm:pt-24">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[12px] font-medium text-slate-600 shadow-sm backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-from" aria-hidden />
              Built for UK subcontractors
            </span>

            <h1 className="text-balance mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-brand-ink sm:text-5xl lg:text-6xl">
              Catch payment application errors before your client does.
            </h1>

            <p className="text-balance mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-slate-600 sm:text-base">
              Upload your valuation, variations and evidence. Payment Ready checks
              the figures, flags what&apos;s missing and tracks your payment
              deadlines.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/app">
                  Try the sample project
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
              >
                <a href={WALKTHROUGH_URL}>Book a walkthrough</a>
              </Button>
            </div>

            <div className="mx-auto mt-12 flex max-w-xl items-center justify-center gap-2 text-xs text-slate-500">
              <ClipboardCheck className="h-4 w-4 text-slate-400" aria-hidden />
              No sign-up. Nothing to install. Sample data only.
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-from">
              How it works
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-brand-ink sm:text-3xl">
              Three steps from valuation to application
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
              The same checks a commercial manager would make, run in seconds
              before the application leaves your inbox.
            </p>
          </div>

          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map(({ number, title, description, Icon }) => (
              <li
                key={number}
                className="group relative rounded-xl border border-border bg-white p-6 shadow-card transition hover:border-slate-300"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 text-brand-indigo ring-1 ring-inset ring-indigo-100">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="text-[11px] font-semibold tracking-[0.14em] text-slate-400">
                    {number}
                  </span>
                </div>
                <h3 className="mt-5 text-[15px] font-semibold text-slate-900">
                  {title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
                  {description}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section id="pricing" className="border-t border-border/80 bg-[#F8F9FB]">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-5 py-12 sm:px-8 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-brand-ink">
                Pricing
              </h2>
              <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-slate-600">
                This is a working demo with sample data. Pilot pricing is agreed
                per contracting business — book a walkthrough to talk it through.
              </p>
            </div>
            <Button asChild variant="outline" className="shrink-0">
              <a href={WALKTHROUGH_URL}>
                Book a walkthrough
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            </Button>
          </div>
        </section>
      </main>

      <FooterDisclaimer className="bg-white" />
    </div>
  );
}
