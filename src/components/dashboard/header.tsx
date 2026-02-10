"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function DashboardHeader() {
  const credits = useQuery(api.credits.getBalance);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
          WhatToBuild
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-medium">
            <CreditIcon />
            <span>{credits ?? "..."}</span>
          </div>
          {hasClerk ? <ClerkUserButton /> : (
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Home
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function ClerkUserButton() {
  const { UserButton } = require("@clerk/nextjs");
  return <UserButton afterSignOutUrl="/" />;
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
