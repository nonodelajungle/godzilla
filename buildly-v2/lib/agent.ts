import { validateIdea, type ValidationInput } from "./buildly";

export type AgentResult = ReturnType<typeof runBuildlyAgent>;

export function runBuildlyAgent(input: ValidationInput) {
  const validation = validateIdea(input);
  const icp = input.icp.trim() || "early users";
  const value = input.value.trim() || "Help users solve a painful workflow faster.";
  const idea = input.idea.trim() || "New startup idea";

  const urgency = validation.readiness === "High"
    ? "High buying intent if the workflow is painful enough."
    : validation.readiness === "Medium"
      ? "Real curiosity exists, but the promise still needs sharpening."
      : "The pain is plausible, but trust and positioning are still weak.";

  const landingSections = [
    `Hero focused on outcome: ${validation.headline}.`,
    `Proof block for ${icp.toLowerCase()} with one strong promise and one CTA.`,
    `Feature section explaining speed, clarity, and the first workflow of the MVP.`,
    `Decision block telling the founder whether to validate more or generate the MVP.`,
  ];

  const agentActions = validation.readiness === "High"
    ? [
        "Launch a waitlist with a concrete CTA and capture email + role.",
        `Run a ${validation.channel} campaign around one single promise for seven days.`,
        "Prioritize one core workflow in the MVP and cut all non-essential features.",
      ]
    : validation.readiness === "Medium"
      ? [
          "Test two hero headlines and compare click-through rate.",
          `Interview five ${icp.toLowerCase()} about their current workaround.`,
          "Keep the MVP scope to one painful action and one measurable result.",
        ]
      : [
          "Tighten the ICP before writing more product copy.",
          "Rewrite the promise around a measurable before/after result.",
          "Collect qualitative feedback before starting MVP generation.",
        ];

  const mvpScope = [
    `Core workflow: ${extractCoreWorkflow(value)}.`,
    "Primary user action: create, review, or automate the painful step.",
    "Success metric: visitor-to-signup conversion and first retained activation.",
  ];

  return {
    input: { idea, icp, value },
    validation,
    urgency,
    landingSections,
    agentActions,
    mvpScope,
    generatedCopy: {
      headline: validation.headline,
      subheadline: validation.subheadline,
      cta: validation.readiness === "High" ? "Start now" : "Join the waitlist",
    },
  };
}

function extractCoreWorkflow(value: string) {
  const clean = value.replace(/\.$/, "");
  const words = clean.split(" ").slice(0, 8).join(" ");
  return words || "solve the painful workflow faster";
}
