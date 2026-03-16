import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact - WhatToBuild",
  description:
    "Get in touch with the WhatToBuild team for support, questions, or feedback.",
};

export default function ContactPage() {
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
          Contact
        </h1>

        <div className="space-y-8 text-sm leading-relaxed text-foreground/90">
          <section>
            <p>
              Have a question, found a bug, or want to share feedback? We would
              love to hear from you.
            </p>
          </section>

          <section className="rounded-lg border p-6">
            <div className="flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Mail className="size-4" />
              </div>
              <div>
                <h2 className="mb-1 text-lg font-semibold">Email</h2>
                <p className="mb-3 text-muted-foreground">
                  The quickest way to reach us. We typically respond within 1-2
                  business days.
                </p>
                <a
                  href="mailto:support@whattobuild.com"
                  className="font-medium underline hover:text-foreground"
                >
                  support@whattobuild.com
                </a>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              What you can reach out about
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Support:</strong> Issues with your account, credits, or
                search results.
              </li>
              <li>
                <strong>Billing:</strong> Questions about payments, refunds, or
                invoices.
              </li>
              <li>
                <strong>Bug reports:</strong> Something not working as expected.
              </li>
              <li>
                <strong>Feature requests:</strong> Ideas for improving the tool.
              </li>
              <li>
                <strong>Privacy:</strong> Data access, deletion, or other
                privacy-related requests.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              Before reaching out
            </h2>
            <p>
              If a search returned unexpected results, keep in mind that results
              depend on what people are discussing publicly online. Some very
              narrow or brand-new niches may have limited data available.
              Credits are only deducted for successfully completed searches
              &mdash; if a search fails due to a technical error, your credit is
              automatically refunded.
            </p>
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
