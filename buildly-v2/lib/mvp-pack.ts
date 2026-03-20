import type { LocalProject, MvpBrief, ProjectDecision, ProjectSignal } from "./local-demo";

export type MvpPack = {
  productOneLiner: string;
  targetUser: string;
  coreOutcome: string;
  userStories: string[];
  screens: string[];
  dataModel: string[];
  stack: string[];
  integrations: string[];
  roadmap14Days: string[];
  buildPrompt: string;
  prdMarkdown: string;
};

export function buildMvpPack(input: {
  project: LocalProject;
  signal: ProjectSignal;
  decision: ProjectDecision;
  brief: MvpBrief;
}): MvpPack {
  const { project, signal, decision, brief } = input;
  const winningAngle = signal.bestVariant?.headline || project.result.generatedCopy.headline;
  const targetUser = project.input.icp;
  const coreOutcome = normalizeOutcome(project.input.value);

  const userStories = [
    `As a ${targetUser.toLowerCase()}, I want to understand the product promise immediately so I can decide if it solves my urgent problem.`,
    `As a ${targetUser.toLowerCase()}, I want to complete one core workflow in minutes so I can reach the first useful outcome fast.`,
    `As a ${targetUser.toLowerCase()}, I want a clear success state so I know the product delivered value.`,
    `As a founder, I want to measure activation and conversion so I can improve the MVP without guessing.`,
  ];

  const screens = [
    "Landing page",
    "Onboarding form",
    "Core workflow screen",
    "Result screen",
    "Founder analytics view",
  ];

  const dataModel = [
    "users",
    "projects",
    "sessions",
    "events",
    "leads",
    "workflow_runs",
  ];

  const stack = [
    "Next.js App Router",
    "Supabase Auth + Postgres",
    "Tailwind UI",
    "Vercel deployment",
    "PostHog analytics",
    "Resend transactional email",
  ];

  const integrations = [
    "Supabase for auth, data, and storage",
    "PostHog for activation and funnel analytics",
    "Resend for onboarding and follow-up emails",
  ];

  const roadmap14Days = [
    "Day 1–2: define schema, auth, and project creation flow",
    "Day 3–4: build onboarding and the first core workflow",
    "Day 5–6: implement result state and lead-to-user handoff",
    "Day 7–8: add basic founder analytics and event tracking",
    "Day 9–10: wire onboarding and follow-up emails",
    "Day 11–12: polish UI, copy, and empty states",
    "Day 13–14: QA, deploy, and invite first real users",
  ];

  const buildPrompt = [
    `Build an MVP for: ${project.input.idea}.`,
    `Target user: ${targetUser}.`,
    `Core outcome: ${coreOutcome}.`,
    `Winning angle from validation: ${winningAngle}.`,
    `Current decision: ${decision.label}.`,
    "Preferred stack: Next.js App Router, Tailwind, Supabase, PostHog, and Resend.",
    `Must-have features: ${brief.features.join("; ")}.`,
    `Do not build yet: ${brief.doNotBuild.join("; ")}.`,
    `Required screens: ${screens.join("; ")}.`,
    `Required data model: ${dataModel.join("; ")}.`,
    "Return an implementation plan with routes, components, and database tables.",
  ].join("\n");

  const prdMarkdown = [
    `# ${project.input.idea} MVP`,
    "",
    "## One-liner",
    `${project.input.idea} helps ${targetUser.toLowerCase()} ${coreOutcome.toLowerCase()}.`,
    "",
    "## Why now",
    `${decision.label}. Validation shows ${signal.totalLeads} leads and ${signal.conversion}% conversion from current traffic.`,
    "",
    "## Winning angle",
    winningAngle,
    "",
    "## Must build now",
    ...brief.features.map((item) => `- ${item}`),
    "",
    "## Backlog after v1",
    ...brief.backlog.map((item) => `- ${item}`),
    "",
    "## Do not build yet",
    ...brief.doNotBuild.map((item) => `- ${item}`),
    "",
    "## User stories",
    ...userStories.map((item) => `- ${item}`),
    "",
    "## Screens",
    ...screens.map((item) => `- ${item}`),
    "",
    "## Data model",
    ...dataModel.map((item) => `- ${item}`),
    "",
    "## Recommended stack",
    ...stack.map((item) => `- ${item}`),
    "",
    "## 14-day roadmap",
    ...roadmap14Days.map((item) => `- ${item}`),
    "",
    "## Builder prompt",
    buildPrompt,
  ].join("\n");

  return {
    productOneLiner: `${project.input.idea} helps ${targetUser.toLowerCase()} ${coreOutcome.toLowerCase()}.`,
    targetUser,
    coreOutcome,
    userStories,
    screens,
    dataModel,
    stack,
    integrations,
    roadmap14Days,
    buildPrompt,
    prdMarkdown,
  };
}

function normalizeOutcome(value: string) {
  return value.replace(/^help\s+/i, "").replace(/\.$/, "");
}
