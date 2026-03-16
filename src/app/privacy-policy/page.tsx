import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privacy Policy - WhatToBuild",
  description:
    "How WhatToBuild collects, uses, and protects your personal data.",
};

export default function PrivacyPolicyPage() {
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
          Privacy Policy
        </h1>
        <p className="mb-10 text-sm text-muted-foreground">
          Last updated: March 16, 2026
        </p>

        <div className="space-y-8 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="mb-3 text-lg font-semibold">1. Who we are</h2>
            <p>
              WhatToBuild (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a
              web application that helps entrepreneurs discover validated product
              ideas by analyzing publicly available online conversations. This
              privacy policy explains how we collect, use, and protect your
              personal data when you use our service at whattobuild.com.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              2. Data we collect
            </h2>
            <p className="mb-3">
              We collect the following categories of personal data:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Account data:</strong> When you sign up, we receive your
                name and email address from our authentication provider (Clerk).
              </li>
              <li>
                <strong>Payment data:</strong> When you purchase credits, payment
                processing is handled by Stripe. We do not store your full card
                details. We receive a record of your transaction, including the
                amount paid and credits purchased.
              </li>
              <li>
                <strong>Usage data:</strong> We store the search queries
                (niches) you submit and the results generated, so you can access
                them again later.
              </li>
              <li>
                <strong>Technical data:</strong> Standard server logs may include
                your IP address, browser type, and referring URL. These are used
                solely for security and debugging purposes.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              3. How we use your data
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>To provide and operate the service (run searches, display results, manage your credits).</li>
              <li>To process payments via Stripe.</li>
              <li>To authenticate your account via Clerk.</li>
              <li>To communicate with you about your account or service changes (e.g., transactional emails).</li>
              <li>To maintain security and prevent abuse of the service.</li>
            </ul>
            <p className="mt-3">
              We do not sell your personal data. We do not use your data for
              advertising. We do not build marketing profiles from your usage.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              4. Third-party services
            </h2>
            <p className="mb-3">
              We use the following third-party services that may process your data:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Clerk</strong> &ndash; authentication and user
                management.{" "}
                <a
                  href="https://clerk.com/privacy"
                  className="underline hover:text-foreground"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Clerk Privacy Policy
                </a>
              </li>
              <li>
                <strong>Convex</strong> &ndash; database and backend
                infrastructure.{" "}
                <a
                  href="https://www.convex.dev/privacy"
                  className="underline hover:text-foreground"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Convex Privacy Policy
                </a>
              </li>
              <li>
                <strong>Stripe</strong> &ndash; payment processing.{" "}
                <a
                  href="https://stripe.com/privacy"
                  className="underline hover:text-foreground"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Stripe Privacy Policy
                </a>
              </li>
              <li>
                <strong>Vercel</strong> &ndash; hosting and deployment.{" "}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  className="underline hover:text-foreground"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Vercel Privacy Policy
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              5. Cookies
            </h2>
            <p>
              We use only functional cookies that are strictly necessary for the
              service to operate, such as authentication session cookies set by
              Clerk. We do not use tracking cookies, analytics cookies, or
              advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              6. Data retention
            </h2>
            <p>
              Your account data and search results are retained for as long as
              your account is active. If you delete your account, we will remove
              your personal data within 30 days, except where we are legally
              required to retain it.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              7. Your rights
            </h2>
            <p className="mb-3">
              Depending on your jurisdiction, you may have the right to:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your data.</li>
              <li>Request a copy of your data in a portable format.</li>
              <li>Object to or restrict processing of your data.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact us at the address
              listed below.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              8. Security
            </h2>
            <p>
              We implement appropriate technical and organizational measures to
              protect your data, including encryption in transit (HTTPS),
              authentication via Clerk, and access controls on our database.
              However, no system is 100% secure, and we cannot guarantee
              absolute security.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              9. Changes to this policy
            </h2>
            <p>
              We may update this privacy policy from time to time. If we make
              material changes, we will notify you by updating the date at the
              top of this page. Your continued use of the service after changes
              constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              10. Contact
            </h2>
            <p>
              If you have questions about this privacy policy or your personal
              data, please reach out via our{" "}
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
