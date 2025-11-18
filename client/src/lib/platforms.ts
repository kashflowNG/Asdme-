
import { SiTiktok, SiInstagram, SiSnapchat, SiWhatsapp, SiYoutube, SiX, SiThreads, SiFacebook, SiLinkedin, SiGithub, SiTwitch, SiSpotify, SiDiscord, SiTelegram, SiReddit, SiPinterest, SiMedium, SiBehance, SiDribbble, SiSubstack, SiPatreon, SiOnlyfans, SiApplemusic, SiSoundcloud } from "react-icons/si";
import { type IconType } from "react-icons";
import { Mail, Globe, MessageCircle } from "lucide-react";

export interface Platform {
  id: string;
  name: string;
  icon: IconType;
  color: string;
  placeholder: string;
  category: 'social' | 'professional' | 'creator' | 'messaging' | 'other';
}

export const PLATFORMS: Platform[] = [
  // Social Media
  {
    id: "tiktok",
    name: "TikTok",
    icon: SiTiktok,
    color: "#000000",
    placeholder: "https://tiktok.com/@username",
    category: 'social',
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: SiInstagram,
    color: "#E4405F",
    placeholder: "https://instagram.com/username",
    category: 'social',
  },
  {
    id: "snapchat",
    name: "Snapchat",
    icon: SiSnapchat,
    color: "#FFFC00",
    placeholder: "https://snapchat.com/add/username",
    category: 'social',
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: SiYoutube,
    color: "#FF0000",
    placeholder: "https://youtube.com/@username",
    category: 'social',
  },
  {
    id: "x",
    name: "X (Twitter)",
    icon: SiX,
    color: "#000000",
    placeholder: "https://x.com/username",
    category: 'social',
  },
  {
    id: "threads",
    name: "Threads",
    icon: SiThreads,
    color: "#000000",
    placeholder: "https://threads.net/@username",
    category: 'social',
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: SiFacebook,
    color: "#1877F2",
    placeholder: "https://facebook.com/username",
    category: 'social',
  },
  {
    id: "pinterest",
    name: "Pinterest",
    icon: SiPinterest,
    color: "#E60023",
    placeholder: "https://pinterest.com/username",
    category: 'social',
  },
  {
    id: "reddit",
    name: "Reddit",
    icon: SiReddit,
    color: "#FF4500",
    placeholder: "https://reddit.com/u/username",
    category: 'social',
  },
  
  // Professional
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: SiLinkedin,
    color: "#0A66C2",
    placeholder: "https://linkedin.com/in/username",
    category: 'professional',
  },
  {
    id: "github",
    name: "GitHub",
    icon: SiGithub,
    color: "#181717",
    placeholder: "https://github.com/username",
    category: 'professional',
  },
  {
    id: "medium",
    name: "Medium",
    icon: SiMedium,
    color: "#000000",
    placeholder: "https://medium.com/@username",
    category: 'professional',
  },
  {
    id: "substack",
    name: "Substack",
    icon: SiSubstack,
    color: "#FF6719",
    placeholder: "https://username.substack.com",
    category: 'professional',
  },
  
  // Creator Platforms
  {
    id: "twitch",
    name: "Twitch",
    icon: SiTwitch,
    color: "#9146FF",
    placeholder: "https://twitch.tv/username",
    category: 'creator',
  },
  {
    id: "spotify",
    name: "Spotify",
    icon: SiSpotify,
    color: "#1DB954",
    placeholder: "https://open.spotify.com/user/username",
    category: 'creator',
  },
  {
    id: "applemusic",
    name: "Apple Music",
    icon: SiApplemusic,
    color: "#FA243C",
    placeholder: "https://music.apple.com/profile/username",
    category: 'creator',
  },
  {
    id: "soundcloud",
    name: "SoundCloud",
    icon: SiSoundcloud,
    color: "#FF5500",
    placeholder: "https://soundcloud.com/username",
    category: 'creator',
  },
  {
    id: "behance",
    name: "Behance",
    icon: SiBehance,
    color: "#1769FF",
    placeholder: "https://behance.net/username",
    category: 'creator',
  },
  {
    id: "dribbble",
    name: "Dribbble",
    icon: SiDribbble,
    color: "#EA4C89",
    placeholder: "https://dribbble.com/username",
    category: 'creator',
  },
  {
    id: "patreon",
    name: "Patreon",
    icon: SiPatreon,
    color: "#FF424D",
    placeholder: "https://patreon.com/username",
    category: 'creator',
  },
  {
    id: "onlyfans",
    name: "OnlyFans",
    icon: SiOnlyfans,
    color: "#00AFF0",
    placeholder: "https://onlyfans.com/username",
    category: 'creator',
  },
  
  // Messaging
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: SiWhatsapp,
    color: "#25D366",
    placeholder: "https://wa.me/1234567890",
    category: 'messaging',
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: SiTelegram,
    color: "#26A5E4",
    placeholder: "https://t.me/username",
    category: 'messaging',
  },
  {
    id: "discord",
    name: "Discord",
    icon: SiDiscord,
    color: "#5865F2",
    placeholder: "https://discord.gg/invite",
    category: 'messaging',
  },
  
  // Other
  {
    id: "email",
    name: "Email",
    icon: Mail,
    color: "#EA4335",
    placeholder: "mailto:your@email.com",
    category: 'other',
  },
  {
    id: "website",
    name: "Website",
    icon: Globe,
    color: "#6366F1",
    placeholder: "https://yourwebsite.com",
    category: 'other',
  },
  {
    id: "custom",
    name: "Custom Link",
    icon: MessageCircle,
    color: "#8B5CF6",
    placeholder: "https://custom-link.com",
    category: 'other',
  },
];

export function getPlatform(id: string): Platform | undefined {
  return PLATFORMS.find((p) => p.id === id);
}

export function getPlatformsByCategory(category: Platform['category']): Platform[] {
  return PLATFORMS.filter((p) => p.category === category);
}

export const PLATFORM_CATEGORIES = [
  { id: 'social', label: 'Social Media', icon: '📱' },
  { id: 'professional', label: 'Professional', icon: '💼' },
  { id: 'creator', label: 'Creator', icon: '🎨' },
  { id: 'messaging', label: 'Messaging', icon: '💬' },
  { id: 'other', label: 'Other', icon: '🔗' },
] as const;
