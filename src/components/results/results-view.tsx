"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { PainPointCard } from "./pain-point-card";
import { AdLinks } from "./ad-links";
import { VolumeTable } from "./volume-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function ResultsView({ queryId }: { queryId: string }) {
  const query = useQuery(api.queries.get, {
    queryId: queryId as Id<"queries">,
  });
  const result = useQuery(api.results.getByQuery, {
    queryId: queryId as Id<"queries">,
  });

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
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">
          Results are still being processed...
        </p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
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
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {query.niche}
          </h1>
          <p className="text-sm text-muted-foreground">
            {result.painPoints.length} pain points found
          </p>
        </div>
      </div>

      {/* Ad Library Links */}
      <AdLinks links={result.adLinks} niche={query.niche} />

      {/* Pain Points */}
      <div className="space-y-3">
        {result.painPoints.map((pp, i) => (
          <PainPointCard key={i} painPoint={pp} rank={i + 1} />
        ))}
      </div>

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
