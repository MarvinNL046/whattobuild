"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, ChevronDown, ChevronUp, DollarSign, FileText, Globe, Lightbulb, MessageSquareQuote, Package, ShieldCheck, Star, Target, TrendingUp } from "lucide-react";

interface Supplier {
  platform: "aliexpress" | "alibaba" | "1688";
  productName: string;
  productUrl: string;
  priceHint?: string;
  description?: string;
}

interface Solution {
  title: string;
  description: string;
  type: "saas" | "ecommerce" | "service" | "content";
  difficulty: "easy" | "medium" | "hard";
  monetization: string;
  suppliers?: Supplier[];
}

interface Competitor {
  name: string;
  url?: string;
  description: string;
  pricing?: string;
  rating?: number;
  gap?: string;
}

interface PainPoint {
  title: string;
  description: string;
  frequency: number;
  confidence?: number;
  evidenceCount?: number;
  opportunityScore?: number;
  sentiment: "negative" | "neutral" | "mixed";
  quotes: { text: string; source: string; url?: string }[];
  keywords: string[];
  solutions?: Solution[];
  competitors?: Competitor[];
}

const SENTIMENT_STYLES: Record<string, string> = {
  negative: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  neutral: "bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
  mixed: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
};

const TYPE_STYLES: Record<string, string> = {
  saas: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  ecommerce: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  service: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  content: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
};

const TYPE_LABELS: Record<string, string> = {
  saas: "SaaS",
  ecommerce: "E-commerce",
  service: "Service",
  content: "Content",
};

const PLATFORM_STYLES: Record<string, string> = {
  aliexpress: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  alibaba: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  "1688": "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
};

const PLATFORM_LABELS: Record<string, string> = {
  aliexpress: "AliExpress",
  alibaba: "Alibaba",
  "1688": "1688",
};

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  medium: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  hard: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export function PainPointCard({
  painPoint,
  rank,
  queryId,
}: {
  painPoint: PainPoint;
  rank: number;
  queryId?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const saveMutation = useMutation(api.savedIdeas.save);
  const isSaved = useQuery(
    api.savedIdeas.isIdeaSaved,
    queryId ? { queryId: queryId as Id<"queries">, painPointTitle: painPoint.title } : "skip"
  );

  return (
    <Card className="gap-0 py-0 overflow-hidden">
      <CardHeader
        className="cursor-pointer py-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {rank}
            </span>
            <div className="min-w-0">
              <CardTitle className="text-sm leading-snug sm:text-base">
                {painPoint.title}
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {painPoint.description}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {painPoint.opportunityScore != null && <OpportunityBadge score={painPoint.opportunityScore} />}
            {painPoint.confidence != null && <ConfidenceBadge value={painPoint.confidence} />}
            {painPoint.evidenceCount != null && <EvidenceCount count={painPoint.evidenceCount} />}
            <FrequencyBar value={painPoint.frequency} />
            {queryId && (
              <Button
                variant="ghost"
                size="icon-xs"
                className={isSaved ? "text-primary" : "text-muted-foreground"}
                title={isSaved ? "Saved to workspace" : "Save to workspace"}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isSaved) {
                    saveMutation({
                      queryId: queryId as Id<"queries">,
                      painPointTitle: painPoint.title,
                      painPointDescription: painPoint.description,
                    });
                  }
                }}
              >
                {isSaved ? <BookmarkCheck className="size-3.5" /> : <Bookmark className="size-3.5" />}
              </Button>
            )}
            {expanded ? (
              <ChevronUp className="size-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="size-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="border-t pb-4 pt-4 space-y-4">
          {/* Sentiment + Keywords */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={SENTIMENT_STYLES[painPoint.sentiment]}
            >
              {painPoint.sentiment}
            </Badge>
            {painPoint.keywords.slice(0, 5).map((kw) => (
              <Badge key={kw} variant="secondary" className="text-xs">
                {kw}
              </Badge>
            ))}
          </div>

          {/* Quotes */}
          {painPoint.quotes.length > 0 && (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <MessageSquareQuote className="size-3" />
                Real quotes
              </p>
              {painPoint.quotes.map((quote, i) => (
                <blockquote
                  key={i}
                  className="rounded-md border-l-2 border-muted-foreground/20 bg-muted/50 px-3 py-2 text-xs italic text-muted-foreground"
                >
                  &ldquo;{quote.text}&rdquo;
                  <span className="mt-1 block text-[10px] not-italic">
                    — {quote.source}
                    {quote.url && (
                      <>
                        {" "}
                        <a
                          href={quote.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline underline-offset-2"
                        >
                          source
                        </a>
                      </>
                    )}
                  </span>
                </blockquote>
              ))}
            </div>
          )}

          {/* Solutions */}
          {painPoint.solutions && painPoint.solutions.length > 0 && (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Lightbulb className="size-3" />
                Product ideas
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {painPoint.solutions.map((solution, i) => (
                  <div
                    key={i}
                    className="rounded-lg border bg-card p-3 space-y-2"
                  >
                    <p className="text-sm font-medium leading-snug">
                      {solution.title}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {solution.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${TYPE_STYLES[solution.type]}`}
                      >
                        {TYPE_LABELS[solution.type]}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${DIFFICULTY_STYLES[solution.difficulty]}`}
                      >
                        {solution.difficulty}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {solution.monetization}
                    </p>
                    {solution.suppliers && solution.suppliers.length > 0 && (
                      <div className="border-t pt-2 mt-1 space-y-1.5">
                        <p className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                          <Package className="size-2.5" />
                          Suppliers
                        </p>
                        {solution.suppliers.map((supplier, si) => (
                          <div key={si} className="flex items-start gap-1.5">
                            <Badge
                              variant="outline"
                              className={`text-[9px] shrink-0 px-1 py-0 ${PLATFORM_STYLES[supplier.platform]}`}
                            >
                              {PLATFORM_LABELS[supplier.platform]}
                            </Badge>
                            <a
                              href={supplier.productUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-primary underline underline-offset-2 hover:no-underline line-clamp-1 leading-snug"
                            >
                              {supplier.productName}
                            </a>
                            {supplier.priceHint && (
                              <span className="text-[9px] text-muted-foreground shrink-0">
                                {supplier.priceHint}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing Solutions / Competitors */}
          {painPoint.competitors && painPoint.competitors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Globe className="size-3" />
                  Existing solutions
                </p>
                <MarketSaturationBadge count={painPoint.competitors.length} />
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {painPoint.competitors.map((competitor, i) => (
                  <div
                    key={i}
                    className="rounded-lg border bg-card p-3 space-y-1.5"
                  >
                    <p className="text-sm font-medium leading-snug">
                      {competitor.url ? (
                        <a
                          href={competitor.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary underline underline-offset-2 hover:no-underline"
                        >
                          {competitor.name}
                          <Globe className="size-3 shrink-0" />
                        </a>
                      ) : (
                        competitor.name
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {competitor.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {competitor.pricing && (
                        <Badge variant="outline" className="text-[10px] gap-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          <DollarSign className="size-2.5" />
                          {competitor.pricing}
                        </Badge>
                      )}
                      {competitor.rating != null && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 dark:text-amber-400">
                          <Star className="size-2.5 fill-current" />
                          {competitor.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    {competitor.gap && (
                      <p className="flex items-start gap-1 text-[10px] text-muted-foreground">
                        <Target className="mt-0.5 size-2.5 shrink-0 text-primary" />
                        {competitor.gap}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function OpportunityBadge({ score }: { score: number }) {
  const color =
    score >= 70
      ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
      : score >= 40
        ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
        : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300";

  return (
    <div
      className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 ${color}`}
      title={`Opportunity Score: ${score}/100`}
    >
      <TrendingUp className="size-3" />
      <span className="text-[10px] font-semibold tabular-nums">{score}</span>
    </div>
  );
}

function ConfidenceBadge({ value }: { value: number }) {
  const color =
    value >= 75
      ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
      : value >= 50
        ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
        : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300";

  return (
    <div
      className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 ${color}`}
      title={`Confidence: ${value}%`}
    >
      <ShieldCheck className="size-3" />
      <span className="text-[10px] font-medium tabular-nums">{value}%</span>
    </div>
  );
}

function EvidenceCount({ count }: { count: number }) {
  return (
    <div
      className="flex items-center gap-1 text-muted-foreground"
      title={`Based on ${count} source${count !== 1 ? "s" : ""}`}
    >
      <FileText className="size-3" />
      <span className="text-[10px] tabular-nums">{count}</span>
    </div>
  );
}

function FrequencyBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1" title={`Frequency: ${value}/10`}>
      <div className="flex gap-px">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-3 w-1 rounded-full ${
              i < Math.ceil(value / 2)
                ? "bg-primary"
                : "bg-muted"
            }`}
          />
        ))}
      </div>
      <span className="text-[10px] tabular-nums text-muted-foreground">
        {value}
      </span>
    </div>
  );
}

function MarketSaturationBadge({ count }: { count: number }) {
  const { label, className } =
    count <= 1
      ? { label: "Blue ocean", className: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" }
      : count <= 3
        ? { label: "Moderate", className: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300" }
        : { label: "Saturated", className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300" };

  return (
    <Badge variant="outline" className={`text-[10px] ${className}`}>
      {label}
    </Badge>
  );
}
