"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Folder, Eye, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

type QueryItem = {
  _id: string;
  niche: string;
  status: string;
  createdAt: number;
};

function groupByDate(queries: QueryItem[]) {
  const now = Date.now();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();
  const yesterdayMs = todayMs - 86_400_000;
  const weekMs = todayMs - 7 * 86_400_000;

  const groups: { label: string; items: QueryItem[] }[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Previous 7 days", items: [] },
    { label: "Older", items: [] },
  ];

  for (const q of queries) {
    if (q.createdAt >= todayMs) {
      groups[0].items.push(q);
    } else if (q.createdAt >= yesterdayMs) {
      groups[1].items.push(q);
    } else if (q.createdAt >= weekMs) {
      groups[2].items.push(q);
    } else {
      groups[3].items.push(q);
    }
  }

  return groups.filter((g) => g.items.length > 0);
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const queries = useQuery(api.queries.listByUser);
  const pathname = usePathname();

  const grouped = queries ? groupByDate(queries) : [];

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-muted/30 pt-14 transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 lg:pt-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between p-3 lg:hidden">
          <span className="text-sm font-medium">History</span>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* New chat button */}
        <div className="p-3">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex w-full items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            <Plus className="size-4" />
            New research
          </Link>
        </div>

        {/* Query history */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3">
          {queries === undefined ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : grouped.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              No research yet
            </p>
          ) : (
            grouped.map((group) => (
              <div key={group.label} className="mb-4">
                <p className="mb-1 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((q) => {
                    const isActive = pathname === `/results/${q._id}`;
                    const isRunning =
                      q.status !== "done" && q.status !== "failed";

                    return (
                      <Link
                        key={q._id}
                        href={`/results/${q._id}`}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                          isActive
                            ? "bg-accent text-foreground"
                            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                        )}
                      >
                        {isRunning && (
                          <Loader2 className="size-3 shrink-0 animate-spin" />
                        )}
                        <span className="truncate">{q.niche}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </nav>

        {/* Bottom links */}
        <div className="border-t p-3 space-y-0.5">
          <Link
            href="/workspace"
            onClick={onClose}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
              pathname === "/workspace"
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            <Folder className="size-4" />
            Workspace
          </Link>
          <Link
            href="/monitor"
            onClick={onClose}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
              pathname === "/monitor"
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            <Eye className="size-4" />
            Monitors
          </Link>
        </div>
      </aside>
    </>
  );
}
