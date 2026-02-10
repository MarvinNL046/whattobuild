interface ScrapedContent {
  url: string;
  title: string;
  text: string;
  source: "reddit" | "trustpilot" | "amazon" | "forum";
  author?: string;
  date?: string;
}

interface BrightDataConfig {
  apiToken: string;
  zone: string;
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

function getConfig(): BrightDataConfig {
  const apiToken = process.env.BRIGHTDATA_API_TOKEN;
  if (!apiToken) throw new Error("Missing BRIGHTDATA_API_TOKEN");
  return {
    apiToken,
    zone: process.env.BRIGHTDATA_ZONE ?? "whattobuild",
  };
}

/** Send a Google search through BrightData Web Unlocker and parse the SERP. */
async function searchGoogle(
  query: string,
  config: BrightDataConfig,
  num = 15
): Promise<SerpBody> {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=${num}`;

  const response = await fetch("https://api.brightdata.com/request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiToken}`,
    },
    body: JSON.stringify({
      zone: config.zone,
      url: searchUrl,
      format: "json",
    }),
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

export async function scrapeReddit(
  niche: string
): Promise<ScrapedContent[]> {
  const config = getConfig();

  const queries = [
    `site:reddit.com "${niche}" complaints OR problems OR issues OR hate OR frustrated`,
    `site:reddit.com "${niche}" wish OR "looking for" OR "need a" OR "anyone know"`,
  ];

  const results: ScrapedContent[] = [];

  for (const query of queries) {
    try {
      const serp = await searchGoogle(query, config, 20);
      const organic = serp.organic ?? [];

      for (const result of organic) {
        results.push({
          url: result.link,
          title: result.title,
          text: result.description ?? "",
          source: "reddit",
        });
      }
    } catch {
      continue;
    }
  }

  return results;
}

export async function scrapeReviews(
  niche: string
): Promise<ScrapedContent[]> {
  const config = getConfig();

  const queries = [
    `site:trustpilot.com "${niche}" review`,
    `site:amazon.com "${niche}" review "1 star" OR "2 star" OR "disappointed"`,
  ];

  const results: ScrapedContent[] = [];

  for (const query of queries) {
    try {
      const serp = await searchGoogle(query, config, 15);
      const organic = serp.organic ?? [];

      const source = query.includes("trustpilot") ? "trustpilot" : "amazon";
      for (const result of organic) {
        results.push({
          url: result.link,
          title: result.title,
          text: result.description ?? "",
          source: source as ScrapedContent["source"],
        });
      }
    } catch {
      continue;
    }
  }

  return results;
}

export { searchGoogle, getConfig };
export type { ScrapedContent, SerpBody, BrightDataConfig };
