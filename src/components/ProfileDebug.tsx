"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";

export function ProfileDebug() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const profile = useQuery(api.profiles.getCurrentProfile);
  const ensureProfile = useMutation(api.profiles.ensureCurrentUserProfile);

  const handleCreateProfile = async () => {
    if (!user) {
      console.error("[ProfileDebug] No user found");
      return;
    }

    try {
      console.log("[ProfileDebug] Manually creating profile...");
      const result = await ensureProfile({
        username: user.username || undefined,
        imageUrl: user.imageUrl || undefined,
      });
      console.log("[ProfileDebug] Profile creation result:", result);
      alert(`Profile ${result.created ? "created" : "updated"}: ${result.message}`);
    } catch (error) {
      console.error("[ProfileDebug] Error creating profile:", error);
      alert(`Error: ${error}`);
    }
  };

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-card border rounded-lg shadow-lg z-50 max-w-sm">
      <h3 className="font-bold mb-2">Profile Debug</h3>
      <div className="text-xs space-y-1 mb-3">
        <p>User ID: {user?.id || "None"}</p>
        <p>Profile: {profile === undefined ? "Loading..." : profile === null ? "Not found" : `Exists (${profile._id})`}</p>
        <p>Username: {profile?.username || "Not set"}</p>
      </div>
      {profile === null && (
        <Button onClick={handleCreateProfile} size="sm" className="w-full">
          Manually Create Profile
        </Button>
      )}
    </div>
  );
}