import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  Search,
  PlusCircle,
  Download,
  Megaphone,
} from "lucide-react";

interface AdLinksMap {
  facebook?: string;
  tiktok?: string;
  google?: string;
  pinterest?: string;
  spyfu?: string;
  similarweb?: string;
}

interface NextStepsProps {
  adLinks: AdLinksMap;
  niche: string;
  topKeyword?: string;
}

const AD_PLATFORMS: {
  key: keyof AdLinksMap;
  label: string;
  description: string;
  color: string;
}[] = [
  {
    key: "facebook",
    label: "Facebook Ads",
    description: "See active ads and creatives",
    color: "hover:border-blue-300 dark:hover:border-blue-700",
  },
  {
    key: "tiktok",
    label: "TikTok Ads",
    description: "Discover trending ad formats",
    color: "hover:border-pink-300 dark:hover:border-pink-700",
  },
  {
    key: "google",
    label: "Google Ads",
    description: "Check advertiser transparency",
    color: "hover:border-green-300 dark:hover:border-green-700",
  },
  {
    key: "pinterest",
    label: "Pinterest Ads",
    description: "Browse promoted pins",
    color: "hover:border-red-300 dark:hover:border-red-700",
  },
  {
    key: "spyfu",
    label: "SpyFu",
    description: "Competitor keyword research",
    color: "hover:border-orange-300 dark:hover:border-orange-700",
  },
  {
    key: "similarweb",
    label: "SimilarWeb",
    description: "Traffic and audience analysis",
    color: "hover:border-purple-300 dark:hover:border-purple-700",
  },
];

export function NextSteps({ adLinks, niche, topKeyword }: NextStepsProps) {
  const availablePlatforms = AD_PLATFORMS.filter((p) => adLinks[p.key]);
  const suggestedKeyword = topKeyword ?? niche;

  return (
    <Card className="gap-0 py-0 overflow-hidden">
      <CardHeader className="py-4">
        <CardTitle className="text-sm sm:text-base">
          What to do next
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-5 space-y-5">
        {/* Check ad libraries */}
        {availablePlatforms.length > 0 && (
          <div className="space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Megaphone className="size-3" />
              Check ad libraries
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {availablePlatforms.map((platform) => (
                <a
                  key={platform.key}
                  href={adLinks[platform.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors ${platform.color}`}
                >
                  <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug">
                      {platform.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {platform.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard?q=${encodeURIComponent(suggestedKeyword)}`}>
              <Search className="size-3.5" />
              Research deeper
            </Link>
          </Button>

          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <PlusCircle className="size-3.5" />
              Start another search
            </Link>
          </Button>

          <Button variant="outline" size="sm" disabled>
            <Download className="size-3.5" />
            Export results
            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
              Soon
            </Badge>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
