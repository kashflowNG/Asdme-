
import { getPlatform } from "@/lib/platforms";
import { ExternalLink } from "lucide-react";

interface SocialLinkButtonProps {
  platform: string;
  url: string;
}

export function SocialLinkButton({ platform: platformName, url }: SocialLinkButtonProps) {
  const platform = getPlatform(platformName);
  
  // If platform is not found, return null or a fallback
  if (!platform) {
    console.warn(`Platform "${platformName}" not found`);
    return null;
  }

  const Icon = platform.icon;
  const formattedName = platform.name.toLowerCase();

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        relative group block w-full h-14 rounded-xl
        overflow-hidden transition-all duration-300
        hover:scale-[1.02] active:scale-[0.98]
        neon-glow glass-card
        border-2 border-${formattedName}/30
        hover:border-${formattedName}/60
      `}
      style={{
        background: `linear-gradient(135deg, var(--${formattedName}-start) 0%, var(--${formattedName}-end) 100%)`,
      }}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      <div className="relative h-full px-6 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 flex-shrink-0">
            <Icon className="w-full h-full drop-shadow-lg" />
          </div>
          <span className="font-medium text-sm drop-shadow-md">
            {platform.name}
          </span>
        </div>
        <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
      </div>
    </a>
  );
}
