"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  ExternalLink,
  Pause,
  Play,
  Trash2,
} from "lucide-react";
import Link from "next/link";

const TYPE_LABELS: Record<string, string> = {
  saas: "SaaS",
  ecommerce: "E-commerce",
  directory: "Directory",
  website: "Website",
};

type MonitorDoc = {
  _id: Id<"monitoredNiches">;
  niche: string;
  status: "active" | "paused";
  researchTypes?: ("saas" | "ecommerce" | "directory" | "website")[];
  lastRunAt?: number;
  lastQueryId?: Id<"queries">;
  createdAt: number;
};

export default function MonitorPage() {
  const monitors = useQuery(api.monitoredNiches.listByUser);

  if (monitors === undefined) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="shrink-0">
              <Link href="/dashboard">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Monitored Niches</h1>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const active = monitors.filter((m) => m.status === "active");
  const paused = monitors.filter((m) => m.status === "paused");

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" asChild className="mt-0.5 shrink-0">
            <Link href="/dashboard">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Monitored Niches</h1>
            <p className="text-sm text-muted-foreground">
              {active.length} active monitor{active.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {monitors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Eye className="mx-auto size-8 text-muted-foreground/50" />
              <p className="mt-3 text-sm font-medium">No monitored niches yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Monitor a niche from your research results to get weekly email alerts with new pain points.
              </p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/dashboard">Start researching</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {active.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Eye className="size-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">Active</h2>
                  <Badge variant="secondary" className="text-[10px]">
                    {active.length}
                  </Badge>
                </div>
                {active.map((m) => (
                  <MonitorCard key={m._id} monitor={m} />
                ))}
              </div>
            )}

            {paused.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <EyeOff className="size-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">Paused</h2>
                  <Badge variant="secondary" className="text-[10px]">
                    {paused.length}
                  </Badge>
                </div>
                {paused.map((m) => (
                  <MonitorCard key={m._id} monitor={m} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function MonitorCard({ monitor }: { monitor: MonitorDoc }) {
  const pauseMutation = useMutation(api.monitoredNiches.pause);
  const resumeMutation = useMutation(api.monitoredNiches.resume);
  const removeMutation = useMutation(api.monitoredNiches.remove);

  const isActive = monitor.status === "active";

  return (
    <Card className="gap-0 py-0 overflow-hidden">
      <CardHeader className="py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-sm leading-snug">{monitor.niche}</CardTitle>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge
                variant="outline"
                className={`text-[10px] ${
                  isActive
                    ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                    : "bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
                }`}
              >
                {isActive ? "Active" : "Paused"}
              </Badge>
              {monitor.researchTypes?.map((t) => (
                <Badge key={t} variant="secondary" className="text-[10px]">
                  {TYPE_LABELS[t]}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {monitor.lastQueryId && (
              <Button variant="ghost" size="icon-xs" asChild title="View last results">
                <Link href={`/results/${monitor.lastQueryId}`}>
                  <ExternalLink className="size-3" />
                </Link>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-xs"
              title={isActive ? "Pause monitoring" : "Resume monitoring"}
              onClick={() =>
                isActive
                  ? pauseMutation({ monitorId: monitor._id })
                  : resumeMutation({ monitorId: monitor._id })
              }
            >
              {isActive ? <Pause className="size-3" /> : <Play className="size-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:text-destructive"
              title="Delete monitor"
              onClick={() => removeMutation({ monitorId: monitor._id })}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {monitor.lastRunAt && (
        <CardContent className="border-t py-2">
          <p className="text-[11px] text-muted-foreground">
            Last run: {new Date(monitor.lastRunAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
