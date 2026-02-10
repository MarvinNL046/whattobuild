"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Link2, Sparkles } from "lucide-react";

const EXAMPLES = [
  "home gym equipment",
  "meal prep containers",
  "remote work tools",
  "pet grooming",
  "sleep tracking",
];

type Mode = "niche" | "url";

function isUrl(value: string): boolean {
  return /^https?:\/\/.+\..+/.test(value.trim());
}

function deriveNicheFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    const path = new URL(url).pathname;
    // Try to extract a meaningful niche from the URL path
    const segments = path.split("/").filter(Boolean);
    // Reddit: /r/subreddit/...
    if (hostname.includes("reddit.com") && segments[0] === "r") {
      return segments[1]?.replace(/_/g, " ") ?? "general";
    }
    // Product Hunt: /posts/product-name
    if (hostname.includes("producthunt.com") && segments[0] === "posts") {
      return segments[1]?.replace(/-/g, " ") ?? "general";
    }
    // HN: use last path segment
    if (hostname.includes("ycombinator.com")) {
      return "tech product";
    }
    // Fallback: use meaningful path segment
    const last = segments[segments.length - 1];
    return last?.replace(/[-_]/g, " ").slice(0, 50) ?? "general";
  } catch {
    return "general";
  }
}

export function SearchForm() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("niche");
  const [submitting, setSubmitting] = useState(false);

  const user = useQuery(api.users.getCurrent);
  const credits = useQuery(api.credits.getBalance);
  const startResearch = useMutation(api.queries.startResearch);
  const runResearch = useAction(api.actions.research.run);

  const trimmed = input.trim();
  const canSubmit =
    trimmed.length >= 2 && !submitting && (credits ?? 0) > 0;

  // Auto-detect URL when pasting
  function handleInputChange(value: string) {
    setInput(value);
    if (isUrl(value) && mode === "niche") {
      setMode("url");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setInput("");

    const isUrlMode = mode === "url" && isUrl(trimmed);
    const niche = isUrlMode ? deriveNicheFromUrl(trimmed) : trimmed;
    const sourceUrl = isUrlMode ? trimmed : undefined;

    try {
      const queryId = await startResearch({ niche, sourceUrl });

      runResearch({ queryId, niche, sourceUrl }).catch(() => {
        // Action handles its own error state
      });
    } catch {
      setInput(trimmed);
    } finally {
      setSubmitting(false);
      if (mode === "url") setMode("niche");
    }
  }

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        <button
          type="button"
          onClick={() => setMode("niche")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === "niche"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="size-3" />
          Niche search
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === "url"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Link2 className="size-3" />
          Paste URL
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={
            mode === "url"
              ? "Paste a Reddit thread, review page, or forum URL"
              : "Enter a niche, e.g. 'home gym equipment'"
          }
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
          <span className="hidden sm:inline">
            {mode === "url" ? "Analyze" : "Search"}
          </span>
        </Button>
      </form>

      {/* Quick examples - only show in niche mode */}
      {mode === "niche" && (
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setInput(ex)}
              className="rounded-full border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {/* URL mode hint */}
      {mode === "url" && (
        <p className="text-xs text-muted-foreground">
          Paste any Reddit thread, Product Hunt page, Quora question, or review page to extract pain points directly.
        </p>
      )}

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
