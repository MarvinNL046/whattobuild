import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Zap, BarChart3 } from "lucide-react";

export const metadata: Metadata = {
  title: "About - WhatToBuild",
  description:
    "Learn how WhatToBuild helps entrepreneurs find validated product ideas by analyzing real online conversations.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight hover:opacity-80"
          >
            WhatToBuild
          </Link>
          <Button size="sm" variant="outline" asChild>
            <Link href="/">Home</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
          About WhatToBuild
        </h1>

        <div className="space-y-8 text-sm leading-relaxed text-foreground/90">
          <section>
            <p>
              WhatToBuild is a research tool for entrepreneurs who want to build
              products people actually need. Instead of guessing what to build or
              relying on generic AI chatbot suggestions, WhatToBuild analyzes
              thousands of real conversations from across the web to surface
              genuine pain points, frustrations, and unmet needs in any niche.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">The problem</h2>
            <p>
              Most product ideas fail because they solve problems that don&apos;t
              actually exist, or that aren&apos;t painful enough for people to
              pay for a solution. Traditional market research is expensive and
              slow. AI chatbots give you plausible-sounding ideas, but they are
              often generic and not grounded in real demand.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">How it works</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-3">
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Search className="size-4" />
                </div>
                <h3 className="mb-1 text-sm font-semibold">
                  1. Enter a niche
                </h3>
                <p className="text-xs text-muted-foreground">
                  Type any market or product category. We search thousands of
                  real conversations from Reddit, forums, review sites, and more.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Zap className="size-4" />
                </div>
                <h3 className="mb-1 text-sm font-semibold">
                  2. AI analysis
                </h3>
                <p className="text-xs text-muted-foreground">
                  Our AI clusters and ranks the top pain points people have, with
                  real quotes and frequency scores so you can see what matters
                  most.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <BarChart3 className="size-4" />
                </div>
                <h3 className="mb-1 text-sm font-semibold">
                  3. Market data
                </h3>
                <p className="text-xs text-muted-foreground">
                  See search volume, competition levels, and links to ad
                  libraries on Facebook, TikTok, Google, and Pinterest.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              What makes it different
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Real data, not guesswork.</strong> Every pain point comes
                from actual conversations by real people, not AI-generated
                hypotheticals.
              </li>
              <li>
                <strong>Deeper than ChatGPT.</strong> We scrape and analyze
                thousands of sources that a chatbot cannot access in a single
                prompt.
              </li>
              <li>
                <strong>Validated with market data.</strong> Pain points are
                paired with search volume and competition metrics so you can
                assess demand before building.
              </li>
              <li>
                <strong>No subscriptions.</strong> Pay per research with credits.
                No recurring charges or unused subscriptions.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Who it&apos;s for</h2>
            <p>
              WhatToBuild is built for indie hackers, SaaS founders,
              e-commerce entrepreneurs, and anyone looking for their next product
              idea. Whether you are starting from scratch or looking for adjacent
              opportunities in a market you already know, the tool gives you a
              data-driven starting point.
            </p>
          </section>

          <section className="rounded-lg border bg-muted/30 p-6">
            <h2 className="mb-2 text-lg font-semibold">
              Ready to find your next idea?
            </h2>
            <p className="mb-4 text-muted-foreground">
              New accounts get free credits to try the tool. No credit card
              required.
            </p>
            <Button asChild>
              <Link href="/dashboard">Start for free</Link>
            </Button>
          </section>
        </div>
      </main>

      <footer className="border-t px-4 py-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} WhatToBuild</span>
          <nav className="flex gap-4">
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy-policy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
