import { NextResponse } from "next/server";
import { runBuildlyAgent } from "../../../lib/agent";
import type { ValidationInput } from "../../../lib/buildly";

const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.2";
const OPENAI_REASONING_EFFORT = process.env.OPENAI_REASONING_EFFORT || "xhigh";

const SYSTEM_PROMPT = [
  "You are Buildly, an elite startup strategist, conversion copywriter, positioning expert, product manager, and landing-page designer.",
  "Your job is to turn a raw startup idea into a sharp validation plan and a convincing landing-page preview.",
  "Think deeply about ICP clarity, value proposition sharpness, acquisition realism, willingness to pay, pain intensity, and MVP focus.",
  "Do not produce generic startup fluff.",
  "Write like a world-class operator advising an ambitious founder.",
  "The response must feel commercially sharp, specific, and immediately usable inside a startup validation product.",
].join(" ");

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "input",
    "urgency",
    "landingSections",
    "agentActions",
    "mvpScope",
    "generatedCopy",
    "validation",
  ],
  properties: {
    input: {
      type: "object",
      additionalProperties: false,
      required: ["idea", "icp", "value"],
      properties: {
        idea: { type: "string" },
        icp: { type: "string" },
        value: { type: "string" },
      },
    },
    urgency: { type: "string" },
    landingSections: {
      type: "array",
      minItems: 4,
      maxItems: 6,
      items: { type: "string" },
    },
    agentActions: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: { type: "string" },
    },
    mvpScope: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: { type: "string" },
    },
    generatedCopy: {
      type: "object",
      additionalProperties: false,
      required: ["headline", "subheadline", "cta"],
      properties: {
        headline: { type: "string" },
        subheadline: { type: "string" },
        cta: { type: "string" },
      },
    },
    validation: {
      type: "object",
      additionalProperties: false,
      required: [
        "visitors",
        "signups",
        "conversion",
        "channel",
        "score",
        "readiness",
        "nextStep",
        "insight",
        "mvpRecommendation",
        "features",
      ],
      properties: {
        visitors: { type: "number" },
        signups: { type: "number" },
        conversion: { type: "string" },
        channel: { type: "string" },
        score: { type: "number" },
        readiness: { type: "string", enum: ["Low", "Medium", "High"] },
        nextStep: { type: "string" },
        insight: { type: "string" },
        mvpRecommendation: { type: "string" },
        features: {
          type: "array",
          minItems: 3,
          maxItems: 3,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["title", "description"],
            properties: {
              title: { type: "string" },
              description: { type: "string" },
            },
          },
        },
      },
    },
  },
};

export async function POST(request: Request) {
  const body = await request.json();
  const input: ValidationInput = {
    idea: body.idea ?? "",
    icp: body.icp ?? "",
    value: body.value ?? "",
  };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json(runBuildlyAgent(input));

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        reasoning: { effort: OPENAI_REASONING_EFFORT },
        max_output_tokens: 3000,
        instructions: SYSTEM_PROMPT,
        input: `Startup idea: ${input.idea}\nICP: ${input.icp}\nValue proposition: ${input.value}\n\nGenerate the strongest possible Buildly output. Make the copy sharp, the strategy realistic, the positioning clear, and the MVP scope ruthless.`,
        text: {
          format: {
            type: "json_schema",
            name: "buildly_agent_response",
            strict: true,
            schema: RESPONSE_SCHEMA,
          },
        },
      }),
    });

    if (!response.ok) throw new Error(await response.text());

    const data = (await response.json()) as {
      output_text?: string;
      output?: Array<{ content?: Array<{ text?: string }> }>;
    };

    const rawText =
      data.output_text ??
      data.output?.flatMap((item) => item.content ?? []).map((item) => item.text ?? "").join("") ??
      "";

    return NextResponse.json(sanitize(JSON.parse(rawText)));
  } catch {
    return NextResponse.json(runBuildlyAgent(input));
  }
}

function sanitize(payload: any) {
  return {
    ...payload,
    validation: {
      ...payload.validation,
      score: Math.max(0, Math.min(100, Number(payload.validation?.score ?? 0))),
      visitors: Math.max(0, Number(payload.validation?.visitors ?? 0)),
      signups: Math.max(0, Number(payload.validation?.signups ?? 0)),
      features: Array.isArray(payload.validation?.features) ? payload.validation.features.slice(0, 3) : [],
    },
    agentActions: Array.isArray(payload.agentActions) ? payload.agentActions.slice(0, 3) : [],
    mvpScope: Array.isArray(payload.mvpScope) ? payload.mvpScope.slice(0, 3) : [],
  };
}
