"use client";

import { ReactNode, useEffect, useRef } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";

interface ProfileProviderProps {
  children: ReactNode;
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const profile = useQuery(api.profiles.getCurrentProfile);
  const ensureProfile = useMutation(api.profiles.ensureCurrentUserProfile);

  // Track if we're currently updating to prevent multiple simultaneous calls
  const isUpdating = useRef(false);
  const lastSyncedUsername = useRef<string | undefined>(undefined);
  const lastSyncedFirstName = useRef<string | undefined>(undefined);
  const lastSyncedLastName = useRef<string | undefined>(undefined);
  const lastSyncedImageUrl = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Only run if user is signed in
    if (!isSignedIn || !user) return;

    // Create profile if it doesn't exist
    if (profile === null) {
      if (!isUpdating.current) {
        isUpdating.current = true;
        ensureProfile({
          username: user.username || undefined,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          imageUrl: user.imageUrl || undefined,
        })
          .then(() => {
            console.log("[ProfileProvider] Profile created");
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

    // Always sync all fields from Clerk (Clerk is source of truth)
    if (profile && user) {
      const clerkUsername = user.username || undefined;
      const clerkFirstName = user.firstName || undefined;
      const clerkLastName = user.lastName || undefined;
      const clerkImageUrl = user.imageUrl || undefined;

      // Check if we actually need to update (and haven't just updated)
      const usernameNeedsUpdate = 
        profile.username !== clerkUsername &&
        lastSyncedUsername.current !== clerkUsername;
      const firstNameNeedsUpdate =
        profile.firstName !== clerkFirstName &&
        lastSyncedFirstName.current !== clerkFirstName;
      const lastNameNeedsUpdate =
        profile.lastName !== clerkLastName &&
        lastSyncedLastName.current !== clerkLastName;
      const imageUrlNeedsUpdate = 
        profile.imageUrl !== clerkImageUrl &&
        lastSyncedImageUrl.current !== clerkImageUrl;
      
      const needsUpdate = (
        (usernameNeedsUpdate || firstNameNeedsUpdate || lastNameNeedsUpdate || imageUrlNeedsUpdate) && 
        !isUpdating.current
      );

      if (needsUpdate) {
        isUpdating.current = true;
        lastSyncedUsername.current = clerkUsername;
        lastSyncedFirstName.current = clerkFirstName;
        lastSyncedLastName.current = clerkLastName;
        lastSyncedImageUrl.current = clerkImageUrl;

        ensureProfile({
          username: clerkUsername,
          firstName: clerkFirstName,
          lastName: clerkLastName,
          imageUrl: clerkImageUrl,
        })
          .then(() => {
            console.log("[ProfileProvider] Profile synced from Clerk");
          })
          .catch(() => {
            // Reset on error so it can retry
            lastSyncedUsername.current = undefined;
            lastSyncedFirstName.current = undefined;
            lastSyncedLastName.current = undefined;
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