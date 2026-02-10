"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryStatus } from "./query-status";
import Link from "next/link";

export function QueryList() {
  const queries = useQuery(api.queries.listByUser);

  if (queries === undefined) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (queries.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p className="text-sm">No research yet. Enter a niche above to start.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {queries.map((q) => (
        <QueryRow key={q._id} query={q} />
      ))}
    </div>
  );
}

function QueryRow({
  query,
}: {
  query: {
    _id: string;
    niche: string;
    status: string;
    createdAt: number;
  };
}) {
  const isDone = query.status === "done";
  const isFailed = query.status === "failed";
  const isRunning = !isDone && !isFailed;

  const className = `flex items-center justify-between rounded-lg border px-4 py-3 transition-colors ${
    isDone ? "cursor-pointer hover:bg-accent/50" : "opacity-90"
  }`;

  const content = (
    <>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{query.niche}</p>
        <p className="text-xs text-muted-foreground">
          {formatTimeAgo(query.createdAt)}
        </p>
      </div>
      <div className="ml-3 shrink-0">
        <QueryStatus status={query.status} animate={isRunning} />
      </div>
    </>
  );

  if (isDone) {
    return (
      <Link href={`/results/${query._id}`} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
