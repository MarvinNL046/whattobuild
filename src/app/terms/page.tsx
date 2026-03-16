import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Terms of Service - WhatToBuild",
  description:
    "Terms and conditions for using the WhatToBuild service.",
};

export default function TermsPage() {
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
        <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mb-10 text-sm text-muted-foreground">
          Last updated: March 16, 2026
        </p>

        <div className="space-y-8 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="mb-3 text-lg font-semibold">
              1. Acceptance of terms
            </h2>
            <p>
              By creating an account or using WhatToBuild (&quot;the
              Service&quot;), you agree to be bound by these Terms of Service.
              If you do not agree, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              2. Description of the Service
            </h2>
            <p>
              WhatToBuild is a research tool that analyzes publicly available
              online conversations to identify pain points and product
              opportunities in a given niche. The Service provides AI-generated
              analysis, search volume data, and competition insights. Results are
              generated using automated processes and should be used as a
              starting point for your own research, not as definitive business
              advice.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              3. Accounts
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                You must provide accurate information when creating an account.
              </li>
              <li>
                You are responsible for maintaining the security of your account
                credentials.
              </li>
              <li>
                You must be at least 18 years old to use the Service.
              </li>
              <li>
                One person or entity may not maintain more than one account.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              4. Credits and payments
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                The Service uses a credit-based system. Each research query
                consumes one credit.
              </li>
              <li>
                New accounts receive a limited number of free credits.
                Additional credits can be purchased as one-time payments.
              </li>
              <li>
                All payments are processed by Stripe and are in euros (&euro;).
                Prices are displayed on the pricing section of our website.
              </li>
              <li>
                Purchased credits do not expire and are non-transferable.
              </li>
              <li>
                Refunds are handled on a case-by-case basis. If a search fails
                due to a technical error on our end, the credit will be
                refunded automatically.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              5. Acceptable use
            </h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Use the Service for any unlawful purpose or in violation of any
                applicable laws.
              </li>
              <li>
                Attempt to reverse-engineer, scrape, or extract data from the
                Service beyond normal use.
              </li>
              <li>
                Resell or redistribute the Service or its output as a competing
                product.
              </li>
              <li>
                Abuse the Service by submitting automated or bulk queries beyond
                your purchased credits.
              </li>
              <li>
                Attempt to circumvent credit limits, authentication, or any
                security measures.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              6. Intellectual property
            </h2>
            <p>
              The Service, its design, and underlying technology are owned by
              WhatToBuild. You retain ownership of any business decisions or
              products you create based on the research results. The research
              output you receive is licensed to you for your personal and
              commercial use, but you may not resell the raw output as a data
              product.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              7. Disclaimer of warranties
            </h2>
            <p>
              The Service is provided &quot;as is&quot; and &quot;as
              available.&quot; We do not guarantee that:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Results will be accurate, complete, or up to date.</li>
              <li>The Service will be uninterrupted or error-free.</li>
              <li>
                Any particular business outcome will result from using the
                Service.
              </li>
            </ul>
            <p className="mt-3">
              AI-generated analysis and search data are approximations. Always
              validate findings with your own research before making business
              decisions.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              8. Limitation of liability
            </h2>
            <p>
              To the maximum extent permitted by law, WhatToBuild shall not be
              liable for any indirect, incidental, special, consequential, or
              punitive damages, or any loss of profits or revenue, whether
              incurred directly or indirectly. Our total liability for any claim
              arising from the Service is limited to the amount you paid us in
              the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              9. Account termination
            </h2>
            <p>
              We reserve the right to suspend or terminate your account if you
              violate these terms. You may delete your account at any time.
              Unused credits on a terminated account due to a terms violation are
              forfeited.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              10. Changes to these terms
            </h2>
            <p>
              We may modify these terms at any time. If we make material
              changes, we will notify you by updating the date at the top of
              this page. Continued use of the Service after changes constitutes
              acceptance.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              11. Governing law
            </h2>
            <p>
              These terms are governed by the laws of the Netherlands. Any
              disputes shall be resolved in the competent courts of the
              Netherlands.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              12. Contact
            </h2>
            <p>
              For questions about these terms, please reach out via our{" "}
              <Link href="/contact" className="underline hover:text-foreground">
                contact page
              </Link>
              .
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
