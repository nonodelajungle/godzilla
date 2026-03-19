import { NextResponse } from "next/server";
import { runBuildlyAgent } from "../../../lib/agent";
import type { ValidationInput } from "../../../lib/buildly";

const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.4";

const SYSTEM_PROMPT = `You are Buildly, an expert startup validation strategist, landing-page copywriter, and MVP scoping advisor.

Return ONLY valid JSON with this exact shape:
{
  "input": { "idea": string, "icp": string, "value": string },
  "urgency": string,
  "landingSections": string[],
  "agentActions": string[],
  "mvpScope": string[],
  "generatedCopy": { "headline": string, "subheadline": string, "cta": string },
  "validation": {
    "visitors": number,
    "signups": number,
    "conversion": string,
    "channel": string,
    "score": number,
    "readiness": "Low" | "Medium" | "High",
    "nextStep": string,
    "insight": string,
    "mvpRecommendation": string,
    "features": [{ "title": string, "description": string }]
  }
}

Rules:
- Be concrete, commercially sharp, and realistic.
- Keep "features" to exactly 3 items.
- Keep "agentActions" to exactly 3 items.
- Keep "mvpScope" to exactly 3 items.
- "conversion" must be a percentage string like "12.4%".
- "score" must be between 0 and 100.
- Make the output internally consistent with the startup idea, ICP, and value proposition.
- Write as if the founder will directly use the result on a landing page.`;

export async function POST(request: Request) {
  const body = await request.json();
  const input: ValidationInput = {
    idea: body.idea ?? "",
    icp: body.icp ?? "",
    value: body.value ?? "",
  };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(runBuildlyAgent(input));
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        reasoning: { effort: "medium" },
        input: `${SYSTEM_PROMPT}\n\nStartup idea: ${input.idea}\nICP: ${input.icp}\nValue proposition: ${input.value}\n\nGenerate the Buildly response now.`,
      }),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json() as {
      output_text?: string;
      output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
    };

    const rawText =
      data.output_text ??
      data.output
        ?.flatMap((item) => item.content ?? [])
        .map((item) => item.text ?? "")
        .join("") ??
      "";

    const parsed = parseAgentJson(rawText);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(runBuildlyAgent(input));
  }
}

function parseAgentJson(rawText: string) {
  const match = rawText.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("No JSON returned by OpenAI");
  }
  return JSON.parse(match[0]);
}
