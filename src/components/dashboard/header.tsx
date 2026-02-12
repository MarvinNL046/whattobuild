"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Menu } from "lucide-react";

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const ClerkUserButton = hasClerk
  ? dynamic(() => import("@clerk/nextjs").then((mod) => ({ default: () => <mod.UserButton afterSignOutUrl="/" /> })), { ssr: false })
  : null;

interface DashboardHeaderProps {
  onToggleSidebar?: () => void;
}

export function DashboardHeader({ onToggleSidebar }: DashboardHeaderProps) {
  const credits = useQuery(api.credits.getBalance);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
            WhatToBuild
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-medium">
            <CreditIcon />
            <span>{credits ?? "..."}</span>
          </div>
          {ClerkUserButton ? <ClerkUserButton /> : (
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Home
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function CreditIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v12M6 12h12" />
    </svg>
  );
}
