import { getPlatform } from "@/lib/platforms";
import { ExternalLink, Link2 } from "lucide-react";

interface SocialLinkButtonProps {
  platform: string;
  url: string;
  customTitle?: string;
}

export function SocialLinkButton({ platform, url, customTitle }: SocialLinkButtonProps) {
  const platformData = getPlatform(platform);

  // Handle custom links that don't match any platform
  const isCustom = !platformData || platform === 'custom';
  const Icon = platformData?.icon || Link2;
  const displayName = customTitle || platformData?.name || 'Custom Link';
  const iconColor = platformData?.color || '#8B5CF6';

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block w-full overflow-hidden"
      data-testid={`link-${platform}`}
    >
      <div className="relative flex items-center gap-4 h-16 px-6 rounded-xl bg-card border-2 border-card-border hover:border-primary/50 shadow-sm hover:shadow-xl transition-all duration-300 hover-elevate active-elevate-2">
        {/* Animated background gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-cyan-500/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Platform icon with subtle glow */}
        <div className="relative z-10 w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-6 h-6" style={{ color: iconColor }} />
        </div>

        {/* Platform name */}
        <div className="relative z-10 flex-1">
          <p className="text-sm font-semibold group-hover:text-primary transition-colors duration-300">
            {displayName}
          </p>
        </div>

        {/* External link indicator */}
        <div className="relative z-10 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
          <ExternalLink className="w-5 h-5" />
        </div>
      </div>
    </a>
  );
}