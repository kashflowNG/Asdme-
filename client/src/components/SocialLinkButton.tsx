import { getPlatform } from "@/lib/platforms";
import { ExternalLink, Link2 } from "lucide-react";

interface SocialLinkButtonProps {
  platformId: string;
  url: string;
  customTitle?: string | null;
  onClick?: () => void;
}

export function SocialLinkButton({ platformId, url, customTitle, onClick }: SocialLinkButtonProps) {
  const platform = getPlatform(platformId);

  // Handle custom links or unknown platforms
  if (!platform || platformId === 'custom') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className="group relative block w-full h-16 px-6 rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-card to-card/80 border-2 border-border hover:border-primary/50 shadow-lg hover:shadow-xl"
        data-testid={`social-link-custom`}
      >
        <div className="relative z-10 flex items-center gap-4 h-full">
          {/* Custom link icon */}
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
            <Link2 className="w-6 h-6 text-primary" />
          </div>

          {/* Custom title or URL */}
          <div className="relative z-10 flex-1">
            <p className="text-sm font-semibold group-hover:text-primary transition-colors duration-300">
              {customTitle || "Custom Link"}
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

  const Icon = platform.icon;
  const displayName = customTitle || platform.name;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className="group relative block w-full h-16 px-6 rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-card to-card/80 border-2 border-border hover:border-primary/50 shadow-lg hover:shadow-xl"
      data-testid={`social-link-${platformId}`}
    >
      {/* Animated gradient background on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${platform.color}15, ${platform.color}05)`,
        }}
      />

      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 flex items-center gap-4 h-full">
        {/* Platform icon with color */}
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          style={{
            backgroundColor: `${platform.color}20`,
          }}
        >
          <Icon className="w-6 h-6" style={{ color: platform.color }} />
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