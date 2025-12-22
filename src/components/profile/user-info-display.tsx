"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, User, AtSign } from "lucide-react";

interface UserInfoDisplayProps {
  username: string;
  displayName: string | null;
  email: string | null;
  bio: string | null;
  avatarUrl: string | null;
}

/**
 * UserInfoDisplay - Read-only display of user identity information
 * Shows avatar, username, email, and bio from User table
 * Displayed at top of profile creation form
 */
export function UserInfoDisplay({
  username,
  displayName,
  email,
  bio,
  avatarUrl,
}: UserInfoDisplayProps) {
  const initials = (displayName || username)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card>
      <CardContent className="space-y-4 flex flex-col">
        <div className="flex flex-col md:flex-row gap-4 md:items-center lg:gap-6 xl:gap-8">
          {/* Avatar and Username */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatarUrl || undefined} alt={username} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2 h-full">
              <div>
                <p className="text-xs text-muted-foreground">Username</p>
                <p className="font-medium">{username}</p>
              </div>
            </div>
          </div>

          {/* Display Name */}
          {displayName && (
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Nombre</p>
                <p className="font-medium">{displayName}</p>
              </div>
            </div>
          )}

          {/* Email */}
          {email && (
            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{email}</p>
              </div>
            </div>
          )}
        </div>
        {/* Bio */}
        {bio && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-1">Bio</p>
            <p className="text-sm">{bio}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
