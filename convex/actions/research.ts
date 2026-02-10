"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";

// --- Types ---

interface ScrapedUrl {
  url: string;
  title: string;
  description: string;
  source: "reddit" | "trustpilot" | "amazon" | "forum" | "quora" | "hackernews" | "producthunt";
}

interface CleanedContent {
  url: string;
  title: string;
  content: string;
  source: string;
}

interface Solution {
  title: string;
  description: string;
  type: "saas" | "ecommerce" | "service" | "content";
  difficulty: "easy" | "medium" | "hard";
  monetization: string;
}

interface PainPoint {
  title: string;
  description: string;
  frequency: number;
  confidence: number;
  evidenceCount: number;
  sentiment: "negative" | "neutral" | "mixed";
  quotes: { text: string; source: string; url?: string }[];
  keywords: string[];
  solutions?: Solution[];
  opportunityScore?: number;
}

interface KeywordData {
  keyword: string;
  volume: number;
  competition: number;
}

interface BrightDataResponse {
  status_code: number;
  body: string;
  error?: string;
}

interface SerpBody {
  general?: { results_cnt?: number };
  organic?: { link: string; title: string; description?: string; rank: number }[];
  ads?: { link: string; title: string }[];
  shopping_results?: unknown[];
  answer_box?: unknown;
  knowledge_graph?: unknown;
  related?: { text: string }[];
}

// --- BrightData Web Unlocker SERP ---

async function searchGoogle(query: string, num = 15): Promise<SerpBody> {
  const apiToken = process.env.BRIGHTDATA_API_TOKEN;
  if (!apiToken) throw new Error("Missing BRIGHTDATA_API_TOKEN");
  const zone = process.env.BRIGHTDATA_ZONE ?? "whattobuild";

  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=${num}`;

  const response = await fetch("https://api.brightdata.com/request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify({ zone, url: searchUrl, format: "json" }),
  });

  if (!response.ok) {
    throw new Error(`BrightData error: ${response.status}`);
  }

  const data = (await response.json()) as BrightDataResponse;

  if (data.status_code !== 200 || !data.body) {
    throw new Error(`BrightData SERP error: status ${data.status_code}`);
  }

  return JSON.parse(data.body) as SerpBody;
}

function detectSource(url: string): ScrapedUrl["source"] {
  if (url.includes("reddit.com")) return "reddit";
  if (url.includes("trustpilot.com")) return "trustpilot";
  if (url.includes("amazon.com")) return "amazon";
  if (url.includes("quora.com")) return "quora";
  if (url.includes("news.ycombinator.com") || url.includes("hacker-news")) return "hackernews";
  if (url.includes("producthunt.com")) return "producthunt";
  return "forum";
}

type ResearchType = "saas" | "ecommerce" | "directory" | "website";

// Build search queries based on selected research types
// Balanced across sources: Reddit, Quora, HN, Product Hunt, review sites, forums
function buildSearchQueries(niche: string, types: ResearchType[]): string[] {
  const queries: string[] = [];

  // Base queries — balanced across sources
  queries.push(
    `site:reddit.com "${niche}" complaints OR problems OR frustrated`,
    `"${niche}" problems OR issues site:quora.com`,
    `"${niche}" complaints OR problems OR "bad experience" -site:reddit.com -site:quora.com`,
  );

  // If no specific types selected, add broad exploration queries
  if (types.length === 0) {
    queries.push(
      `"${niche}" review site:trustpilot.com`,
      `"${niche}" review OR complaint site:amazon.com`,
      `"${niche}" site:news.ycombinator.com`,
      `"${niche}" problems OR complaints site:producthunt.com`,
      `"${niche}" frustrating OR annoying OR "wish there was" site:quora.com`,
    );
  }

  for (const type of types) {
    switch (type) {
      case "saas":
        queries.push(
          `"${niche}" software alternatives OR "better than" site:reddit.com`,
          `"${niche}" site:producthunt.com`,
          `"${niche}" SaaS OR tool OR platform site:news.ycombinator.com`,
          `"${niche}" software review site:g2.com OR site:capterra.com`,
          `"${niche}" SaaS problems OR "wish it could" site:quora.com`,
          `"${niche}" software OR tool review OR complaint site:trustpilot.com`,
        );
        break;
      case "ecommerce":
        queries.push(
          `"${niche}" review "1 star" OR "2 stars" OR "disappointed" site:amazon.com`,
          `site:trustpilot.com "${niche}" review`,
          `"${niche}" product quality OR defective OR "broke after" site:amazon.com`,
          `"${niche}" dropshipping OR supplier OR wholesale site:quora.com`,
          `"${niche}" product review OR unboxing OR comparison -site:reddit.com -site:amazon.com`,
          `"${niche}" "not worth" OR "waste of money" OR "returned" site:reddit.com`,
        );
        break;
      case "directory":
        queries.push(
          `"${niche}" "hard to find" OR "where to find" OR "no good list"`,
          `"${niche}" directory OR comparison OR aggregator site:producthunt.com`,
          `"${niche}" marketplace OR listing OR "best list" site:quora.com`,
          `"${niche}" directory OR catalog OR comparison site:news.ycombinator.com`,
          `"${niche}" "there should be" OR "someone should build" site:reddit.com`,
        );
        break;
      case "website":
        queries.push(
          `"${niche}" guide OR tutorial OR course problems site:quora.com`,
          `"${niche}" blog OR content OR resource "hard to find"`,
          `"${niche}" online course OR tutorial review site:trustpilot.com`,
          `"${niche}" learning OR education site:news.ycombinator.com`,
          `"${niche}" information OR advice OR tips site:reddit.com`,
        );
        break;
    }
  }

  // Deduplicate queries
  return [...new Set(queries)];
}

async function scrapeWithBrightData(niche: string, researchTypes?: ResearchType[]): Promise<ScrapedUrl[]> {
  const types = researchTypes && researchTypes.length > 0 ? researchTypes : [];
  const queries = buildSearchQueries(niche, types);

  const results: ScrapedUrl[] = [];
  const seenUrls = new Set<string>();

  for (const query of queries) {
    try {
      const serp = await searchGoogle(query, 10);
      const organic = serp.organic ?? [];
      for (const result of organic) {
        if (seenUrls.has(result.link)) continue;
        seenUrls.add(result.link);

        results.push({
          url: result.link,
          title: result.title,
          description: result.description ?? "",
          source: detectSource(result.link),
        });
      }
    } catch {
      continue;
    }
  }

  // Limit total URLs to keep costs reasonable
  return results.slice(0, 20);
}

// --- Content Extraction ---
// Reddit: BrightData Web Unlocker + JSON API (Jina gets 403'd by Reddit)
// Other sites: Jina.ai for clean text extraction

async function extractRedditContent(url: string): Promise<CleanedContent | null> {
  const apiToken = process.env.BRIGHTDATA_API_TOKEN;
  if (!apiToken) return null;

  try {
    // Reddit JSON API: append .json to get structured data
    const jsonUrl = url.endsWith("/") ? `${url}.json` : `${url}/.json`;

    const response = await fetch("https://api.brightdata.com/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        zone: process.env.BRIGHTDATA_UNLOCKER_ZONE ?? "whatobuild2",
        url: jsonUrl,
        format: "json",
      }),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as BrightDataResponse;
    if (data.status_code !== 200 || !data.body) return null;

    const parsed = JSON.parse(data.body) as [
      { data: { children: { data: { title: string; selftext: string } }[] } },
      { data: { children: { kind: string; data: { body: string; author: string } }[] } },
    ];

    const post = parsed[0]?.data?.children?.[0]?.data;
    if (!post) return null;

    const comments = parsed[1]?.data?.children
      ?.filter((c) => c.kind === "t1")
      ?.slice(0, 15)
      ?.map((c) => `[${c.data.author}]: ${c.data.body}`)
      ?.join("\n\n") ?? "";

    const content = `${post.title}\n\n${post.selftext}\n\n--- Comments ---\n\n${comments}`;

    return {
      url,
      title: post.title,
      content: content.slice(0, 8000),
      source: "reddit.com",
    };
  } catch {
    return null;
  }
}

async function extractWithJina(url: string): Promise<CleanedContent | null> {
  const apiKey = process.env.JINA_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
        "X-Return-Format": "text",
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    const content = data.data?.content ?? "";
    if (!content) return null;

    return {
      url,
      title: data.data?.title ?? "",
      content,
      source: new URL(url).hostname,
    };
  } catch {
    return null;
  }
}

// Quora: BrightData Web Unlocker (Quora blocks most scrapers)
async function extractQuoraContent(url: string): Promise<CleanedContent | null> {
  const apiToken = process.env.BRIGHTDATA_API_TOKEN;
  if (!apiToken) return null;

  try {
    const response = await fetch("https://api.brightdata.com/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        zone: process.env.BRIGHTDATA_UNLOCKER_ZONE ?? "whatobuild2",
        url,
        format: "json",
      }),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as BrightDataResponse;
    if (data.status_code !== 200 || !data.body) return null;

    const html = data.body;
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch?.[1]?.replace(/ - Quora$/, "") ?? "";

    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!textContent || textContent.length < 100) return null;

    return {
      url,
      title,
      content: textContent.slice(0, 8000),
      source: "quora",
    };
  } catch {
    return null;
  }
}

// Hacker News: Free public Algolia API (no BrightData needed)
interface HNHit {
  objectID: string;
  title?: string;
  story_text?: string;
  url?: string;
  num_comments?: number;
}

interface HNComment {
  author?: string;
  comment_text?: string;
  children?: HNComment[];
}

async function extractHNContent(url: string): Promise<CleanedContent | null> {
  try {
    const idMatch = url.match(/id=(\d+)/);
    if (!idMatch) return null;

    const storyId = idMatch[1];
    const response = await fetch(
      `https://hn.algolia.com/api/v1/items/${storyId}`
    );

    if (!response.ok) return null;

    const data = (await response.json()) as HNHit & { children?: HNComment[] };
    const title = data.title ?? "";
    const storyText = data.story_text ?? "";

    const comments = (data.children ?? [])
      .slice(0, 15)
      .filter(
        (c): c is HNComment & { comment_text: string } => !!c.comment_text
      )
      .map((c) => {
        const text = c.comment_text
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        return `[${c.author ?? "anon"}]: ${text}`;
      })
      .join("\n\n");

    const content = `${title}\n\n${storyText}\n\n--- Comments ---\n\n${comments}`;

    if (content.length < 50) return null;

    return {
      url,
      title,
      content: content.slice(0, 8000),
      source: "hackernews",
    };
  } catch {
    return null;
  }
}

// Product Hunt: BrightData Web Unlocker (extracts product info and reviews)
async function extractProductHuntContent(
  url: string
): Promise<CleanedContent | null> {
  const apiToken = process.env.BRIGHTDATA_API_TOKEN;
  if (!apiToken) {
    return extractWithJina(url);
  }

  try {
    const response = await fetch("https://api.brightdata.com/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        zone: process.env.BRIGHTDATA_UNLOCKER_ZONE ?? "whatobuild2",
        url,
        format: "json",
      }),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as BrightDataResponse;
    if (data.status_code !== 200 || !data.body) return null;

    const html = data.body;
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch?.[1]?.replace(/ \| Product Hunt$/, "") ?? "";

    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!textContent || textContent.length < 100) return null;

    return {
      url,
      title,
      content: textContent.slice(0, 8000),
      source: "producthunt",
    };
  } catch {
    return null;
  }
}

async function extractContent(urls: string[]): Promise<CleanedContent[]> {
  const CONCURRENCY = 5;
  const results: CleanedContent[] = [];
  const urlsToProcess = urls.slice(0, 20);

  for (let i = 0; i < urlsToProcess.length; i += CONCURRENCY) {
    const batch = urlsToProcess.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.allSettled(
      batch.map(async (url) => {
        if (url.includes("reddit.com")) {
          return extractRedditContent(url);
        }
        if (url.includes("quora.com")) {
          return extractQuoraContent(url);
        }
        if (url.includes("news.ycombinator.com")) {
          return extractHNContent(url);
        }
        if (url.includes("producthunt.com")) {
          return extractProductHuntContent(url);
        }
        return extractWithJina(url);
      })
    );

    for (const result of batchResults) {
      if (result.status === "fulfilled" && result.value) {
        results.push(result.value);
      }
    }
  }

  return results;
}

// --- AI Analysis (Gemini Flash) ---

async function analyzeWithAI(
  niche: string,
  content: CleanedContent[],
  researchTypes?: ResearchType[],
): Promise<PainPoint[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const model = process.env.GEMINI_MODEL ?? "gemini-3-flash-preview";

  const contentSummary = content
    .map(
      (c, i) =>
        `[Source ${i + 1}: ${c.source}]\nURL: ${c.url}\n${c.content.slice(0, 2000)}`
    )
    .join("\n\n---\n\n");

  const typeContext = researchTypes && researchTypes.length > 0
    ? `\n\nThe user is specifically looking for ${researchTypes.join(" + ")} opportunities. Focus your solutions on these business models:\n${researchTypes.map(t => {
        switch (t) {
          case "saas": return "- SaaS: Software tools, platforms, apps, browser extensions";
          case "ecommerce": return "- E-commerce: Physical products, dropshipping, private label, DTC brands";
          case "directory": return "- Directory/Marketplace: Listing sites, comparison tools, aggregators, curated databases";
          case "website": return "- Website/Content: Blogs, courses, communities, info products, templates";
          default: return "";
        }
      }).join("\n")}`
    : "";

  const prompt = `You are analyzing user complaints and discussions about "${niche}" to identify pain points and product opportunities.${typeContext}

Here is scraped content from Reddit, Quora, Hacker News, Product Hunt, review sites, and forums:

${contentSummary}

Analyze this content and identify the top pain points. For each pain point:
1. Give it a clear, concise title
2. Write a brief description of the problem
3. Rate its frequency (1-10, how often it comes up)
4. Rate your confidence (0-100) in this pain point being a real, validated problem. Base this on: number of independent sources mentioning it, specificity of complaints, and consistency across sources. 90+ = mentioned in many sources with specific details. 50-89 = mentioned in a few sources or with less detail. Below 50 = inferred or only vaguely mentioned.
5. Count evidenceCount: the number of distinct sources (URLs/threads) from the scraped content that mention or support this pain point.
6. Classify sentiment: "negative", "neutral", or "mixed"
7. Extract 2-3 direct quotes from the content that illustrate the pain point
8. List relevant keywords for search volume research
9. Suggest 2-3 concrete product solutions that directly address this pain point. For each solution:
   - Give it a creative, brandable product name
   - Write a one-sentence description of what it does
   - Classify its type: "saas", "ecommerce", "service", or "content"
   - Rate difficulty to build: "easy", "medium", or "hard"
   - Suggest a specific monetization model (e.g. "$9.99/mo subscription", "$29 one-time", "freemium with $19/mo pro tier")

Return the top 5-10 most significant pain points, ordered by frequency (highest first).

Return JSON matching this schema:
{
  "painPoints": [
    {
      "title": "string",
      "description": "string",
      "frequency": number,
      "confidence": number,
      "evidenceCount": number,
      "sentiment": "negative" | "neutral" | "mixed",
      "quotes": [{"text": "string", "source": "string", "url": "string"}],
      "keywords": ["string"],
      "solutions": [
        {
          "title": "string (creative product name)",
          "description": "string (one-sentence product description)",
          "type": "saas" | "ecommerce" | "service" | "content",
          "difficulty": "easy" | "medium" | "hard",
          "monetization": "string (specific pricing model)"
        }
      ]
    }
  ]
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned empty response");
  }

  let jsonString = text.trim();

  // Handle potential markdown wrapping
  if (jsonString.startsWith("```")) {
    jsonString = jsonString
      .replace(/^```(?:json)?\n?/, "")
      .replace(/\n?```$/, "");
  }

  const parsed = JSON.parse(jsonString) as { painPoints: PainPoint[] };
  return parsed.painPoints;
}

// --- Search Volume via BrightData SERP ---

function estimateVolume(totalResults: number): number {
  if (totalResults > 1_000_000_000) return 100000;
  if (totalResults > 100_000_000) return 50000;
  if (totalResults > 10_000_000) return 10000;
  if (totalResults > 1_000_000) return 5000;
  if (totalResults > 100_000) return 1000;
  if (totalResults > 10_000) return 500;
  return 100;
}

function estimateCompetition(serp: SerpBody): number {
  let score = 0;
  const adsCount = serp.ads?.length ?? 0;
  score += Math.min(adsCount * 15, 45);
  if (serp.shopping_results) score += 20;
  if (serp.answer_box) score += 15;
  if (serp.knowledge_graph) score += 10;
  const relatedCount = serp.related?.length ?? 0;
  score += Math.min(relatedCount * 2, 10);
  return Math.min(score, 100);
}

async function getSearchVolume(keywords: string[]): Promise<KeywordData[]> {
  // Try SerpAPI first if configured, otherwise use BrightData
  const serpApiKey = process.env.SERPAPI_KEY;
  if (serpApiKey) {
    return getSearchVolumeViaSerpApi(keywords, serpApiKey);
  }

  // Fallback: use BrightData Web Unlocker for SERP signals
  const bdToken = process.env.BRIGHTDATA_API_TOKEN;
  if (!bdToken) return [];

  const results: KeywordData[] = [];

  // Limit to 10 keywords to control BrightData costs
  for (const keyword of keywords.slice(0, 10)) {
    try {
      const serp = await searchGoogle(keyword, 5);
      const totalResults = serp.general?.results_cnt ?? 0;

      results.push({
        keyword,
        volume: estimateVolume(totalResults),
        competition: estimateCompetition(serp),
      });
    } catch {
      continue;
    }
  }

  return results;
}

async function getSearchVolumeViaSerpApi(
  keywords: string[],
  apiKey: string
): Promise<KeywordData[]> {
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

      let score = 0;
      score += Math.min(ads * 15, 45);
      if (data.shopping_results) score += 20;
      if (data.answer_box) score += 15;
      if (data.knowledge_graph) score += 10;
      const relatedCount =
        (data.related_searches as Array<unknown>)?.length ?? 0;
      score += Math.min(relatedCount * 2, 10);

      results.push({
        keyword,
        volume: estimateVolume(totalResults),
        competition: Math.min(score, 100),
      });
    } catch {
      continue;
    }
  }

  return results;
}

// --- Opportunity Score ---

function calculateOpportunityScores(
  painPoints: PainPoint[],
  searchVolume: KeywordData[],
): PainPoint[] {
  const volumeMap = new Map(searchVolume.map((sv) => [sv.keyword, sv]));

  return painPoints.map((pp) => {
    // Frequency score (30%): frequency is 1-10, normalize to 0-100
    const frequencyScore = (pp.frequency / 10) * 100;

    // Search volume score (25%): avg volume of related keywords
    const relatedVolumes = pp.keywords
      .map((kw) => volumeMap.get(kw)?.volume ?? 0)
      .filter((v) => v > 0);
    const avgVolume = relatedVolumes.length > 0
      ? relatedVolumes.reduce((a, b) => a + b, 0) / relatedVolumes.length
      : 0;
    // Normalize: 100k+ = 100, log scale
    const volumeScore = avgVolume > 0 ? Math.min((Math.log10(avgVolume) / 5) * 100, 100) : 20;

    // Competition score (20%): inverse — lower competition = higher opportunity
    const relatedCompetitions = pp.keywords
      .map((kw) => volumeMap.get(kw)?.competition ?? 50)
      .filter((c) => c > 0);
    const avgCompetition = relatedCompetitions.length > 0
      ? relatedCompetitions.reduce((a, b) => a + b, 0) / relatedCompetitions.length
      : 50;
    const competitionScore = 100 - avgCompetition;

    // Sentiment score (15%): negative = high opportunity
    const sentimentScore = pp.sentiment === "negative" ? 100 : pp.sentiment === "mixed" ? 60 : 30;

    // Solution gap score (10%): fewer existing solutions = more opportunity
    const solutionCount = pp.solutions?.length ?? 0;
    const solutionScore = solutionCount <= 1 ? 100 : solutionCount <= 3 ? 60 : 30;

    const opportunityScore = Math.round(
      frequencyScore * 0.30 +
      volumeScore * 0.25 +
      competitionScore * 0.20 +
      sentimentScore * 0.15 +
      solutionScore * 0.10,
    );

    return { ...pp, opportunityScore };
  });
}

// --- Ad Library Links ---

function generateAdLibraryLinks(niche: string) {
  const encoded = encodeURIComponent(niche);
  return {
    facebook: `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&q=${encoded}`,
    tiktok: `https://library.tiktok.com/ads?region=all&keyword=${encoded}`,
    google: `https://adstransparency.google.com/?query=${encoded}`,
    pinterest: `https://ads.pinterest.com/advertiser/ads/?query=${encoded}`,
    spyfu: `https://www.spyfu.com/overview/domain?query=${encoded}`,
    similarweb: `https://www.similarweb.com/website/${encoded}/`,
  };
}

// --- Main Research Action ---

export const run = action({
  args: {
    queryId: v.id("queries"),
    niche: v.string(),
    sourceUrl: v.optional(v.string()),
    researchTypes: v.optional(v.array(v.union(
      v.literal("saas"),
      v.literal("ecommerce"),
      v.literal("directory"),
      v.literal("website"),
    ))),
  },
  handler: async (ctx, args) => {
    const { queryId, niche, sourceUrl, researchTypes } = args;

    try {
      let cleanedContent: CleanedContent[];

      if (sourceUrl) {
        // Direct URL mode: skip SERP, extract content directly from the URL
        await ctx.runMutation(internal.queries.internalUpdateStatus, {
          queryId,
          status: "analyzing",
        });

        const extracted = await extractContent([sourceUrl]);
        if (extracted.length === 0) {
          await ctx.runMutation(internal.queries.internalUpdateStatus, {
            queryId,
            status: "failed",
          });
          return { success: false, error: "Failed to extract content from URL" };
        }
        cleanedContent = extracted;
      } else {
        // Standard mode: scrape Google SERP first
        await ctx.runMutation(internal.queries.internalUpdateStatus, {
          queryId,
          status: "scraping",
        });

        const scrapedUrls = await scrapeWithBrightData(niche, researchTypes ?? undefined);

        if (scrapedUrls.length === 0) {
          await ctx.runMutation(internal.queries.internalUpdateStatus, {
            queryId,
            status: "failed",
          });
          return { success: false, error: "No results found for this niche" };
        }

        await ctx.runMutation(internal.queries.internalUpdateStatus, {
          queryId,
          status: "analyzing",
        });

        const urls = scrapedUrls.map((s) => s.url);
        cleanedContent = await extractContent(urls);

        if (cleanedContent.length === 0) {
          await ctx.runMutation(internal.queries.internalUpdateStatus, {
            queryId,
            status: "failed",
          });
          return { success: false, error: "Failed to extract content" };
        }
      }

      // Step 3: AI Analysis
      const painPoints = await analyzeWithAI(niche, cleanedContent, researchTypes ?? undefined);

      // Step 4: Search Volume (BrightData or SerpAPI)
      await ctx.runMutation(internal.queries.internalUpdateStatus, {
        queryId,
        status: "fetching_volume",
      });

      const allKeywords = [
        ...new Set(painPoints.flatMap((pp) => pp.keywords)),
      ];
      const searchVolume = await getSearchVolume(allKeywords);

      // Step 5: Calculate opportunity scores
      const scoredPainPoints = calculateOpportunityScores(painPoints, searchVolume);

      // Sort by opportunity score (highest first)
      scoredPainPoints.sort((a, b) => (b.opportunityScore ?? 0) - (a.opportunityScore ?? 0));

      // Step 6: Generate ad library links
      const adLinks = generateAdLibraryLinks(niche);

      // Step 7: Save results
      await ctx.runMutation(internal.results.save, {
        queryId,
        painPoints: scoredPainPoints,
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
