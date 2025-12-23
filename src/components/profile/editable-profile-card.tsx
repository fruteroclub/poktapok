"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, X, Check, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/fetch";
import { Badge } from "@/components/ui/badge";
import { getCountryFlag } from "@/lib/utils/country-flags";
import { COUNTRIES } from "@/data/countries";
import { getCitiesByCountry } from "@/data/cities";
import { useAuthStore } from "@/store/auth-store";
import type { Profile } from "@/types/api-v1";

interface EditableProfileCardProps {
  className?: string;
  profile: {
    id: string;
    userId: string;
    city: string;
    country: string;
    countryCode: string;
    learningTracks: string[];
    availabilityStatus: string;
    socialLinks: {
      github?: string;
      twitter?: string;
      linkedin?: string;
      telegram?: string;
    } | null;
  } | null;
  userId: string;
}

interface ProfileData {
  city: string;
  country: string;
  countryCode: string;
  learningTrack: "ai" | "crypto" | "privacy";
  availabilityStatus: "available" | "open_to_offers" | "unavailable";
  socialLinks?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    telegram?: string;
  };
}

interface UpsertProfileResponse {
  data?: {
    profile: Profile;
  };
}

async function upsertProfile(data: ProfileData): Promise<UpsertProfileResponse> {
  return apiFetch("/api/profiles", {
    method: "POST", // POST handles both create and update via upsert
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

const LEARNING_TRACKS = [
  { value: "ai", label: "AI & Machine Learning" },
  { value: "crypto", label: "Crypto & DeFi" },
  { value: "privacy", label: "Privacy & Security" },
];

const AVAILABILITY_STATUS = [
  { value: "available", label: "Available", color: "bg-green-500" },
  { value: "open_to_offers", label: "Open to Offers", color: "bg-yellow-500" },
  { value: "unavailable", label: "Unavailable", color: "bg-gray-400" },
];

export function EditableProfileCard({ className, profile }: EditableProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    city: profile?.city || "",
    country: profile?.country || "",
    countryCode: profile?.countryCode || "",
    learningTrack: (profile?.learningTracks?.[0] as "ai" | "crypto" | "privacy") || "ai",
    availabilityStatus: (profile?.availabilityStatus as "available" | "open_to_offers" | "unavailable") || "available",
    github: profile?.socialLinks?.github || "",
    twitter: profile?.socialLinks?.twitter || "",
    linkedin: profile?.socialLinks?.linkedin || "",
    telegram: profile?.socialLinks?.telegram || "",
  });

  const { setProfile } = useAuthStore();
  const queryClient = useQueryClient();

  // Get cities for selected country
  const cities = useMemo(
    () => getCitiesByCountry(formData.countryCode),
    [formData.countryCode]
  );

  const mutation = useMutation({
    mutationFn: upsertProfile,
    onSuccess: (response: UpsertProfileResponse) => {
      // Update store directly with response data
      if (response.data?.profile) {
        setProfile(response.data.profile);
      }
      // Invalidate React Query cache to trigger parent re-render
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success(profile ? "Profile updated successfully" : "Profile created successfully");
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || `Failed to ${profile ? "update" : "create"} profile`);
    },
  });

  const handleSave = () => {
    // Validate required fields
    if (!formData.city.trim() || !formData.country.trim() || !formData.countryCode.trim()) {
      toast.error("Please fill in all location fields");
      return;
    }

    mutation.mutate({
      city: formData.city.trim(),
      country: formData.country.trim(),
      countryCode: formData.countryCode.trim(),
      learningTrack: formData.learningTrack,
      availabilityStatus: formData.availabilityStatus,
      socialLinks: {
        github: formData.github.trim() || undefined,
        twitter: formData.twitter.trim() || undefined,
        linkedin: formData.linkedin.trim() || undefined,
        telegram: formData.telegram.trim() || undefined,
      },
    });
  };

  const handleCancel = () => {
    setFormData({
      city: profile?.city || "",
      country: profile?.country || "",
      countryCode: profile?.countryCode || "",
      learningTrack: (profile?.learningTracks?.[0] as "ai" | "crypto" | "privacy") || "ai",
      availabilityStatus: (profile?.availabilityStatus as "available" | "open_to_offers" | "unavailable") || "available",
      github: profile?.socialLinks?.github || "",
      twitter: profile?.socialLinks?.twitter || "",
      linkedin: profile?.socialLinks?.linkedin || "",
      telegram: profile?.socialLinks?.telegram || "",
    });
    setIsEditing(false);
  };

  const currentAvailability = AVAILABILITY_STATUS.find(
    (s) => s.value === (profile?.availabilityStatus || "available")
  );

  const currentLearningTrack = LEARNING_TRACKS.find(
    (t) => t.value === profile?.learningTracks?.[0]
  );

  return (
    <Card className={className}>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {/* Location */}
            <h3 className="font-semibold text-lg mb-4">Location & Learning</h3>
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label>Country</Label>
                    <Select
                      value={formData.countryCode}
                      onValueChange={(value) => {
                        const country = COUNTRIES.find((c) => c.code === value);
                        setFormData({
                          ...formData,
                          countryCode: value,
                          country: country?.name || "",
                          city: "", // Reset city when country changes
                        });
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.flag} {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>City</Label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) =>
                        setFormData({ ...formData, city: value })
                      }
                      disabled={!formData.countryCode}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Learning Track</Label>
                    <Select
                      value={formData.learningTrack}
                      onValueChange={(value: "ai" | "crypto" | "privacy") =>
                        setFormData({ ...formData, learningTrack: value })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEARNING_TRACKS.map((track) => (
                          <SelectItem key={track.value} value={track.value}>
                            {track.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Availability</Label>
                    <Select
                      value={formData.availabilityStatus}
                      onValueChange={(value: "available" | "open_to_offers" | "unavailable") =>
                        setFormData({ ...formData, availabilityStatus: value })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABILITY_STATUS.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${status.color}`} />
                              {status.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Location
                    </Label>
                    <p className="text-sm">
                      {profile?.city && profile?.country ? (
                        <>
                          {profile.city}, {profile.country}{" "}
                          {profile.countryCode && getCountryFlag(profile.countryCode)}
                        </>
                      ) : (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Learning Track
                    </Label>
                    <div className="mt-1">
                      {currentLearningTrack ? (
                        <Badge variant="secondary">{currentLearningTrack.label}</Badge>
                      ) : (
                        <span className="text-sm text-gray-400">Not set</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Availability
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      {currentAvailability && (
                        <>
                          <span className={`h-2 w-2 rounded-full ${currentAvailability.color}`} />
                          <span className="text-sm">{currentAvailability.label}</span>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Social Links</h3>
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label>GitHub</Label>
                    <Input
                      value={formData.github}
                      onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                      placeholder="username"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Twitter/X</Label>
                    <Input
                      value={formData.twitter}
                      onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                      placeholder="username"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>LinkedIn</Label>
                    <Input
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      placeholder="username"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Telegram</Label>
                    <Input
                      value={formData.telegram}
                      onChange={(e) =>
                        setFormData({ ...formData, telegram: e.target.value })
                      }
                      placeholder="username"
                      className="mt-1"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  {profile?.socialLinks?.github && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium w-24">GitHub:</span>
                      <span className="text-sm">{profile.socialLinks.github}</span>
                    </div>
                  )}
                  {profile?.socialLinks?.twitter && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium w-24">Twitter:</span>
                      <span className="text-sm">{profile.socialLinks.twitter}</span>
                    </div>
                  )}
                  {profile?.socialLinks?.linkedin && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium w-24">LinkedIn:</span>
                      <span className="text-sm">{profile.socialLinks.linkedin}</span>
                    </div>
                  )}
                  {profile?.socialLinks?.telegram && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium w-24">Telegram:</span>
                      <span className="text-sm">{profile.socialLinks.telegram}</span>
                    </div>
                  )}
                  {(!profile?.socialLinks ||
                    (!profile.socialLinks.github &&
                      !profile.socialLinks.twitter &&
                      !profile.socialLinks.linkedin &&
                      !profile.socialLinks.telegram)) && (
                      <span className="text-sm text-gray-400">No social links added</span>
                    )}
                </div>
              )}
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
