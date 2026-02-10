"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";

const EXAMPLES = [
  "home gym equipment",
  "meal prep containers",
  "remote work tools",
  "pet grooming",
  "sleep tracking",
];

export function SearchForm() {
  const [niche, setNiche] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const user = useQuery(api.users.getCurrent);
  const credits = useQuery(api.credits.getBalance);
  const startResearch = useMutation(api.queries.startResearch);
  const runResearch = useAction(api.actions.research.run);

  const canSubmit =
    niche.trim().length >= 2 && !submitting && (credits ?? 0) > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !user) return;

    const trimmed = niche.trim();
    setSubmitting(true);
    setNiche("");

    try {
      // Single atomic mutation: credit check + deduct + create query
      const queryId = await startResearch({ niche: trimmed });

      // Fire and forget - status updates flow via reactive queries
      runResearch({ queryId, niche: trimmed }).catch(() => {
        // Action handles its own error state (marks query as failed)
      });
    } catch {
      // Restore input on failure
      setNiche(trimmed);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          placeholder="Enter a niche, e.g. 'home gym equipment'"
          className="h-11 text-base"
          autoFocus
          disabled={submitting}
        />
        <Button
          type="submit"
          size="lg"
          disabled={!canSubmit}
          className="shrink-0"
        >
          {submitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Search className="size-4" />
          )}
          <span className="hidden sm:inline">Search</span>
        </Button>
      </form>

      {/* Quick examples - kills choice paralysis */}
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setNiche(ex)}
            className="rounded-full border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {ex}
          </button>
        ))}
      </div>

      {(credits ?? 0) === 0 && user && (
        <p className="text-sm text-muted-foreground">
          No credits remaining.{" "}
          <a
            href="/settings"
            className="text-primary underline underline-offset-2"
          >
            Buy more
          </a>
        </p>
      )}
    </div>
  );
}
