import { NextResponse } from "next/server";
import { runBuildlyAgent } from "../../../lib/agent";
import type { ValidationInput } from "../../../lib/buildly";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.2-chat-latest";
const OPENAI_REASONING_EFFORT = process.env.OPENAI_REASONING_EFFORT || "high";

const SYSTEM_PROMPT = [
  "You are Buildly, an elite startup strategist, conversion copywriter, positioning expert, product manager, and landing-page designer.",
  "Turn a raw startup idea into a sharp validation plan and a convincing landing-page preview.",
  "Think deeply about ICP clarity, value proposition sharpness, acquisition realism, willingness to pay, pain intensity, and MVP focus.",
  "Do not produce generic startup fluff.",
  "Write like a world-class operator advising an ambitious founder.",
].join(" ");

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["input", "urgency", "landingSections", "agentActions", "mvpScope", "generatedCopy", "validation"],
  properties: {
    input: {
      type: "object",
      additionalProperties: false,
      required: ["idea", "icp", "value"],
      properties: { idea: { type: "string" }, icp: { type: "string" }, value: { type: "string" } },
    },
    urgency: { type: "string" },
    landingSections: { type: "array", minItems: 4, maxItems: 6, items: { type: "string" } },
    agentActions: { type: "array", minItems: 3, maxItems: 3, items: { type: "string" } },
    mvpScope: { type: "array", minItems: 3, maxItems: 3, items: { type: "string" } },
    generatedCopy: {
      type: "object",
      additionalProperties: false,
      required: ["headline", "subheadline", "cta"],
      properties: { headline: { type: "string" }, subheadline: { type: "string" }, cta: { type: "string" } },
    },
    validation: {
      type: "object",
      additionalProperties: false,
      required: ["visitors", "signups", "conversion", "channel", "score", "readiness", "nextStep", "insight", "mvpRecommendation", "features"],
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
            properties: { title: { type: "string" }, description: { type: "string" } },
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

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return NextResponse.json(withMeta(runBuildlyAgent(input), false, "missing_openai_api_key"));

  const candidates = Array.from(new Set([
    OPENAI_MODEL,
    OPENAI_MODEL === "gpt-5.2" ? "gpt-5.2-chat-latest" : null,
    "gpt-5",
  ].filter(Boolean))) as string[];

  let lastError = "unknown_openai_error";

  for (const model of candidates) {
    for (const withReasoning of [true, false]) {
      try {
        const response = await fetch(OPENAI_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            ...(withReasoning ? { reasoning_effort: OPENAI_REASONING_EFFORT } : {}),
            max_completion_tokens: 2500,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              {
                role: "user",
                content: `Startup idea: ${input.idea}\nICP: ${input.icp}\nValue proposition: ${input.value}\n\nGenerate the strongest possible Buildly output. Make the copy sharp, the strategy realistic, the positioning clear, and the MVP scope ruthless.`,
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "buildly_agent_response",
                strict: true,
                schema: RESPONSE_SCHEMA,
              },
            },
          }),
        });

        if (!response.ok) {
          lastError = compactError(await response.text());
          continue;
        }

        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };

        const rawText = data.choices?.[0]?.message?.content?.trim();
        if (!rawText) {
          lastError = "empty_openai_response";
          continue;
        }

        return NextResponse.json(withMeta(sanitize(JSON.parse(rawText)), true, undefined, model, withReasoning ? OPENAI_REASONING_EFFORT : "none"));
      } catch (error) {
        lastError = compactError(String(error));
      }
    }
  }

  return NextResponse.json(withMeta(runBuildlyAgent(input), false, lastError));
}

function withMeta(payload: any, openaiEnabled: boolean, error?: string, model?: string, reasoning?: string) {
  return {
    ...payload,
    meta: {
      provider: openaiEnabled ? "openai" : "fallback",
      model: openaiEnabled ? (model || OPENAI_MODEL) : "local-buildly-agent",
      reasoning: openaiEnabled ? (reasoning || OPENAI_REASONING_EFFORT) : "none",
      ...(error ? { error } : {}),
    },
  };
}

function compactError(value: string) {
  return value.replace(/\s+/g, " ").slice(0, 220);
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
