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
  zone?: string;
}

function getConfig(): BrightDataConfig {
  const apiToken = process.env.BRIGHTDATA_API_TOKEN;
  if (!apiToken) throw new Error("Missing BRIGHTDATA_API_TOKEN");
  return { apiToken, zone: process.env.BRIGHTDATA_ZONE };
}

export async function scrapeReddit(
  niche: string
): Promise<ScrapedContent[]> {
  const config = getConfig();

  // BrightData SERP API to find Reddit discussions about the niche
  const queries = [
    `site:reddit.com "${niche}" complaints OR problems OR issues OR hate OR frustrated`,
    `site:reddit.com "${niche}" wish OR "looking for" OR "need a" OR "anyone know"`,
  ];

  const results: ScrapedContent[] = [];

  for (const query of queries) {
    const response = await fetch(
      "https://api.brightdata.com/serp/req",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiToken}`,
        },
        body: JSON.stringify({
          query,
          search_engine: "google",
          country: "us",
          num: 20,
        }),
      }
    );

    if (!response.ok) {
      console.error(`BrightData SERP error: ${response.status}`);
      continue;
    }

    const data = await response.json();
    const organic = data.organic ?? [];

    for (const result of organic) {
      results.push({
        url: result.link,
        title: result.title,
        text: result.description ?? "",
        source: "reddit",
      });
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
    const response = await fetch(
      "https://api.brightdata.com/serp/req",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiToken}`,
        },
        body: JSON.stringify({
          query,
          search_engine: "google",
          country: "us",
          num: 15,
        }),
      }
    );

    if (!response.ok) continue;

    const data = await response.json();
    const organic = data.organic ?? [];

    const source = query.includes("trustpilot") ? "trustpilot" : "amazon";
    for (const result of organic) {
      results.push({
        url: result.link,
        title: result.title,
        text: result.description ?? "",
        source: source as ScrapedContent["source"],
      });
    }
  }

  return results;
}

export type { ScrapedContent };
