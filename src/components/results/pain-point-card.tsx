"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, MessageSquareQuote } from "lucide-react";

interface PainPoint {
  title: string;
  description: string;
  frequency: number;
  sentiment: "negative" | "neutral" | "mixed";
  quotes: { text: string; source: string; url?: string }[];
  keywords: string[];
}

const SENTIMENT_STYLES: Record<string, string> = {
  negative: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  neutral: "bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
  mixed: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
};

export function PainPointCard({
  painPoint,
  rank,
}: {
  painPoint: PainPoint;
  rank: number;
}) {
  const [expanded, setExpanded] = useState(false);

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
            <FrequencyBar value={painPoint.frequency} />
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
        </CardContent>
      )}
    </Card>
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
