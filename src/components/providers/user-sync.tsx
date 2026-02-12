"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

/**
 * Syncs Clerk user data to Convex on sign-in.
 * Ensures a user record exists in the users table with credits.
 */
export function UserSync() {
  const { user, isSignedIn } = useUser();
  const createOrUpdate = useMutation(api.users.createOrUpdate);
  const synced = useRef(false);

  useEffect(() => {
    if (!isSignedIn || !user || synced.current) return;
    synced.current = true;

    createOrUpdate({
      clerkId: user.id,
      email: user.primaryEmailAddress?.emailAddress ?? "",
      name: user.fullName ?? user.firstName ?? undefined,
      imageUrl: user.imageUrl ?? undefined,
    }).catch(() => {
      // Reset so it retries on next render
      synced.current = false;
    });
  }, [isSignedIn, user, createOrUpdate]);

  return null;
}
