import { useQuery } from "@tanstack/react-query";

export interface SiteSettings {
  tord_contract?: string;
  staking_contract?: string;
  twitter_url?: string;
  telegram_url?: string;
  github_url?: string;
  discord_url?: string;
  website_url?: string;
}

export function useSiteSettings() {
  return useQuery<SiteSettings>({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings/public");
      if (!res.ok) return {};
      const data = await res.json();
      return data.settings || {};
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
}
