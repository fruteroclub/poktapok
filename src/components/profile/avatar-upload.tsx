"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  username: string;
  displayName: string | null;
  onUploadComplete?: (newAvatarUrl: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function AvatarUpload({
  currentAvatarUrl,
  username,
  displayName,
  onUploadComplete,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get initials for fallback
  const initials = displayName
    ? displayName.charAt(0).toUpperCase()
    : username.charAt(0).toUpperCase();

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Please upload a JPEG, PNG, or WebP image");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Set selected file
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append("avatar", selectedFile);

      // Upload to API
      const response = await fetch("/api/profiles/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload avatar");
      }

      const data = await response.json();

      if (data.success && data.data.avatarUrl) {
        toast.success("Avatar uploaded successfully!");
        setPreview(data.data.avatarUrl);
        setSelectedFile(null);

        // Call callback if provided
        if (onUploadComplete) {
          onUploadComplete(data.data.avatarUrl);
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
      // Reset preview to current avatar
      setPreview(currentAvatarUrl);
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setPreview(currentAvatarUrl);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Preview */}
      <Avatar className="h-24 w-24">
        {preview ? (
          <AvatarImage src={preview} alt={displayName || username} />
        ) : null}
        <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
      </Avatar>

      {/* File Input (Hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Action Buttons */}
      <div className="flex gap-2">
        {selectedFile ? (
          // Upload/Cancel buttons when file selected
          <>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              size="sm"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={isUploading}
              variant="outline"
              size="sm"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </>
        ) : (
          // Change avatar button when no file selected
          <Button onClick={triggerFileInput} variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Change Avatar
          </Button>
        )}
      </div>

      {/* Helper Text */}
      <p className="text-xs text-muted-foreground text-center">
        JPEG, PNG, or WebP. Max 5MB.
      </p>
    </div>
  );
}
