"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";

interface Solution {
  title: string;
  description: string;
  type: "saas" | "ecommerce" | "service" | "content";
  difficulty: "easy" | "medium" | "hard";
  monetization: string;
}

interface PainPointInput {
  title: string;
  description: string;
  keywords: string[];
  solutions?: Solution[];
}

// Generate fresh product solutions for existing pain points
export const run = action({
  args: {
    queryId: v.id("queries"),
  },
  handler: async (ctx, args) => {
    const { queryId } = args;

    try {
      // Get existing result
      const result = await ctx.runQuery(internal.results.getByQueryInternal, {
        queryId,
      });

      if (!result) {
        return { success: false, error: "Result not found" };
      }

      // Get the query for niche context
      const query = await ctx.runQuery(internal.queries.getInternal, {
        queryId,
      });

      if (!query) {
        return { success: false, error: "Query not found" };
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

      const model = process.env.GEMINI_MODEL ?? "gemini-3-flash-preview";

      // Build context from existing pain points
      const painPointSummary = result.painPoints
        .map(
          (pp: PainPointInput, i: number) =>
            `${i + 1}. "${pp.title}" — ${pp.description}\n   Keywords: ${pp.keywords.join(", ")}\n   Previous solutions: ${pp.solutions?.map((s: Solution) => s.title).join(", ") ?? "none"}`
        )
        .join("\n\n");

      const prompt = `You previously analyzed the "${query.niche}" niche and found these pain points:

${painPointSummary}

Now generate COMPLETELY DIFFERENT product solutions for each pain point. Think outside the box:
- Consider unconventional business models (community-based, marketplace, API-first, white-label, browser extension, mobile-first, AI-powered)
- Try different price points and monetization strategies
- Consider underserved segments or niches within the niche
- Look at the problem from a different angle (prevention vs cure, B2B vs B2C, automation vs manual, premium vs budget)

IMPORTANT: Do NOT repeat any of the previous solution titles. Generate fresh, creative ideas.

For each pain point, provide 2-3 new solutions:

Return JSON matching this schema:
{
  "solutions": [
    {
      "painPointIndex": 0,
      "solutions": [
        {
          "title": "string (creative, brandable product name)",
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
              temperature: 0.8, // Higher temperature for more creative results
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

      if (!text) throw new Error("Gemini returned empty response");

      let jsonString = text.trim();
      if (jsonString.startsWith("```")) {
        jsonString = jsonString
          .replace(/^```(?:json)?\n?/, "")
          .replace(/\n?```$/, "");
      }

      const parsed = JSON.parse(jsonString) as {
        solutions: {
          painPointIndex: number;
          solutions: Solution[];
        }[];
      };

      // Merge new solutions into pain points
      const updatedPainPoints = result.painPoints.map(
        (pp: typeof result.painPoints[number], i: number) => {
          const newSolutions = parsed.solutions.find(
            (s) => s.painPointIndex === i
          );
          return {
            ...pp,
            solutions: newSolutions?.solutions ?? pp.solutions,
          };
        }
      );

      // Save updated pain points
      await ctx.runMutation(internal.results.updatePainPoints, {
        resultId: result._id,
        painPoints: updatedPainPoints,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
