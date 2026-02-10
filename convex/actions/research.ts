"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";

// --- Types ---

interface ScrapedUrl {
  url: string;
  title: string;
  description: string;
  source: "reddit" | "trustpilot" | "amazon" | "forum";
}

interface CleanedContent {
  url: string;
  title: string;
  content: string;
  source: string;
}

interface PainPoint {
  title: string;
  description: string;
  frequency: number;
  sentiment: "negative" | "neutral" | "mixed";
  quotes: { text: string; source: string; url?: string }[];
  keywords: string[];
}

interface KeywordData {
  keyword: string;
  volume: number;
  competition: number;
}

// --- BrightData Scraping ---

async function scrapeWithBrightData(niche: string): Promise<ScrapedUrl[]> {
  const apiToken = process.env.BRIGHTDATA_API_TOKEN;
  if (!apiToken) throw new Error("Missing BRIGHTDATA_API_TOKEN");

  const queries = [
    `site:reddit.com "${niche}" complaints OR problems OR issues OR hate OR frustrated`,
    `site:reddit.com "${niche}" wish OR "looking for" OR "need a" OR "anyone know"`,
    `site:trustpilot.com "${niche}" review`,
    `site:amazon.com "${niche}" review "1 star" OR "2 star" OR "disappointed"`,
  ];

  const results: ScrapedUrl[] = [];

  for (const query of queries) {
    try {
      const response = await fetch("https://api.brightdata.com/serp/req", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
          query,
          search_engine: "google",
          country: "us",
          num: 15,
        }),
      });

      if (!response.ok) continue;

      const data = await response.json();
      const organic = (data.organic as Array<{ link: string; title: string; description?: string }>) ?? [];

      const source = query.includes("reddit")
        ? "reddit"
        : query.includes("trustpilot")
          ? "trustpilot"
          : "amazon";

      for (const result of organic) {
        results.push({
          url: result.link,
          title: result.title,
          description: result.description ?? "",
          source: source as ScrapedUrl["source"],
        });
      }
    } catch {
      continue;
    }
  }

  return results;
}

// --- Jina.ai Content Extraction ---

async function extractWithJina(urls: string[]): Promise<CleanedContent[]> {
  const apiKey = process.env.JINA_API_KEY;
  if (!apiKey) throw new Error("Missing JINA_API_KEY");

  const CONCURRENCY = 5;
  const results: CleanedContent[] = [];

  // Take top 15 URLs max to balance quality vs cost
  const urlsToProcess = urls.slice(0, 15);

  for (let i = 0; i < urlsToProcess.length; i += CONCURRENCY) {
    const batch = urlsToProcess.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.allSettled(
      batch.map(async (url) => {
        const response = await fetch(`https://r.jina.ai/${url}`, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/json",
            "X-Return-Format": "text",
          },
        });

        if (!response.ok) throw new Error(`Jina failed: ${response.status}`);

        const data = await response.json();
        return {
          url,
          title: data.data?.title ?? "",
          content: data.data?.content ?? "",
          source: new URL(url).hostname,
        } as CleanedContent;
      })
    );

    for (const result of batchResults) {
      if (result.status === "fulfilled" && result.value.content) {
        results.push(result.value);
      }
    }
  }

  return results;
}

// --- AI Analysis (Claude Haiku) ---

async function analyzeWithAI(
  niche: string,
  content: CleanedContent[]
): Promise<PainPoint[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");

  const contentSummary = content
    .map(
      (c, i) =>
        `[Source ${i + 1}: ${c.source}]\nURL: ${c.url}\n${c.content.slice(0, 2000)}`
    )
    .join("\n\n---\n\n");

  const prompt = `You are analyzing user complaints and discussions about "${niche}" to identify pain points and product opportunities.

Here is scraped content from Reddit, review sites, and forums:

${contentSummary}

Analyze this content and identify the top pain points. For each pain point:
1. Give it a clear, concise title
2. Write a brief description of the problem
3. Rate its frequency (1-10, how often it comes up)
4. Classify sentiment: "negative", "neutral", or "mixed"
5. Extract 2-3 direct quotes from the content that illustrate the pain point
6. List relevant keywords for search volume research

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "painPoints": [
    {
      "title": "string",
      "description": "string",
      "frequency": number,
      "sentiment": "negative" | "neutral" | "mixed",
      "quotes": [{"text": "string", "source": "string", "url": "string"}],
      "keywords": ["string"]
    }
  ]
}

Return the top 5-10 most significant pain points, ordered by frequency (highest first).`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  let jsonString = (data.content[0].text as string).trim();

  // Handle potential markdown wrapping
  if (jsonString.startsWith("```")) {
    jsonString = jsonString
      .replace(/^```(?:json)?\n?/, "")
      .replace(/\n?```$/, "");
  }

  const parsed = JSON.parse(jsonString) as { painPoints: PainPoint[] };
  return parsed.painPoints;
}

// --- SerpAPI Search Volume ---

function estimateVolume(totalResults: number): number {
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
  let score = 0;
  score += Math.min(adsCount * 15, 45);
  if (data.shopping_results) score += 20;
  if (data.answer_box) score += 15;
  if (data.knowledge_graph) score += 10;
  const relatedCount =
    (data.related_searches as Array<unknown>)?.length ?? 0;
  score += Math.min(relatedCount * 2, 10);
  return Math.min(score, 100);
}

async function getSearchVolume(keywords: string[]): Promise<KeywordData[]> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    // SerpAPI is optional - return empty if not configured
    return [];
  }

  const results: KeywordData[] = [];

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
      const totalResults = data.search_information?.total_results ?? 0;
      const ads = data.ads?.length ?? 0;

      results.push({
        keyword,
        volume: estimateVolume(totalResults),
        competition: estimateCompetition(ads, data),
      });
    } catch {
      continue;
    }
  }

  return results;
}

// --- Ad Library Links ---

function generateAdLibraryLinks(niche: string) {
  const encoded = encodeURIComponent(niche);
  return {
    facebook: `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&q=${encoded}`,
    tiktok: `https://library.tiktok.com/ads?region=all&keyword=${encoded}`,
    google: `https://adstransparency.google.com/?query=${encoded}`,
    pinterest: `https://ads.pinterest.com/advertiser/ads/?query=${encoded}`,
  };
}

// --- Main Research Action ---

export const run = action({
  args: {
    queryId: v.id("queries"),
    niche: v.string(),
  },
  handler: async (ctx, args) => {
    const { queryId, niche } = args;

    try {
      // Step 1: Scraping
      await ctx.runMutation(internal.queries.internalUpdateStatus, {
        queryId,
        status: "scraping",
      });

      const scrapedUrls = await scrapeWithBrightData(niche);

      if (scrapedUrls.length === 0) {
        await ctx.runMutation(internal.queries.internalUpdateStatus, {
          queryId,
          status: "failed",
        });
        return { success: false, error: "No results found for this niche" };
      }

      // Step 2: Content extraction with Jina.ai
      await ctx.runMutation(internal.queries.internalUpdateStatus, {
        queryId,
        status: "analyzing",
      });

      const urls = scrapedUrls.map((s) => s.url);
      const cleanedContent = await extractWithJina(urls);

      if (cleanedContent.length === 0) {
        await ctx.runMutation(internal.queries.internalUpdateStatus, {
          queryId,
          status: "failed",
        });
        return { success: false, error: "Failed to extract content" };
      }

      // Step 3: AI Analysis
      const painPoints = await analyzeWithAI(niche, cleanedContent);

      // Step 4: Search Volume
      await ctx.runMutation(internal.queries.internalUpdateStatus, {
        queryId,
        status: "fetching_volume",
      });

      // Collect unique keywords from all pain points
      const allKeywords = [
        ...new Set(painPoints.flatMap((pp) => pp.keywords)),
      ];
      const searchVolume = await getSearchVolume(allKeywords);

      // Step 5: Generate ad library links
      const adLinks = generateAdLibraryLinks(niche);

      // Step 6: Save results
      await ctx.runMutation(internal.results.save, {
        queryId,
        painPoints,
        searchVolume: searchVolume.length > 0 ? searchVolume : undefined,
        adLinks,
      });

      // Step 7: Mark as done
      await ctx.runMutation(internal.queries.internalUpdateStatus, {
        queryId,
        status: "done",
      });

      return { success: true };
    } catch (error) {
      // Mark as failed on any unhandled error
      await ctx.runMutation(internal.queries.internalUpdateStatus, {
        queryId,
        status: "failed",
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
