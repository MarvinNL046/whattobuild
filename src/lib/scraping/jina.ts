interface CleanedContent {
  url: string;
  title: string;
  content: string;
  source: string;
}

export async function extractContent(url: string): Promise<CleanedContent> {
  const apiKey = process.env.JINA_API_KEY;
  if (!apiKey) throw new Error("Missing JINA_API_KEY");

  const response = await fetch(`https://r.jina.ai/${url}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
      "X-Return-Format": "text",
    },
  });

  if (!response.ok) {
    throw new Error(`Jina extraction failed: ${response.status}`);
  }

  const data = await response.json();

  return {
    url,
    title: data.data?.title ?? "",
    content: data.data?.content ?? "",
    source: new URL(url).hostname,
  };
}

export async function extractBatch(
  urls: string[]
): Promise<CleanedContent[]> {
  // Process in parallel with concurrency limit
  const CONCURRENCY = 5;
  const results: CleanedContent[] = [];

  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const batch = urls.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.allSettled(
      batch.map((url) => extractContent(url))
    );

    for (const result of batchResults) {
      if (result.status === "fulfilled") {
        results.push(result.value);
      }
    }
  }

  return results;
}

export type { CleanedContent };
