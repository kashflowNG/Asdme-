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
      data-testid={`link-${platform.name.toLowerCase()}`}
      className="group relative flex items-center justify-between w-full h-16 px-6 rounded-xl bg-card/50 backdrop-blur-sm border-2 border-card-border hover:border-primary/40 shadow-lg hover:shadow-xl transition-all active:scale-[0.98] overflow-hidden glass-card"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Content */}
      <div className="relative flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon className="w-6 h-6 flex-shrink-0" style={{ color: platform.color }} />
        </div>
        <span className="font-semibold text-base">{platform.name}</span>
      </div>

      {/* Arrow indicator */}
      <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-cyan-500/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
        <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </a>
  );
}