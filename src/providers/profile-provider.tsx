"use client";

import { ReactNode, useEffect, useRef } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface ProfileProviderProps {
  children: ReactNode;
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const profile = useQuery(api.profiles.getCurrentProfile);
  const ensureProfile = useMutation(api.profiles.ensureCurrentUserProfile);

  // Track if we're currently updating to prevent multiple simultaneous calls
  const isUpdating = useRef(false);
  const lastSyncedUsername = useRef<string | undefined>(undefined);
  const lastSyncedImageUrl = useRef<string | undefined>(undefined);

  // Debug logging
  console.log("[ProfileProvider] Component rendered", {
    isLoaded,
    isSignedIn,
    user: user?.id,
    profileStatus: profile === undefined ? "loading" : profile === null ? "not-found" : "exists",
    profileId: profile?._id,
  });

  useEffect(() => {
    console.log("[ProfileProvider] Effect running", {
      isSignedIn,
      userExists: !!user,
      profileStatus: profile === undefined ? "loading" : profile === null ? "not-found" : "exists",
    });

    // Only run if user is signed in
    if (!isSignedIn || !user) return;

    // Create profile if it doesn't exist
    if (profile === null) {
      if (!isUpdating.current) {
        isUpdating.current = true;
        ensureProfile({
          username: user.username || undefined,
          imageUrl: user.imageUrl || undefined,
        })
          .then((result) => {
            if (result.created) {
              console.log("[ProfileProvider] Created profile:", result.profileId);
            }
          })
          .catch((error) => {
            console.error("[ProfileProvider] Failed to create profile:", error);
          })
          .finally(() => {
            isUpdating.current = false;
          });
      }
      return;
    }

    // Always sync username and imageUrl from Clerk (Clerk is source of truth)
    if (profile && user) {
      const clerkUsername = user.username || undefined;
      const clerkImageUrl = user.imageUrl || undefined;

      // Check if we actually need to update (and haven't just updated)
      const usernameNeedsUpdate = profile.username !== clerkUsername &&
                                 lastSyncedUsername.current !== clerkUsername;
      const imageUrlNeedsUpdate = profile.imageUrl !== clerkImageUrl &&
                                 lastSyncedImageUrl.current !== clerkImageUrl;
      const needsUpdate = ((usernameNeedsUpdate || imageUrlNeedsUpdate) && !isUpdating.current);

      if (needsUpdate) {
        console.log("[ProfileProvider] Syncing from Clerk:", {
          username: usernameNeedsUpdate ? clerkUsername : undefined,
          imageUrl: imageUrlNeedsUpdate ? clerkImageUrl : undefined,
        });
        isUpdating.current = true;
        lastSyncedUsername.current = clerkUsername;
        lastSyncedImageUrl.current = clerkImageUrl;

        ensureProfile({
          username: clerkUsername,
          imageUrl: clerkImageUrl,
        })
          .then((result) => {
            console.log("[ProfileProvider] Profile sync completed:", result.message);
          })
          .catch((error) => {
            console.error("[ProfileProvider] Failed to sync profile:", error);
            // Reset on error so it can retry
            lastSyncedUsername.current = undefined;
            lastSyncedImageUrl.current = undefined;
          })
          .finally(() => {
            isUpdating.current = false;
          });
      }
    }
  }, [isSignedIn, profile, user, ensureProfile]);

  return <>{children}</>;
}