"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProfileFormData } from "@/lib/validators/profile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Github, Twitter, Linkedin, Send, Cpu, Wallet, Lock } from "lucide-react";

interface ProfilePreviewModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: ProfileFormData;
  userInfo: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  isSubmitting: boolean;
}

const LEARNING_TRACK_LABELS = {
  ai: { label: "AI", icon: Cpu },
  crypto: { label: "Crypto/DeFi", icon: Wallet },
  privacy: { label: "Privacy", icon: Lock },
};

const AVAILABILITY_LABELS = {
  available: "Learning",
  open_to_offers: "Building",
  unavailable: "Open to Bounties",
};

/**
 * ProfilePreviewModal - Shows profile preview before submission
 * - Displays how profile will appear in directory
 * - Edit or Confirm buttons
 * - Shows all collected data
 */
export function ProfilePreviewModal({
  open,
  onClose,
  onConfirm,
  data,
  userInfo,
  isSubmitting,
}: ProfilePreviewModalProps) {
  const initials = (userInfo.displayName || userInfo.username)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const learningTrack = data.learningTrack
    ? LEARNING_TRACK_LABELS[data.learningTrack]
    : null;
  const LearningIcon = learningTrack?.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vista Previa del Perfil</DialogTitle>
          <DialogDescription>
            Así es como se verá tu perfil en el directorio de talento
          </DialogDescription>
        </DialogHeader>

        <div className="border rounded-lg p-6 space-y-4 ">
          {/* Avatar and Basic Info */}
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={userInfo.avatarUrl || undefined} />
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-2xl font-bold">
                {userInfo.displayName || userInfo.username}
              </h3>
              <p className="text-muted-foreground">@{userInfo.username}</p>
              {data.city && data.country && (
                <p className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                  <MapPin className="h-4 w-4" />
                  {data.city}, {data.country}
                </p>
              )}
            </div>
          </div>

          {/* Learning Track & Availability */}
          <div className="flex flex-wrap gap-2 pt-2">
            {learningTrack && LearningIcon && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                <LearningIcon className="h-4 w-4" />
                {learningTrack.label}
              </span>
            )}
            {data.availabilityStatus && (
              <span className="inline-flex items-center rounded-full bg-green-500/10 px-3 py-1.5 text-sm font-medium text-green-700">
                {AVAILABILITY_LABELS[data.availabilityStatus]}
              </span>
            )}
          </div>

          {/* Social Links */}
          {(data.socialLinks?.github ||
            data.socialLinks?.twitter ||
            data.socialLinks?.linkedin ||
            data.socialLinks?.telegram) && (
              <div className="pt-3 border-t">
                <p className="text-sm font-medium mb-2">Redes Sociales</p>
                <div className="flex flex-wrap gap-3">
                  {data.socialLinks.github && (
                    <a
                      href={`https://github.com/${data.socialLinks.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                  )}
                  {data.socialLinks.twitter && (
                    <a
                      href={`https://twitter.com/${data.socialLinks.twitter.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
                    >
                      <Twitter className="h-4 w-4" />
                      Twitter
                    </a>
                  )}
                  {data.socialLinks.linkedin && (
                    <a
                      href={`https://linkedin.com/in/${data.socialLinks.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  )}
                  {data.socialLinks.telegram && (
                    <a
                      href={`https://t.me/${data.socialLinks.telegram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
                    >
                      <Send className="h-4 w-4" />
                      Telegram
                    </a>
                  )}
                </div>
              </div>
            )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none"
          >
            Editar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none"
          >
            {isSubmitting ? "Creando..." : "Confirmar y Crear Perfil"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
