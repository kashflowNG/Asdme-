import { getPlatform } from "@/lib/platforms";
import { ExternalLink } from "lucide-react";

interface SocialLinkButtonProps {
  platform: string;
  url: string;
}

export function SocialLinkButton({ platform, url }: SocialLinkButtonProps) {
  const platformData = getPlatform(platform);
  
  if (!platformData) {
    return null;
  }

  const Icon = platformData.icon;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 w-full h-14 px-4 rounded-xl bg-card border border-card-border hover-elevate active-elevate-2 transition-transform active:scale-95"
      data-testid={`link-${platform}`}
    >
      <Icon className="w-6 h-6 flex-shrink-0" style={{ color: platformData.color }} />
      <span className="text-sm font-medium flex-1">{platformData.name}</span>
      <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
    </a>
  );
}
