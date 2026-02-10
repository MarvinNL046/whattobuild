interface KeywordData {
  keyword: string;
  volume: number;
  competition: number;
}

export async function getSearchVolume(
  keywords: string[]
): Promise<KeywordData[]> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) throw new Error("Missing SERPAPI_KEY");

  const results: KeywordData[] = [];

  // Process keywords in batches to respect rate limits
  for (const keyword of keywords.slice(0, 20)) {
    try {
      const params = new URLSearchParams({
        api_key: apiKey,
        engine: "google",
        q: keyword,
        gl: "us",
      });

      const response = await fetch(
        `https://serpapi.com/search.json?${params.toString()}`
      );

      if (!response.ok) continue;

      const data = await response.json();

      // Extract search metadata for volume estimation
      const totalResults = data.search_information?.total_results ?? 0;
      const ads = data.ads?.length ?? 0;

      // Estimate volume and competition from SERP signals
      const volume = estimateVolume(totalResults);
      const competition = estimateCompetition(ads, data);

      results.push({ keyword, volume, competition });
    } catch {
      // Skip failed keywords
      continue;
    }
  }

  return results;
}

function estimateVolume(totalResults: number): number {
  // Rough estimation based on total search results
  if (totalResults > 1_000_000_000) return 100000;
  if (totalResults > 100_000_000) return 50000;
  if (totalResults > 10_000_000) return 10000;
  if (totalResults > 1_000_000) return 5000;
  if (totalResults > 100_000) return 1000;
  if (totalResults > 10_000) return 500;
  return 100;
}

function estimateCompetition(
  adsCount: number,
  data: Record<string, unknown>
): number {
  // Competition score 0-100 based on SERP signals
  let score = 0;

  // More ads = more competition
  score += Math.min(adsCount * 15, 45);

  // Shopping results indicate commercial intent
  if (data.shopping_results) score += 20;

  // Featured snippets indicate established content
  if (data.answer_box) score += 15;

  // Knowledge graph indicates well-known topic
  if (data.knowledge_graph) score += 10;

  // Related searches indicate search diversity
  const relatedCount =
    (data.related_searches as Array<unknown>)?.length ?? 0;
  score += Math.min(relatedCount * 2, 10);

  return Math.min(score, 100);
}

export function generateAdLibraryLinks(niche: string) {
  const encoded = encodeURIComponent(niche);
  return {
    facebook: `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&q=${encoded}`,
    tiktok: `https://library.tiktok.com/ads?region=all&keyword=${encoded}`,
    google: `https://adstransparency.google.com/?query=${encoded}`,
    pinterest: `https://ads.pinterest.com/advertiser/ads/?query=${encoded}`,
  };
}

export type { KeywordData };
