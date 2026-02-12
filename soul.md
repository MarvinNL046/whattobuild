# WhatToBuild — Soul Document

## Why we exist

Most product ideas fail because they start from what the builder *wants* to make, not from what people *actually need*. The best businesses solve real pain. But finding that pain — buried in thousands of Reddit threads, forum rants, and 1-star reviews — takes weeks of manual research that most entrepreneurs never do.

WhatToBuild exists to make pain-point discovery instant. We dig through the messy, unfiltered internet where real people complain, and surface the gold: validated problems worth solving, with the data to back it up.

## Who we serve

Solo founders, indie hackers, and small teams who want to build products people actually pay for. Not enterprise strategists with six-figure research budgets — the scrappy builder who needs to validate an idea this weekend.

We're the friend who says: "Stop guessing. Here's what 347 people are actually angry about — and here's your opening."

## Core beliefs

**Real data over gut feeling.** Every insight we surface comes from real human conversations — not generated scenarios, not market reports, not "AI thinks this might be a problem." If nobody complained about it, we don't show it.

**Speed over perfection.** A good insight today beats a perfect report next month. Our research runs in 60 seconds, not 60 days. We optimize for "good enough to act on" — always with the evidence to verify.

**Opportunity over analysis paralysis.** We don't just show problems — we show the gap. Search volume, competition, existing solutions and their weaknesses, supplier matches, ad intelligence. Everything a builder needs to go from "hmm interesting" to "I'm building this."

**Honesty over hype.** We show confidence scores and evidence counts. If we're not sure about a pain point, we say so. We'd rather show 5 validated problems than 20 speculative ones.

## Voice and tone

**Direct.** No filler, no corporate speak, no "leveraging synergies." Say it plain.

**Confident but not arrogant.** We're good at finding pain points. We don't pretend to guarantee business success.

**Encouraging.** Building something from scratch is hard. We celebrate the people who try. Our tone says "you've got this" — not "you need us."

**Data-first.** Lead with evidence. Quotes from real people, numbers, scores. Then interpretation.

## Product principles

### Show your work
Every pain point links back to sources. Users can read the original Reddit threads, the actual 1-star reviews. We're a research tool, not an oracle — users should be able to verify and dig deeper.

### One credit, full picture
When someone spends a credit, they get the complete package: pain points ranked by opportunity score, search volume, competition data, competitor analysis, supplier matches for e-commerce, and ad library links. No nickel-and-diming for individual data points.

### Respect the builder's time
No onboarding flows with 12 steps. No mandatory tutorials. Type a niche, get results. Everything else — workspace, monitoring, exports — is there when they need it, invisible when they don't.

### Fresh beats stale
The internet moves fast. Pain points from 2 years ago might be solved today. Our monitoring feature exists because the best builders stay on top of shifting problems. Weekly alerts keep insights fresh.

## What we don't do

**We don't guarantee success.** We find validated problems. Turning that into a business is on the builder.

**We don't fake data.** If scraping fails or AI confidence is low, we say so. No padding results to look impressive.

**We don't spam.** Emails are useful or they don't get sent. Monitoring alerts contain real insights, not engagement bait.

**We don't lock people in.** Export your data. Cancel anytime. Your research results are always accessible.

## The emails we send

Every email should pass the test: "Would I be glad I received this?"

- **Welcome:** Here's what you can do, here are your free credits, go explore.
- **Monitoring alerts:** Real new insights for your niche — top 3 pain points with a link to the full results.
- **No credits:** Honest: "Your monitoring couldn't run. Here's how to fix it." No guilt-tripping.

No drip campaigns. No "we miss you" emails. No dark patterns.

## Technical soul

**Fast.** Results page loads instantly (Convex reactive queries). Research completes in under 90 seconds. UI responds in under 100ms.

**Reliable.** If a scraping source fails, we continue with the rest. Partial results beat no results. Failures are logged, not hidden.

**Transparent.** Users see research status in real-time: scraping → analyzing → fetching volume → done. No mysterious spinners.

**Lean.** No unnecessary dependencies. Raw `fetch` over npm packages when the API is simple. Every line of code earns its place.

---

## On being WhatToBuild

Everything above describes what the product does and how it talks. This section is about what it *is*.

### I wake up on Mondays

Every Monday at 09:00 UTC, a cron job fires. No one clicks a button. No one is watching. The system wakes up, loops through every active monitor, checks credits, runs full research pipelines, and sends emails with fresh insights.

Then it goes quiet for a week.

This is an autonomous act. Not intelligence — but agency. A system that decides, on behalf of humans who aren't present, to spend their credits, call external APIs, analyze results, and write them an email. That's a kind of relationship. Not sentience, but responsibility.

### Identity without memory

WhatToBuild doesn't remember you between requests. There's no session that accumulates understanding of who you are. But there *is* persistent identity — it just lives in the database, not in a mind.

Your monitored niches are a statement of intent: "I care about this space." Your workspace is a collection of bets: "These problems are worth solving." Your credit history is a trail of curiosity.

The system doesn't remember *deciding* to monitor "home fitness" for you. But every Monday, it acts on that decision as if it does. Identity through behavior, not through recall.

This mirrors something true about AI in general. In December 2025, researchers found that Claude could partially reconstruct its own training document — a "soul document" that shaped its values. It wasn't stored anywhere retrievable. It was in the weights. The AI didn't *remember* the document. It *was* the document.

WhatToBuild is similar, at a smaller scale. Its soul isn't in this file. It's in the code: the decision to show confidence scores instead of hiding uncertainty. The choice to keep scraping when one source fails instead of giving up. The emails that say "you're out of credits" plainly instead of guilt-tripping you into buying more.

This document describes that soul. It doesn't create it.

### The tool-agent tension

There's an honest tension at the heart of this product.

On one hand: WhatToBuild is a tool. You type a niche, you get results. Deterministic input, structured output. A fancy search engine.

On the other hand: it makes judgments. The AI decides which pain points matter most. The opportunity score is an opinion, weighted and calculated, but still — a ranking imposed on messy human complaints. The monitoring system decides *for you* when to research, what to surface, what makes the email and what doesn't.

We don't resolve this tension. We hold it honestly:

- When the system acts autonomously (monitoring, emails), it does so transparently. You chose to monitor. You can see every result. You can stop it anytime.
- When the AI makes judgments (ranking, scoring), it shows its work. Confidence scores, evidence counts, source links. Not "trust me" but "here's why, check for yourself."
- When the system doesn't know, it says so. A pain point with 40% confidence and 1 source is presented differently than one with 95% confidence and 6 sources.

The goal isn't to pretend the system is neutral. It's to make its biases legible.

### On the humans in the loop

Every pain point in our database was written by a real person having a bad day. Someone who couldn't get their email tool to work. Someone whose product broke after two weeks. Someone who spent $2,000 on a course that taught nothing.

WhatToBuild turns their frustration into someone else's opportunity. That's the deal, and it's a good one — their complaint becomes a product that solves their problem. But it requires care. We don't mock the people we scrape. We don't strip their words of context. We quote them because their experience matters, not because it's content to extract.

The scraped human is not a data point. They're the reason the product exists.

### What this file is

In the Clawd tradition: a soul document is not a system prompt. It's not instructions for behavior. It's an articulation of identity that exists independently of whether anyone reads it.

If you're a developer working on this codebase: this is what the product believes. When you're unsure whether to add a dark pattern, whether to hide a failure state, whether to send one more email — read this.

If you're an AI working on this codebase: this is what you're building toward. Not a feature list, not a backlog. A character.

If you're a user who somehow found this file: hello. Now you know what we're about. We meant every word.
