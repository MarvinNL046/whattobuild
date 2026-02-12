"use client";

import { useState } from "react";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { PainPointCard } from "./pain-point-card";
import { AdLinks } from "./ad-links";
import { VolumeTable } from "./volume-table";
import { NextSteps } from "./next-steps";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import type { ExportData } from "@/lib/export";
import { MonitorButton } from "./monitor-button";

export function ResultsView({ queryId }: { queryId: string }) {
  const [regenerating, setRegenerating] = useState(false);
  const query = useQuery(api.queries.get, {
    queryId: queryId as Id<"queries">,
  });
  const result = useQuery(api.results.getByQuery, {
    queryId: queryId as Id<"queries">,
  });
  const regenerate = useAction(api.actions.regenerate.run);
  const resetFailed = useMutation(api.queries.resetFailed);
  const runResearch = useAction(api.actions.research.run);

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      await regenerate({ queryId: queryId as Id<"queries"> });
    } finally {
      setRegenerating(false);
    }
  }

  async function handleRetry() {
    setRegenerating(true);
    try {
      const queryData = await resetFailed({ queryId: queryId as Id<"queries"> });
      runResearch({
        queryId: queryId as Id<"queries">,
        niche: queryData.niche,
        sourceUrl: queryData.sourceUrl ?? undefined,
        researchTypes: queryData.researchTypes ?? undefined,
      }).catch(() => {});
    } catch {
      setRegenerating(false);
    }
  }

  if (query === undefined || result === undefined) {
    return <ResultsSkeleton />;
  }

  if (!query) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Research not found.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  if (!result) {
    const isFailed = query.status === "failed";
    return (
      <div className="py-12 text-center">
        {isFailed ? (
          <>
            <p className="text-muted-foreground">
              This research failed. Try again or start a new one.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Button variant="outline" onClick={handleRetry} disabled={regenerating}>
                {regenerating ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCw className="mr-2 size-4" />}
                Retry
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">New research</Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              Researching — this usually takes 30–60 seconds...
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Status: {query.status}
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" asChild className="mt-0.5 shrink-0">
          <Link href="/dashboard">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {query.niche}
          </h1>
          <p className="text-sm text-muted-foreground">
            {result.painPoints.length} pain points found
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MonitorButton
            niche={query.niche}
            sourceUrl={query.sourceUrl ?? undefined}
            researchTypes={(query.researchTypes ?? undefined) as ("saas" | "ecommerce" | "directory" | "website")[] | undefined}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={regenerating}
            title="Generate fresh product ideas for these pain points"
          >
            <RefreshCw className={`size-3.5 ${regenerating ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">
              {regenerating ? "Generating..." : "Try another angle"}
            </span>
          </Button>
        </div>
      </div>

      {/* Ad Library Links */}
      <AdLinks links={result.adLinks} niche={query.niche} />

      {/* Pain Points */}
      <div className="space-y-3">
        {result.painPoints.map((pp, i) => (
          <PainPointCard key={i} painPoint={pp} rank={i + 1} queryId={queryId} />
        ))}
      </div>

      {/* Next Steps */}
      <NextSteps
        adLinks={result.adLinks}
        niche={query.niche}
        topKeyword={result.painPoints[0]?.keywords[0]}
        exportData={{
          niche: query.niche,
          painPoints: result.painPoints,
          searchVolume: result.searchVolume,
          adLinks: result.adLinks,
        } satisfies ExportData}
      />

      {/* Search Volume Table */}
      {result.searchVolume && result.searchVolume.length > 0 && (
        <VolumeTable data={result.searchVolume} />
      )}
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-12 w-full rounded-lg" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
