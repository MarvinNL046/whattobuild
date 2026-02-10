"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Pencil,
  Search,
  Rocket,
  Archive,
  Trash2,
} from "lucide-react";
import Link from "next/link";

type IdeaStatus = "saved" | "exploring" | "building" | "archived";

const STATUS_CONFIG: Record<IdeaStatus, { label: string; icon: typeof Bookmark; style: string }> = {
  saved: {
    label: "Saved",
    icon: Bookmark,
    style: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  exploring: {
    label: "Exploring",
    icon: Search,
    style: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
  building: {
    label: "Building",
    icon: Rocket,
    style: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  },
  archived: {
    label: "Archived",
    icon: Archive,
    style: "bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
  },
};

const STATUS_FLOW: IdeaStatus[] = ["saved", "exploring", "building", "archived"];

const TYPE_LABELS: Record<string, string> = {
  saas: "SaaS",
  ecommerce: "E-commerce",
  service: "Service",
  content: "Content",
};

export default function WorkspacePage() {
  const ideas = useQuery(api.savedIdeas.listByUser);
  const [showArchived, setShowArchived] = useState(false);

  if (ideas === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/dashboard">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Workspace</h1>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  const grouped = STATUS_FLOW.reduce<Record<IdeaStatus, typeof ideas>>((acc, status) => {
    acc[status] = ideas.filter((idea) => idea.status === status);
    return acc;
  }, { saved: [], exploring: [], building: [], archived: [] });

  const visibleStatuses = showArchived ? STATUS_FLOW : STATUS_FLOW.filter((s) => s !== "archived");
  const totalActive = ideas.filter((i) => i.status !== "archived").length;

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
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Workspace</h1>
          <p className="text-sm text-muted-foreground">
            {totalActive} saved idea{totalActive !== 1 ? "s" : ""}
          </p>
        </div>
        {grouped.archived.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className="text-muted-foreground"
          >
            <Archive className="size-3.5" />
            {showArchived ? "Hide" : "Show"} archived ({grouped.archived.length})
          </Button>
        )}
      </div>

      {ideas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bookmark className="mx-auto size-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-medium">No saved ideas yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Save pain points from your research results to track them here.
            </p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/dashboard">Start researching</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        visibleStatuses.map((status) => {
          const statusIdeas = grouped[status];
          if (statusIdeas.length === 0) return null;
          const config = STATUS_CONFIG[status];
          const Icon = config.icon;

          return (
            <div key={status} className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon className="size-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">{config.label}</h2>
                <Badge variant="secondary" className="text-[10px]">
                  {statusIdeas.length}
                </Badge>
              </div>
              {statusIdeas.map((idea) => (
                <IdeaCard key={idea._id} idea={idea} />
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}

interface SavedIdea {
  _id: Id<"savedIdeas">;
  painPointTitle: string;
  painPointDescription: string;
  solutionTitle?: string;
  solutionDescription?: string;
  solutionType?: "saas" | "ecommerce" | "service" | "content";
  notes?: string;
  status: IdeaStatus;
  createdAt: number;
}

function IdeaCard({ idea }: { idea: SavedIdea }) {
  const [expanded, setExpanded] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(idea.notes ?? "");
  const updateStatus = useMutation(api.savedIdeas.updateStatus);
  const updateNotes = useMutation(api.savedIdeas.updateNotes);
  const removeIdea = useMutation(api.savedIdeas.remove);

  const config = STATUS_CONFIG[idea.status];

  const handleStatusChange = (newStatus: IdeaStatus) => {
    updateStatus({ ideaId: idea._id, status: newStatus });
  };

  const handleSaveNotes = () => {
    updateNotes({ ideaId: idea._id, notes: notesValue });
    setEditingNotes(false);
  };

  return (
    <Card className="gap-0 py-0 overflow-hidden">
      <CardHeader
        className="cursor-pointer py-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-sm leading-snug">
              {idea.painPointTitle}
            </CardTitle>
            {idea.solutionTitle && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Lightbulb className="size-3 shrink-0" />
                {idea.solutionTitle}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant="outline" className={`text-[10px] ${config.style}`}>
              {config.label}
            </Badge>
            {idea.solutionType && (
              <Badge variant="secondary" className="text-[10px]">
                {TYPE_LABELS[idea.solutionType]}
              </Badge>
            )}
            {idea.notes && !expanded && (
              <Pencil className="size-3 text-muted-foreground" />
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
          {/* Pain point description */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            {idea.painPointDescription}
          </p>

          {/* Solution details */}
          {idea.solutionDescription && (
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="flex items-center gap-1.5 text-xs font-medium">
                <Lightbulb className="size-3" />
                Solution
              </p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {idea.solutionDescription}
              </p>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs font-medium">
                <Pencil className="size-3" />
                Notes
              </p>
              {!editingNotes && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    setNotesValue(idea.notes ?? "");
                    setEditingNotes(true);
                  }}
                >
                  {idea.notes ? "Edit" : "Add note"}
                </Button>
              )}
            </div>
            {editingNotes ? (
              <div className="space-y-2">
                <textarea
                  className="w-full rounded-md border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  placeholder="Add your notes..."
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="xs" onClick={handleSaveNotes}>
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setEditingNotes(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              idea.notes && (
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {idea.notes}
                </p>
              )
            )}
          </div>

          {/* Status change + delete */}
          <div className="flex items-center justify-between border-t pt-3">
            <div className="flex gap-1.5">
              {STATUS_FLOW.filter((s) => s !== idea.status).map((status) => {
                const cfg = STATUS_CONFIG[status];
                const StatusIcon = cfg.icon;
                return (
                  <Button
                    key={status}
                    variant="outline"
                    size="xs"
                    onClick={() => handleStatusChange(status)}
                    title={`Move to ${cfg.label}`}
                  >
                    <StatusIcon className="size-3" />
                    {cfg.label}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:text-destructive"
              title="Remove from workspace"
              onClick={() => removeIdea({ ideaId: idea._id })}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
