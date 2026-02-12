"use client";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function LandingAuth() {
  return (
    <>
      <SignedOut>
        <SignInButton>
          <Button variant="ghost" size="sm">Sign in</Button>
        </SignInButton>
        <SignInButton>
          <Button size="sm">Get started</Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </>
  );
}

export function LandingHeroAuth() {
  return (
    <>
      <SignedOut>
        <SignInButton>
          <Button size="lg">Start for free</Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <Button size="lg" asChild>
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </SignedIn>
    </>
  );
}
