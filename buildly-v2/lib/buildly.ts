export type ValidationInput = {
  idea: string;
  icp: string;
  value: string;
};

export type ValidationResult = {
  headline: string;
  subheadline: string;
  visitors: number;
  signups: number;
  conversion: string;
  channel: string;
  score: number;
  readiness: "Low" | "Medium" | "High";
  nextStep: string;
  insight: string;
  mvpRecommendation: string;
  features: { title: string; description: string }[];
  experiments: string[];
};

export const demoIdeas: ValidationInput[] = [
  {
    idea: "AI assistant for freelance designers",
    icp: "Freelance designers",
    value: "Help freelance designers find clients faster and automate proposal follow-up.",
  },
  {
    idea: "Meal planner for fitness coaches",
    icp: "Independent fitness coaches",
    value: "Help coaches create meal plans for clients faster without manual spreadsheets.",
  },
  {
    idea: "CRM for real estate agents",
    icp: "Independent real estate agents",
    value: "Give solo agents a simpler CRM to track leads, follow-ups, and closings.",
  },
];

export function validateIdea(input: ValidationInput): ValidationResult {
  const idea = input.idea.trim() || "New startup idea";
  const icp = input.icp.trim() || "early users";
  const value = input.value.trim() || "Help users solve a painful workflow faster.";

  let score = 68;
  if (/ai|assistant|automation|copilot|crm|planner/i.test(idea)) score += 8;
  if (/freelance|coach|agent|designer|creator|founder/i.test(icp)) score += 7;
  if (/faster|save|automate|clients|leads|track|minutes|growth/i.test(value)) score += 9;
  score = Math.min(score, 89);

  const readiness: ValidationResult["readiness"] = score >= 82 ? "High" : score >= 74 ? "Medium" : "Low";
  const visitors = 100 + score;
  const signups = Math.max(12, Math.round(score / 4.4));
  const conversion = `${Math.max(7.1, Math.min(17.8, score / 8)).toFixed(1)}%`;
  const channel = /coach|fitness|creator/i.test(icp)
    ? "TikTok"
    : /designer|founder|freelance|agency|b2b/i.test(icp)
      ? "LinkedIn"
      : "Meta Ads";

  const headline = sentenceCase(value.replace(/\.$/, ""));
  const subheadline = `Built for ${icp.toLowerCase()} who want ${value.toLowerCase()}`;

  const nextStep = readiness === "High"
    ? "Start MVP generation after one final pricing test."
    : readiness === "Medium"
      ? "Test two headline variants before building."
      : "Refine the ICP and value proposition before building.";

  const insight = readiness === "High"
    ? "The message feels specific, outcome-driven, and matched to a clear audience."
    : readiness === "Medium"
      ? "There is likely interest, but sharper positioning would increase confidence."
      : "The core pain exists, but the promise still feels too broad or too generic.";

  const mvpRecommendation = readiness === "High"
    ? "Buildly recommends moving into MVP generation with a tight first workflow and a simple onboarding path."
    : readiness === "Medium"
      ? "Buildly keeps MVP generation visible, but recommends another round of validation first."
      : "Buildly recommends staying in validation mode before investing in MVP generation.";

  return {
    headline,
    subheadline,
    visitors,
    signups,
    conversion,
    channel,
    score,
    readiness,
    nextStep,
    insight,
    mvpRecommendation,
    features: [
      {
        title: "Landing page generation",
        description: `Generate a focused landing page for ${icp.toLowerCase()} with a sharper offer and CTA.`,
      },
      {
        title: "Validation tracking",
        description: `Track visitors, signups, conversion, and best acquisition channel for ${idea.toLowerCase()}.`,
      },
      {
        title: "MVP generation path",
        description: "Move from validated demand into a first shippable product workflow when the signal is strong enough.",
      },
    ],
    experiments: [
      `Test a promise focused on ${extractAngle(value)}.`,
      `Run a channel experiment on ${channel}.`,
      `Collect 10 qualitative replies from ${icp.toLowerCase()}.`,
    ],
  };
}

function extractAngle(value: string) {
  const words = value.replace(/\.$/, "").split(" ").slice(0, 4).join(" ");
  return words.toLowerCase() || "the core outcome";
}

function sentenceCase(value: string) {
  if (!value) return "Get better results faster";
  return value.charAt(0).toUpperCase() + value.slice(1);
}
