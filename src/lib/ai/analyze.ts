import type { CleanedContent } from "@/lib/scraping/jina";

interface PainPoint {
  title: string;
  description: string;
  frequency: number;
  sentiment: "negative" | "neutral" | "mixed";
  quotes: { text: string; source: string; url?: string }[];
  keywords: string[];
}

interface AnalysisResult {
  painPoints: PainPoint[];
  niche: string;
}

// Swappable AI provider interface
interface AIProvider {
  analyze(prompt: string): Promise<string>;
}

class ClaudeHaikuProvider implements AIProvider {
  private apiKey: string;

  constructor() {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error("Missing ANTHROPIC_API_KEY");
    this.apiKey = key;
  }

  async analyze(prompt: string): Promise<string> {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
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
    return data.content[0].text;
  }
}

// Factory for swappable providers
function getProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER ?? "claude";

  switch (provider) {
    case "claude":
      return new ClaudeHaikuProvider();
    default:
      return new ClaudeHaikuProvider();
  }
}

export async function analyzePainPoints(
  niche: string,
  content: CleanedContent[]
): Promise<AnalysisResult> {
  const provider = getProvider();

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

  const result = await provider.analyze(prompt);

  // Parse JSON from response (handle potential markdown wrapping)
  let jsonString = result.trim();
  if (jsonString.startsWith("```")) {
    jsonString = jsonString.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const parsed = JSON.parse(jsonString) as { painPoints: PainPoint[] };

  return {
    painPoints: parsed.painPoints,
    niche,
  };
}

export type { PainPoint, AnalysisResult, AIProvider };
