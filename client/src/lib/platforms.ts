import { SiTiktok, SiInstagram, SiSnapchat, SiWhatsapp, SiYoutube, SiX, SiThreads, SiFacebook, SiLinkedin, SiGithub, SiTwitch, SiSpotify } from "react-icons/si";
import { type IconType } from "react-icons";

export interface Platform {
  id: string;
  name: string;
  icon: IconType;
  color: string;
  placeholder: string;
}

export const PLATFORMS: Platform[] = [
  {
    id: "tiktok",
    name: "TikTok",
    icon: SiTiktok,
    color: "#000000",
    placeholder: "https://tiktok.com/@username",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: SiInstagram,
    color: "#E4405F",
    placeholder: "https://instagram.com/username",
  },
  {
    id: "snapchat",
    name: "Snapchat",
    icon: SiSnapchat,
    color: "#FFFC00",
    placeholder: "https://snapchat.com/add/username",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: SiWhatsapp,
    color: "#25D366",
    placeholder: "https://wa.me/1234567890",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: SiYoutube,
    color: "#FF0000",
    placeholder: "https://youtube.com/@username",
  },
  {
    id: "x",
    name: "X",
    icon: SiX,
    color: "#000000",
    placeholder: "https://x.com/username",
  },
  {
    id: "threads",
    name: "Threads",
    icon: SiThreads,
    color: "#000000",
    placeholder: "https://threads.net/@username",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: SiFacebook,
    color: "#1877F2",
    placeholder: "https://facebook.com/username",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: SiLinkedin,
    color: "#0A66C2",
    placeholder: "https://linkedin.com/in/username",
  },
  {
    id: "github",
    name: "GitHub",
    icon: SiGithub,
    color: "#181717",
    placeholder: "https://github.com/username",
  },
  {
    id: "twitch",
    name: "Twitch",
    icon: SiTwitch,
    color: "#9146FF",
    placeholder: "https://twitch.tv/username",
  },
  {
    id: "spotify",
    name: "Spotify",
    icon: SiSpotify,
    color: "#1DB954",
    placeholder: "https://open.spotify.com/user/username",
  },
];

export function getPlatform(id: string): Platform | undefined {
  return PLATFORMS.find((p) => p.id === id);
}
