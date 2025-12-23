import { Github, Twitter, Linkedin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildSocialUrl } from "@/lib/utils/social-urls";

interface SocialLinksProps {
  githubUrl: string | null;
  twitterUrl: string | null;
  linkedinUrl: string | null;
  telegramHandle: string | null;
}

const socialPlatforms = [
  { key: "github", label: "GitHub", icon: Github, urlKey: "githubUrl" },
  { key: "twitter", label: "Twitter", icon: Twitter, urlKey: "twitterUrl" },
  { key: "linkedin", label: "LinkedIn", icon: Linkedin, urlKey: "linkedinUrl" },
  {
    key: "telegram",
    label: "Telegram",
    icon: Send,
    urlKey: "telegramHandle",
  },
] as const;

export function SocialLinks({
  githubUrl,
  twitterUrl,
  linkedinUrl,
  telegramHandle,
}: SocialLinksProps) {
  const links = {
    githubUrl,
    twitterUrl,
    linkedinUrl,
    telegramHandle,
  };

  // Filter out empty links
  const activePlatforms = socialPlatforms.filter((platform) => {
    const value = links[platform.urlKey];
    return value && value.trim().length > 0;
  });

  // Don't render if no social links
  if (activePlatforms.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Social Links</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {activePlatforms.map((platform) => {
          const Icon = platform.icon;
          const value = links[platform.urlKey];

          // Build full URL
          let url: string;
          if (platform.key === "telegram") {
            // Telegram uses handle, not full URL
            url = buildSocialUrl("telegram", value || "");
          } else {
            // GitHub, Twitter, LinkedIn use full URLs
            url = value || "";
          }

          // Extract display text (handle or username)
          let displayText: string;
          try {
            if (platform.key === "telegram") {
              displayText = `@${value}`;
            } else {
              const urlObj = new URL(url);
              displayText = urlObj.pathname.replace(/^\//, "");
            }
          } catch {
            displayText = value || "";
          }

          return (
            <Button
              key={platform.key}
              variant="ghost"
              className="w-full justify-start"
              asChild
            >
              <a href={url} target="_blank" rel="noopener noreferrer">
                <Icon className="h-4 w-4 mr-2" />
                {displayText}
              </a>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
