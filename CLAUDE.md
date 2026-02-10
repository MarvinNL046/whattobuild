# CLAUDE.md - WhatToBuild

## Code Quality Standards

**WhatToBuild is a performance-first micro-SaaS.** Every line of code must be fast, lightweight, and snappy.

### Non-Negotiable Rules

1. **NO mock data or placeholders** - Every feature works with real data
2. **NO duplicate code** - Extract shared components, use existing patterns
3. **NO console.logs in production** - Use proper error handling
4. **NO `any` types** - Full TypeScript strict mode
5. **PERFORMANCE FIRST** - Optimistic updates, proper caching, fast renders

### Code Quality Checklist

Before committing ANY code, verify:

- [ ] **Type-safe** - Full TypeScript types, no `any`
- [ ] **Optimistic** - Mutations use optimistic updates where possible
- [ ] **Cached** - Queries use Convex reactive caching properly
- [ ] **Indexed** - Database queries use defined indexes
- [ ] **Error handling** - Graceful failures, user-friendly messages
- [ ] **Lightweight** - No unnecessary dependencies, minimal bundle impact
- [ ] **Responsive** - Works on mobile and desktop

## Project Overview

WhatToBuild is a micro-SaaS tool that discovers pain points and product opportunities for entrepreneurs (SaaS + e-com/dropship). It scrapes real user complaints from Reddit, review sites, and forums, then uses AI to cluster and rank pain points with search volume and competition data.

## Tech Stack

| Layer | Tech |
|-------|------|
| **Framework** | Next.js 15 (App Router, React 19, Server Components) |
| **Database** | Convex (reactive, real-time, built-in optimistic updates) |
| **UI** | shadcn/ui + Tailwind CSS |
| **Auth** | Clerk |
| **Payments** | Stripe (credit-based) |
| **Scraping** | BrightData SERP API + Jina.ai |
| **AI Analysis** | Gemini Flash (free, swappable interface) |
| **Search Volume** | BrightData SERP (SerpAPI optional fallback) |
| **Hosting** | Vercel |

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npx convex dev       # Start Convex development
npx convex deploy    # Deploy Convex to production
```

## Architecture

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (sign-in, sign-up)
│   ├── (dashboard)/       # Protected app pages
│   │   ├── dashboard/     # Main dashboard + query input
│   │   ├── results/       # Query results view
│   │   └── settings/      # User settings + billing
│   ├── api/               # API routes (webhooks)
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # shadcn/ui base components
│   ├── query/             # Query-related components
│   ├── results/           # Results display components
│   └── layout/            # Layout components
├── lib/
│   ├── scraping/          # BrightData + Jina.ai clients
│   ├── ai/                # AI analysis engine (swappable)
│   ├── search-volume/     # SerpAPI integration
│   └── stripe/            # Stripe + credits logic
convex/
├── schema.ts              # Database schema + indexes
├── users.ts               # User queries/mutations
├── queries.ts             # Search query operations
├── results.ts             # Results operations
└── credits.ts             # Credit management
```

### Convex Patterns

```typescript
// Schema with indexes for performance
defineTable({
  userId: v.string(),
  niche: v.string(),
  status: v.string(),
  createdAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_user_created", ["userId", "createdAt"])

// Optimistic mutations
const result = useMutation(api.credits.deduct);
// Convex handles optimistic updates automatically via reactive queries

// Queries are reactive by default - no manual refetching needed
const queries = useQuery(api.queries.listByUser, { userId });
```

### Performance Requirements

- **Page load**: <1s on WiFi, <3s on 3G
- **Query submission**: Optimistic feedback <100ms
- **Credit updates**: Instant (optimistic)
- **Results display**: Progressive loading with skeletons
- **Bundle size**: <500KB initial load

### Existing Patterns to Follow

| Task | Pattern | Location |
|------|---------|----------|
| Database | Convex schema with indexes | `convex/schema.ts` |
| Queries | Reactive Convex queries | `convex/*.ts` |
| Mutations | Convex mutations (auto-optimistic) | `convex/*.ts` |
| Auth | Clerk + Convex user sync | `convex/users.ts` |
| UI Components | shadcn/ui from `components/ui/` | `src/components/ui/` |
| Server logic | Convex actions for external APIs | `convex/actions/` |
| Payments | Stripe webhooks + Convex mutations | `src/app/api/webhooks/` |

## Linear Integration

All issues tracked in Linear project "Micro saas whattobuild".
- **Team**: Staycoolairco (STA)
- **Project ID**: `abf87b3c-680c-4c8c-abcf-d5d2a86d634c`
- NEVER write to project "Wetryleadflow"

## Environment Variables

See `.env.local` for Linear config. App env vars:

- `NEXT_PUBLIC_CLERK_*` - Clerk authentication
- `NEXT_PUBLIC_CONVEX_URL` - Convex deployment URL
- `CONVEX_DEPLOYMENT` - Convex deployment ID
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` - Payments
- `BRIGHTDATA_API_TOKEN` / `BRIGHTDATA_ZONE` - BrightData SERP API
- `JINA_API_KEY` - Content extraction
- `GEMINI_API_KEY` / `GEMINI_MODEL` - Gemini Flash for AI analysis (free)
- `SERPAPI_KEY` - Search volume (optional, BrightData is primary)
