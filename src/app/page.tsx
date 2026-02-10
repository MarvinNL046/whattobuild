import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Search, Zap, BarChart3, Check } from "lucide-react";

// Pricing data (display only, no server secrets)
const PRICING = [
  { name: "Starter", credits: 10, price: 9, popular: false },
  { name: "Growth", credits: 50, price: 29, popular: true },
  { name: "Pro", credits: 150, price: 59, popular: false },
];

const STEPS = [
  {
    icon: Search,
    title: "Enter a niche",
    description:
      "Type any market or product category. We scrape Reddit, Trustpilot, and Amazon for real complaints.",
  },
  {
    icon: Zap,
    title: "AI finds pain points",
    description:
      "Claude AI clusters and ranks the top problems people have. With real quotes and frequency scores.",
  },
  {
    icon: BarChart3,
    title: "Get market data",
    description:
      "See search volume, competition levels, and links to ad libraries on Facebook, TikTok, Google, and Pinterest.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <span className="text-lg font-semibold tracking-tight">
            WhatToBuild
          </span>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/sign-up">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:py-28">
        <Badge variant="secondary" className="mb-4">
          3 free credits to start
        </Badge>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Stop guessing.
          <br />
          <span className="text-muted-foreground">Build what people need.</span>
        </h1>
        <p className="mt-4 max-w-lg text-base text-muted-foreground sm:text-lg">
          Discover real pain points from Reddit, reviews, and forums. Validated
          with search volume and competition data. One search, real answers.
        </p>
        <div className="mt-8 flex gap-3">
          <Button size="lg" asChild>
            <Link href="/sign-up">Start for free</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="#pricing">See pricing</Link>
          </Button>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/30 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-2xl font-bold tracking-tight sm:text-3xl">
            How it works
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <step.icon className="size-5" />
                </div>
                <h3 className="text-sm font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-2 text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Simple pricing
          </h2>
          <p className="mb-10 text-center text-sm text-muted-foreground">
            Pay per research. No subscriptions. 1 credit = 1 niche analysis.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {PRICING.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${plan.popular ? "border-primary shadow-md" : ""}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    Most popular
                  </Badge>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription>
                    {plan.credits} research credits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">&euro;{plan.price}</span>
                    <span className="text-sm text-muted-foreground">
                      one-time
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    &euro;{(plan.price / plan.credits).toFixed(2)} per research
                  </p>
                </CardContent>
                <CardFooter className="flex-col gap-3">
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/sign-up">Get started</Link>
                  </Button>
                  <ul className="w-full space-y-1.5 text-xs text-muted-foreground">
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3 text-primary" />
                      Pain point analysis
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3 text-primary" />
                      Search volume data
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3 text-primary" />
                      Ad library links
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3 text-primary" />
                      Real user quotes
                    </li>
                  </ul>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} WhatToBuild</span>
          <div className="flex gap-4">
            <Link href="/sign-in" className="hover:text-foreground">
              Sign in
            </Link>
            <Link href="/sign-up" className="hover:text-foreground">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
