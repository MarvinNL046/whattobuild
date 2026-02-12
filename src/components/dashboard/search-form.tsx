"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  ArrowUp,
  Loader2,
  Link2,
  Sparkles,
  ShoppingCart,
  Monitor,
  LayoutList,
  Globe,
} from "lucide-react";

type Mode = "niche" | "url";
type ResearchType = "saas" | "ecommerce" | "directory" | "website";

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
];

const DEFAULT_EXAMPLES = ["sleep tracking", "remote work tools", "pet grooming", "home gym equipment"];

const PRESETS: {
  emoji: string;
  title: string;
  niche: string;
  types: ResearchType[];
}[] = [
  { emoji: "\u{1F3CB}\u{FE0F}", title: "Home Fitness", niche: "home gym equipment for small apartments", types: ["ecommerce"] },
  { emoji: "\u{1F4E7}", title: "Email Tools", niche: "email marketing automation for small business", types: ["saas"] },
  { emoji: "\u{1F415}", title: "Pet Care", niche: "dog grooming and pet wellness products", types: ["ecommerce"] },
  { emoji: "\u{1F4BC}", title: "Remote Work", niche: "remote team collaboration and productivity tools", types: ["saas", "directory"] },
  { emoji: "\u{1F4B0}", title: "Budgeting", niche: "personal finance tracking and budgeting app", types: ["saas"] },
  { emoji: "\u{1F37D}\u{FE0F}", title: "Meal Prep", niche: "meal prep delivery and food storage solutions", types: ["ecommerce"] },
  { emoji: "\u{1F4DA}", title: "Online Courses", niche: "online course platform for creators and coaches", types: ["saas", "directory"] },
  { emoji: "\u{1F3E0}", title: "Smart Home", niche: "smart home automation and energy saving devices", types: ["ecommerce", "website"] },
  { emoji: "\u{1F517}", title: "Affiliate", niche: "high commission affiliate programs for digital and physical products", types: ["website", "directory"] },
  { emoji: "\u{1F476}", title: "Baby & Kids", niche: "baby gear and toddler products for new parents", types: ["ecommerce"] },
  { emoji: "\u{1F4F1}", title: "No-Code", niche: "no-code app builder and automation tools", types: ["saas", "directory"] },
  { emoji: "\u{2615}", title: "Subscription", niche: "subscription box ideas for niche hobby communities", types: ["ecommerce", "website"] },
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

/** Standalone preset grid for use in the empty state */
export function PresetGrid({ onSelect }: { onSelect: (preset: typeof PRESETS[number]) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {PRESETS.map((preset) => (
        <button
          key={preset.niche}
          type="button"
          onClick={() => onSelect(preset)}
          className="flex items-center gap-2 rounded-lg border bg-secondary/50 px-3 py-2.5 text-left text-sm transition-colors hover:bg-secondary hover:text-foreground"
        >
          <span className="text-base leading-none">{preset.emoji}</span>
          <span className="font-medium text-muted-foreground">
            {preset.title}
          </span>
        </button>
      ))}
    </div>
  );
}

interface SearchFormProps {
  hidePresets?: boolean;
}

export function SearchForm({ hidePresets }: SearchFormProps) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("niche");
  const [selectedTypes, setSelectedTypes] = useState<ResearchType[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Auto-fill from ?q= and ?types= query params
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setInput(q);
    }
    const typesParam = searchParams.get("types");
    if (typesParam) {
      const types = typesParam.split(",").filter((t): t is ResearchType =>
        ["saas", "ecommerce", "directory", "website"].includes(t)
      );
      if (types.length > 0) {
        setSelectedTypes(types);
      }
    }
  }, [searchParams]);

  function applyPreset(preset: (typeof PRESETS)[number]) {
    setInput(preset.niche);
    setSelectedTypes(preset.types);
    setMode("niche");
  }

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
      : DEFAULT_EXAMPLES;

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

      router.push(`/results/${queryId}`);
    } catch {
      setInput(trimmed);
    } finally {
      setSubmitting(false);
      if (mode === "url") setMode("niche");
    }
  }

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 192)}px`; // max ~12rem
  }, []);

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    handleInputChange(e.target.value);
    autoResize();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSubmit) {
        handleSubmit(e as unknown as React.FormEvent);
      }
    }
  }

  // Reset textarea height when input is cleared (after submit)
  useEffect(() => {
    if (input === "") autoResize();
  }, [input, autoResize]);

  return (
    <div className="space-y-3">
      {/* Preset suggestions — visible only when input is empty and not hidden */}
      {!hidePresets && input.length === 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Quick start — try a popular niche
          </p>
          <PresetGrid onSelect={applyPreset} />
        </div>
      )}

      {/* ChatGPT/Claude-style input container */}
      <form onSubmit={handleSubmit}>
        <div className="relative rounded-2xl border bg-background shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          {/* Top bar: type chips (left) + mode toggle (right) */}
          <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
            {/* Type chips */}
            <div className="flex flex-wrap gap-1.5">
              {RESEARCH_TYPES.map(({ id, label, icon: Icon }) => {
                const active = selectedTypes.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleType(id)}
                    className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-transparent bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-3" />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Mode toggle */}
            <div className="flex shrink-0 gap-0.5 rounded-lg bg-muted p-0.5">
              <button
                type="button"
                onClick={() => setMode("niche")}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  mode === "niche"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles className="size-3" />
                <span className="hidden sm:inline">Niche</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("url")}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  mode === "url"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Link2 className="size-3" />
                <span className="hidden sm:inline">URL</span>
              </button>
            </div>
          </div>

          {/* Textarea + submit button */}
          <div className="relative px-3 py-3 pr-14">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={
                mode === "url"
                  ? "Paste a URL from any community, review site, or discussion thread…"
                  : "Describe a niche or product idea, e.g. 'home gym equipment for small apartments'…"
              }
              className="w-full resize-none bg-transparent text-base leading-relaxed placeholder:text-muted-foreground/60 focus:outline-none disabled:opacity-50"
              style={{ minHeight: "3rem", maxHeight: "12rem" }}
              rows={2}
              disabled={submitting}
            />

            {/* Submit button — bottom-right inside container */}
            <Button
              type="submit"
              size="icon"
              disabled={!canSubmit}
              className="absolute bottom-3 right-3 size-9 rounded-xl"
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowUp className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Dynamic examples based on selected types — hidden when hidePresets */}
      {!hidePresets && mode === "niche" && (
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

      {/* URL mode hint — hidden when hidePresets */}
      {!hidePresets && mode === "url" && (
        <p className="text-xs text-muted-foreground">
          We'll extract pain points directly from any URL — community threads, review pages, discussions, you name it.
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
