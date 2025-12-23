"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, X, Check, Loader2 } from "lucide-react";
import { AvatarUpload } from "./avatar-upload";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/fetch";
import { useAuthStore } from "@/store/auth-store";
import type { User } from "@/types/api-v1";

interface EditableUserCardProps {
  className?: string;
  user: {
    id: string;
    username: string | null;
    displayName: string | null;
    email: string | null;
    bio: string | null;
    avatarUrl: string | null;
  };
}

interface UpdateUserData {
  displayName?: string;
  bio?: string;
}

interface UpdateUserResponse {
  data?: {
    user: User;
  };
}

async function updateUser(data: UpdateUserData): Promise<UpdateUserResponse> {
  return apiFetch("/api/users/update", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function EditableUserCard({ className, user }: EditableUserCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [bio, setBio] = useState(user.bio || "");
  const { setUser } = useAuthStore();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateUser,
    onSuccess: (response: UpdateUserResponse) => {
      // Update store directly with response data
      if (response.data?.user) {
        setUser(response.data.user);
      }
      // Invalidate React Query cache to trigger parent re-render
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Profile updated successfully");
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const handleSave = () => {
    // Only send fields that are being updated
    mutation.mutate({
      displayName: displayName.trim() || undefined,
      bio: bio.trim() || undefined,
    });
  };

  const handleCancel = () => {
    setDisplayName(user.displayName || "");
    setBio(user.bio || "");
    setIsEditing(false);
  };

  const initials = user.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.username?.slice(0, 2).toUpperCase() || "??";

  return (
    <Card className={className}>
      <CardContent className="space-y-4">
        {/* Avatar Section */}
        <div className="flex items-start gap-6">
          <div className="shrink-0">
            {isEditing ? (
              <AvatarUpload
                currentAvatarUrl={user.avatarUrl}
                username={user.username || ""}
                displayName={user.displayName}
                onUploadComplete={(avatarUrl) => {
                  // Update store with new avatar URL
                  setUser({
                    id: user.id,
                    username: user.username || "",
                    displayName: user.displayName,
                    email: user.email,
                    bio: user.bio,
                    avatarUrl,
                    accountStatus: "active",
                  });
                  // Invalidate React Query cache to trigger parent re-render
                  queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
                }}
              />
            ) : (
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={user.avatarUrl || undefined}
                  alt={user.displayName || user.username || "User"}
                />
                <AvatarFallback className="text-2xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          <div className="flex-1 space-y-2">
            {/* Username (read-only) */}
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Username
              </label>
              <p className="text-lg font-semibold">@{user.username}</p>
            </div>

            {/* Display Name */}
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Display Name
              </label>
              {isEditing ? (
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                  className="mt-1"
                />
              ) : (
                <p className="text-lg">
                  {user.displayName || <span className="text-gray-400">Not set</span>}
                </p>
              )}
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Email
              </label>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {user.email || <span className="text-gray-400">Not set</span>}
              </p>
            </div>

            {/* Bio */}
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Bio
              </label>
              {isEditing ? (
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself"
                  className="mt-1"
                  rows={3}
                />
              ) : (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {user.bio || <span className="text-gray-400">Not set</span>}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end items-center gap-2">
          {isEditing ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={mutation.isPending}
              >
                Cancelar <X className="h-4 w-4 ml-1.5" />
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>Guardar <Check className="h-4 w-4 ml-1.5" /></>
                )}
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              Editar <Pencil className="h-4 w-4 ml-1.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
