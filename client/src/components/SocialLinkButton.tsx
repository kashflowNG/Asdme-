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
      className="group flex items-center gap-4 w-full h-16 px-5 rounded-2xl bg-card border-2 border-card-border hover:border-primary/50 hover-elevate active-elevate-2 transition-all active:scale-[0.98] hover:shadow-xl"
      data-testid={`link-${platform}`}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
        <Icon className="w-6 h-6 flex-shrink-0" style={{ color: platformData.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-base font-semibold block">{platformData.name}</span>
        <span className="text-xs text-muted-foreground truncate block">{url}</span>
      </div>
      <ExternalLink className="w-5 h-5 text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors" />
    </a>
  );
}
