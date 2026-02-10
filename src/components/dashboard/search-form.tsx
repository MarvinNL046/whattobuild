"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Loader2,
  Link2,
  Sparkles,
  ShoppingCart,
  Monitor,
  LayoutList,
  Globe,
  Compass,
} from "lucide-react";

type Mode = "niche" | "url";
type ResearchType = "saas" | "ecommerce" | "directory" | "website" | "niche";

const RESEARCH_TYPES: {
  id: ResearchType;
  label: string;
  icon: typeof Monitor;
  examples: string[];
}[] = [
  {
    id: "saas",
    label: "SaaS",
    icon: Monitor,
    examples: ["project management", "email marketing", "CRM tool", "invoicing software"],
  },
  {
    id: "ecommerce",
    label: "E-commerce",
    icon: ShoppingCart,
    examples: ["meal prep containers", "home gym equipment", "pet grooming", "standing desk"],
  },
  {
    id: "directory",
    label: "Directory",
    icon: LayoutList,
    examples: ["local contractors", "SaaS alternatives", "remote jobs", "coworking spaces"],
  },
  {
    id: "website",
    label: "Website",
    icon: Globe,
    examples: ["sleep tracking tips", "meal planning guide", "home workout routines", "budgeting advice"],
  },
  {
    id: "niche",
    label: "Niche",
    icon: Compass,
    examples: ["sleep tracking", "remote work tools", "pet grooming", "home gym equipment"],
  },
];

function isUrl(value: string): boolean {
  return /^https?:\/\/.+\..+/.test(value.trim());
}

function deriveNicheFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    const path = new URL(url).pathname;
    const segments = path.split("/").filter(Boolean);
    if (hostname.includes("reddit.com") && segments[0] === "r") {
      return segments[1]?.replace(/_/g, " ") ?? "general";
    }
    if (hostname.includes("producthunt.com") && segments[0] === "posts") {
      return segments[1]?.replace(/-/g, " ") ?? "general";
    }
    if (hostname.includes("ycombinator.com")) {
      return "tech product";
    }
    const last = segments[segments.length - 1];
    return last?.replace(/[-_]/g, " ").slice(0, 50) ?? "general";
  } catch {
    return "general";
  }
}

export function SearchForm() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("niche");
  const [selectedTypes, setSelectedTypes] = useState<ResearchType[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const user = useQuery(api.users.getCurrent);
  const credits = useQuery(api.credits.getBalance);
  const startResearch = useMutation(api.queries.startResearch);
  const runResearch = useAction(api.actions.research.run);

  const trimmed = input.trim();
  const canSubmit = trimmed.length >= 2 && !submitting && (credits ?? 0) > 0;

  function toggleType(type: ResearchType) {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  // Get examples based on selected types (or show default niche examples)
  const activeExamples =
    selectedTypes.length > 0
      ? [...new Set(selectedTypes.flatMap((t) => RESEARCH_TYPES.find((r) => r.id === t)?.examples ?? []))].slice(0, 5)
      : RESEARCH_TYPES.find((r) => r.id === "niche")!.examples.slice(0, 5);

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
    const researchTypes = selectedTypes.length > 0 ? selectedTypes : undefined;

    try {
      const queryId = await startResearch({ niche, sourceUrl, researchTypes });

      runResearch({ queryId, niche, sourceUrl, researchTypes }).catch(() => {
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
      {/* Type chips - multi-select */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          What are you building? <span className="text-muted-foreground/60">(select one or more)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {RESEARCH_TYPES.map(({ id, label, icon: Icon }) => {
            const active = selectedTypes.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleType(id)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="size-3" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

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

      {/* Search input */}
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

      {/* Dynamic examples based on selected types */}
      {mode === "niche" && (
        <div className="flex flex-wrap gap-2">
          {activeExamples.map((ex) => (
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
