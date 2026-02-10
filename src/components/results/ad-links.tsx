import { Badge } from "@/components/ui/badge";

interface AdLinksProps {
  links: {
    facebook?: string;
    tiktok?: string;
    google?: string;
    pinterest?: string;
    spyfu?: string;
    similarweb?: string;
  };
  niche: string;
}

const PLATFORMS: {
  key: keyof AdLinksProps["links"];
  label: string;
  color: string;
}[] = [
  { key: "facebook", label: "Facebook Ads", color: "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300" },
  { key: "tiktok", label: "TikTok Ads", color: "bg-pink-50 text-pink-700 hover:bg-pink-100 dark:bg-pink-950 dark:text-pink-300" },
  { key: "google", label: "Google Ads", color: "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300" },
  { key: "pinterest", label: "Pinterest Ads", color: "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300" },
  { key: "spyfu", label: "SpyFu", color: "bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-950 dark:text-orange-300" },
  { key: "similarweb", label: "SimilarWeb", color: "bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300" },
];

export function AdLinks({ links, niche }: AdLinksProps) {
  const available = PLATFORMS.filter((p) => links[p.key]);

  if (available.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        See what&apos;s already advertising for &ldquo;{niche}&rdquo;
      </p>
      <div className="flex flex-wrap gap-2">
        {available.map((platform) => (
          <a
            key={platform.key}
            href={links[platform.key]}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Badge
              variant="outline"
              className={`cursor-pointer transition-colors ${platform.color}`}
            >
              {platform.label} &rarr;
            </Badge>
          </a>
        ))}
      </div>
    </div>
  );
}
