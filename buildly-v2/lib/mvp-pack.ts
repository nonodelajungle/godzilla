import type { LocalProject, MvpBrief, ProjectDecision, ProjectSignal } from "./local-demo";
import { themePresetToThemeKey } from "./buildly-os";

export type MvpArchetype =
  | "agency"
  | "b2b_saas"
  | "marketplace"
  | "creator"
  | "education"
  | "health"
  | "fintech"
  | "recruiting"
  | "ecommerce"
  | "consumer";

export type MvpThemeKey = "cyan" | "violet" | "emerald" | "amber" | "indigo" | "rose";

export type MvpFeatureCard = {
  title: string;
  body: string;
  icon: string;
};

export type MvpBranding = {
  name: string;
  badge: string;
  headlineA: string;
  accentB: string;
  accentC: string;
  closing: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  featuresTitle: string;
  featuresAccent: string;
  featuresSubtitle: string;
  features: MvpFeatureCard[];
  footerTitle: string;
  footerSubtitle: string;
  footerCta: string;
  footerNote: string;
};

export type MvpPack = {
  archetype: MvpArchetype;
  themeKey: MvpThemeKey;
  productOneLiner: string;
  targetUser: string;
  coreOutcome: string;
  userStories: string[];
  screens: string[];
  appNavigation: string[];
  dataModel: string[];
  stack: string[];
  integrations: string[];
  roadmap14Days: string[];
  buildPrompt: string;
  prdMarkdown: string;
  branding: MvpBranding;
};

type ArchetypeConfig = {
  themeKey: MvpThemeKey;
  screens: string[];
  appNavigation: string[];
  dataModel: string[];
  branding: MvpBranding;
};

export function buildMvpPack(input: {
  project: LocalProject;
  signal: ProjectSignal;
  decision: ProjectDecision;
  brief: MvpBrief;
}): MvpPack {
  const { project, signal, decision, brief } = input;
  const targetUser = project.input.icp;
  const coreOutcome = normalizeOutcome(project.input.value);
  const winningAngle = signal.bestVariant?.headline || project.result.generatedCopy.headline;
  const archetype = detectArchetype(project.input.idea, targetUser, coreOutcome);
  const config = getArchetypeConfig(archetype, project.input.idea, targetUser, coreOutcome);
  const forcedTheme = themePresetToThemeKey(project.config?.themePreset || null);
  const themeKey = forcedTheme || config.themeKey;
  const knowledge = [project.config?.workspaceKnowledge, project.config?.projectKnowledge].filter(Boolean).join("\n");
  const referenceHint = project.config?.referencedProjectIds?.length ? `Referenced projects: ${project.config.referencedProjectIds.length}.` : "Referenced projects: none.";
  const productOneLiner = `${config.branding.name} helps ${targetUser.toLowerCase()} ${coreOutcome.toLowerCase()}.`;

  const userStories = [
    `As a ${targetUser.toLowerCase()}, I want the product to reflect my workflow so the MVP feels immediately relevant.`,
    `As a ${targetUser.toLowerCase()}, I want to complete the main value loop quickly so I can reach a useful outcome without friction.`,
    `As a ${targetUser.toLowerCase()}, I want a clear success state so I understand the value delivered by the product.`,
    `As a founder, I want activation and conversion signals visible from day one so I can refine the MVP intelligently.`,
  ];

  const stack = buildStack(archetype);
  const integrations = buildIntegrations(archetype);
  const roadmap14Days = buildRoadmap(archetype);

  const buildPrompt = [
    `Build an MVP for: ${project.input.idea}.`,
    `Detected archetype: ${archetype}.`,
    `Brand direction: ${config.branding.name}.`,
    `Theme direction: ${themeKey}.`,
    `Theme preset: ${project.config?.themePreset || "default"}.`,
    `Target user: ${targetUser}.`,
    `Core outcome: ${coreOutcome}.`,
    `Winning angle from validation: ${winningAngle}.`,
    `Current decision: ${decision.label}.`,
    `Build origin: ${project.config?.buildOrigin || "manual"}.`,
    `Must-have features from validation: ${brief.features.join("; ")}.`,
    `Specialized feature cards: ${config.branding.features.map((feature) => feature.title).join("; ")}.`,
    `Required screens: ${config.screens.join("; ")}.`,
    `Required navigation: ${config.appNavigation.join("; ")}.`,
    `Required data model: ${config.dataModel.join("; ")}.`,
    `Recommended stack: ${stack.join("; ")}.`,
    `Recommended integrations: ${integrations.join("; ")}.`,
    referenceHint,
    knowledge ? `Knowledge to respect:\n${knowledge}` : "Knowledge to respect: none.",
    `Use a ${themeKey} primary accent and adapt the interface to the ${archetype} archetype.`,
    `Brand voice: ${config.branding.subtitle}`,
    "Return routes, components, data tables, empty states, analytics cards, and a polished landing plus app preview.",
  ].join("\n");

  const prdMarkdown = [
    `# ${config.branding.name} MVP`,
    "",
    `## Archetype`,
    archetype,
    "",
    `## Theme`,
    themeKey,
    "",
    `## Theme preset`,
    project.config?.themePreset || "default",
    "",
    `## Build origin`,
    project.config?.buildOrigin || "manual",
    "",
    `## One-liner`,
    productOneLiner,
    "",
    `## Why now`,
    `${decision.label}. Validation shows ${signal.totalLeads} leads and ${signal.conversion}% conversion from current traffic.`,
    "",
    `## Winning angle`,
    winningAngle,
    "",
    `## Brand direction`,
    `- Badge: ${config.branding.badge}`,
    `- Primary CTA: ${config.branding.primaryCta}`,
    `- Secondary CTA: ${config.branding.secondaryCta}`,
    "",
    `## Must build now`,
    ...brief.features.map((item) => `- ${item}`),
    "",
    `## Archetype navigation`,
    ...config.appNavigation.map((item) => `- ${item}`),
    "",
    `## Screens`,
    ...config.screens.map((item) => `- ${item}`),
    "",
    `## Data model`,
    ...config.dataModel.map((item) => `- ${item}`),
    "",
    `## User stories`,
    ...userStories.map((item) => `- ${item}`),
    "",
    `## Recommended stack`,
    ...stack.map((item) => `- ${item}`),
    "",
    `## Integrations`,
    ...integrations.map((item) => `- ${item}`),
    "",
    `## Knowledge`,
    knowledge || "None provided.",
    "",
    `## 14-day roadmap`,
    ...roadmap14Days.map((item) => `- ${item}`),
    "",
    `## Builder prompt`,
    buildPrompt,
  ].join("\n");

  return {
    archetype,
    themeKey,
    productOneLiner,
    targetUser,
    coreOutcome,
    userStories,
    screens: config.screens,
    appNavigation: config.appNavigation,
    dataModel: config.dataModel,
    stack,
    integrations,
    roadmap14Days,
    buildPrompt,
    prdMarkdown,
    branding: config.branding,
  };
}

function detectArchetype(idea: string, icp: string, value: string): MvpArchetype {
  const text = `${idea} ${icp} ${value}`.toLowerCase();
  if (/(agency|freelance|freelancer|designer|proposal|client|lead generation|outreach)/.test(text)) return "agency";
  if (/(marketplace|buyer|seller|vendor|listing|booking platform)/.test(text)) return "marketplace";
  if (/(course|coach|training|learn|student|teacher|cohort|academy)/.test(text)) return "education";
  if (/(creator|newsletter|audience|content creator|ugc|influencer|community)/.test(text)) return "creator";
  if (/(health|medical|clinic|patient|therapy|fitness|nutrition|wellness)/.test(text)) return "health";
  if (/(finance|fintech|accounting|invoice|cash flow|bank|budget|expense)/.test(text)) return "fintech";
  if (/(recruit|hiring|candidate|talent|job board|interview)/.test(text)) return "recruiting";
  if (/(shop|store|ecommerce|commerce|product catalog|cart|sku|brand)/.test(text)) return "ecommerce";
  if (/(team|workflow|dashboard|crm|saas|b2b|ops|automation|pipeline)/.test(text)) return "b2b_saas";
  return "consumer";
}

function getArchetypeConfig(archetype: MvpArchetype, idea: string, targetUser: string, coreOutcome: string): ArchetypeConfig {
  const brand = toBrandName(idea);
  const defaults: ArchetypeConfig = {
    themeKey: "cyan",
    screens: ["Landing page", "Onboarding", "Main workflow", "Results", "Analytics"],
    appNavigation: ["Overview", "Workspace", "Results", "Analytics", "Settings"],
    dataModel: ["users", "workspaces", "projects", "events", "sessions", "results"],
    branding: {
      name: brand,
      badge: "AI-Powered MVP",
      headlineA: `Launch ${brand}.`,
      accentB: "Generate",
      accentC: "results.",
      closing: "Move faster.",
      subtitle: `${brand} helps ${targetUser.toLowerCase()} ${coreOutcome.toLowerCase()} with a sharper workflow, better activation, and a clearer path to revenue.`,
      primaryCta: "Get started",
      secondaryCta: "See how it works",
      featuresTitle: "Everything you need to",
      featuresAccent: "launch faster",
      featuresSubtitle: `${brand} turns a validated idea into a sharper workflow, a stronger offer, and better activation.`,
      features: [
        { title: "Clear onboarding", body: "Guide users into the product with less friction and stronger activation.", icon: "✦" },
        { title: "Focused workflow", body: "Deliver the core outcome in the first session without unnecessary complexity.", icon: "⚙" },
        { title: "Signal tracking", body: "Measure activation, completion, and progression from day one.", icon: "↗" },
        { title: "Faster iteration", body: "Use feedback loops to improve the MVP without rebuilding everything.", icon: "◔" },
      ],
      footerTitle: `Ready to launch ${brand}?`,
      footerSubtitle: `Move from MVP plan to a more credible product experience in less time.`,
      footerCta: "Start now",
      footerNote: `© 2026 ${brand}. Generated by Buildly.`,
    },
  };
  if (archetype === "agency") return { themeKey: "cyan", screens: ["Landing page", "Client onboarding", "Lead discovery", "Proposal builder", "Pipeline analytics"], appNavigation: ["Dashboard", "Leads", "Proposals", "Pipeline", "Settings"], dataModel: ["users", "leads", "proposals", "campaigns", "pipeline_events", "clients"], branding: { name: "ProposalPilot", badge: "AI-Powered Client Acquisition", headlineA: "Find clients.", accentB: "Send", accentC: "proposals.", closing: "Close deals.", subtitle: "The AI assistant that finds high-quality leads, writes personalized proposals, and automates follow-ups — so you can focus on your craft.", primaryCta: "Start finding clients", secondaryCta: "See how it works", featuresTitle: "Everything you need to", featuresAccent: "land more clients", featuresSubtitle: "Stop cold-emailing into the void. Let AI handle the grind while you do what you love.", features: [{ title: "Smart Lead Discovery", body: "Find prospects who already match your niche and buying intent.", icon: "⌕" }, { title: "Proposal Generator", body: "Draft personalized proposals from your offer, portfolio, and target profile.", icon: "📄" }, { title: "Follow-Up Automation", body: "Keep momentum with tasteful reminders and pipeline-aware outreach.", icon: "◔" }, { title: "Pipeline Analytics", body: "Track outreach, reply rate, and close rate from first contact to signed deal.", icon: "↗" }], footerTitle: "Ready to stop chasing clients?", footerSubtitle: "Join independent operators landing more deals with less manual outreach.", footerCta: "Get started free", footerNote: "© 2026 ProposalPilot. Generated by Buildly." } };
  if (archetype === "b2b_saas") return { themeKey: "indigo", screens: ["Landing page", "Workspace onboarding", "Operations dashboard", "Automation builder", "Analytics"], appNavigation: ["Overview", "Workflows", "Tasks", "Reports", "Settings"], dataModel: ["users", "teams", "workflows", "tasks", "automation_runs", "events"], branding: { ...defaults.branding, name: `${brand}OS`, badge: "AI-Powered Ops Platform", headlineA: "Unify your ops.", accentB: "Automate", accentC: "execution.", closing: "Scale calmly.", subtitle: `${brand}OS gives teams a single control layer for work, automation, and visibility — without the usual operational chaos.`, primaryCta: "Start free workspace", secondaryCta: "Book demo", featuresAccent: "run smarter", features: [{ title: "Unified Dashboard", body: "See team activity, workflow health, and bottlenecks in one place.", icon: "▣" }, { title: "Automation Builder", body: "Turn repetitive handoffs into reliable flows with less manual work.", icon: "⚙" }, { title: "Team Visibility", body: "Give operators, managers, and founders the context they need to act fast.", icon: "👁" }, { title: "Performance Reports", body: "Track adoption, completion, and throughput with actionable reports.", icon: "↗" }] } };
  if (archetype === "marketplace") return { themeKey: "amber", screens: ["Marketplace landing", "Buyer onboarding", "Listings feed", "Listing detail", "Trust analytics"], appNavigation: ["Home", "Browse", "Matches", "Orders", "Profile"], dataModel: ["users", "listings", "matches", "orders", "reviews", "messages"], branding: { ...defaults.branding, name: `${brand}Match`, badge: "AI-Powered Marketplace", headlineA: "Match demand.", accentB: "Surface", accentC: "supply.", closing: "Create trust.", subtitle: `${brand}Match helps both sides of the marketplace discover the right fit faster, with higher trust and less search friction.`, primaryCta: "Explore listings", secondaryCta: "How matching works", featuresAccent: "match faster", features: [{ title: "Smart Matching", body: "Recommend the best listing or provider based on intent and constraints.", icon: "◎" }, { title: "Verified Profiles", body: "Increase confidence with social proof, ratings, and structured trust signals.", icon: "✓" }, { title: "Availability Engine", body: "Show real availability and fit, not just static catalog pages.", icon: "◷" }, { title: "Conversion Analytics", body: "Track inquiry-to-booking conversion across the full marketplace flow.", icon: "↗" }] } };
  if (archetype === "creator") return { themeKey: "rose", screens: ["Creator landing", "Audience onboarding", "Content workspace", "Offer page", "Audience analytics"], appNavigation: ["Home", "Audience", "Content", "Offers", "Analytics"], dataModel: ["users", "audience_segments", "content_items", "offers", "events", "sales"], branding: { ...defaults.branding, name: `${brand}Studio`, badge: "AI-Powered Creator Engine", headlineA: "Grow audience.", accentB: "Package", accentC: "offers.", closing: "Monetize better.", subtitle: `${brand}Studio helps creators turn attention into repeatable offers, sharper content, and healthier monetization loops.`, primaryCta: "Build your audience engine", secondaryCta: "See creator workflow", featuresAccent: "earn smarter", features: [{ title: "Audience Insights", body: "See which themes, segments, and hooks actually move your audience.", icon: "✦" }, { title: "Content Planning", body: "Generate repeatable content systems instead of starting from scratch every week.", icon: "🗓" }, { title: "Offer Builder", body: "Package products, services, or memberships around proven audience demand.", icon: "◎" }, { title: "Revenue Analytics", body: "Track conversion from content to email to purchase with less guesswork.", icon: "↗" }] } };
  if (archetype === "education") return { themeKey: "emerald", screens: ["Learning landing", "Student onboarding", "Lesson path", "Progress report", "Cohort analytics"], appNavigation: ["Home", "Courses", "Progress", "Community", "Settings"], dataModel: ["users", "courses", "lessons", "enrollments", "progress_events", "cohorts"], branding: { ...defaults.branding, name: `${brand}Academy`, badge: "AI-Powered Learning Platform", headlineA: "Learn faster.", accentB: "Stay", accentC: "engaged.", closing: "Finish stronger.", subtitle: `${brand}Academy turns knowledge into guided progress, clearer milestones, and higher completion rates.`, primaryCta: "Start learning", secondaryCta: "See the curriculum", featuresAccent: "teach better", features: [{ title: "Guided Paths", body: "Turn complex topics into clear milestone-based learning journeys.", icon: "⇢" }, { title: "Adaptive Lessons", body: "Show the right next lesson based on intent, progress, and friction signals.", icon: "✦" }, { title: "Progress Reports", body: "Help students and instructors understand momentum, gaps, and wins.", icon: "↗" }, { title: "Cohort Signals", body: "Track completion, participation, and retention at the cohort level.", icon: "◎" }] } };
  if (archetype === "health") return { themeKey: "emerald", screens: ["Health landing", "Patient onboarding", "Care plan", "Progress summary", "Care analytics"], appNavigation: ["Home", "Plan", "Check-ins", "Progress", "Settings"], dataModel: ["users", "care_plans", "checkins", "habits", "progress_events", "coach_notes"], branding: { ...defaults.branding, name: `${brand}Care`, badge: "AI-Powered Health Journey", headlineA: "Support change.", accentB: "Guide", accentC: "progress.", closing: "Build consistency.", subtitle: `${brand}Care helps people stay consistent with personalized guidance, progress visibility, and supportive nudges.`, primaryCta: "Start your plan", secondaryCta: "See the journey", featuresAccent: "care better", features: [{ title: "Guided Onboarding", body: "Capture goals, context, and constraints without overwhelming the user.", icon: "♡" }, { title: "Personalized Plan", body: "Turn intent into a realistic plan with milestones and supportive check-ins.", icon: "✦" }, { title: "Progress Tracking", body: "Show consistency, streaks, and outcome progress in a motivating way.", icon: "↗" }, { title: "Coach Visibility", body: "Surface the right signals for coaching, follow-up, and retention.", icon: "◎" }] } };
  if (archetype === "fintech") return { themeKey: "violet", screens: ["Finance landing", "Account onboarding", "Money dashboard", "Insights", "Forecast analytics"], appNavigation: ["Overview", "Accounts", "Insights", "Forecasts", "Settings"], dataModel: ["users", "accounts", "transactions", "insights", "forecasts", "alerts"], branding: { ...defaults.branding, name: `${brand}Flow`, badge: "AI-Powered Finance Copilot", headlineA: "Understand money.", accentB: "Spot", accentC: "patterns.", closing: "Act sooner.", subtitle: `${brand}Flow turns financial activity into clear guidance, useful forecasts, and faster decisions.`, primaryCta: "See your cash flow", secondaryCta: "Explore insights", featuresAccent: "manage better", features: [{ title: "Unified Overview", body: "See balances, movement, and financial priorities at a glance.", icon: "▣" }, { title: "Insight Engine", body: "Turn transactions into categories, anomalies, and decision-ready signals.", icon: "✦" }, { title: "Forecasting", body: "Anticipate short-term cash flow and upcoming pressure points.", icon: "↗" }, { title: "Smart Alerts", body: "Receive the right alert when spending, runway, or risk shifts.", icon: "◔" }] } };
  if (archetype === "recruiting") return { themeKey: "violet", screens: ["Talent landing", "Company onboarding", "Candidate pipeline", "Match detail", "Hiring analytics"], appNavigation: ["Home", "Candidates", "Matches", "Pipeline", "Reports"], dataModel: ["users", "jobs", "candidates", "matches", "interviews", "pipeline_events"], branding: { ...defaults.branding, name: `${brand}Hire`, badge: "AI-Powered Hiring Workflow", headlineA: "Find talent.", accentB: "Review", accentC: "faster.", closing: "Hire better.", subtitle: `${brand}Hire helps teams move from sourcing to shortlist with less noise and better signal.`, primaryCta: "Start hiring", secondaryCta: "See hiring flow", featuresAccent: "hire faster", features: [{ title: "Candidate Matching", body: "Prioritize candidates using structured fit rather than noisy resumes alone.", icon: "◎" }, { title: "Pipeline Clarity", body: "See which roles are moving, blocked, or losing momentum.", icon: "↗" }, { title: "Interview Prep", body: "Generate focused interview angles from role requirements and candidate profiles.", icon: "✦" }, { title: "Hiring Reports", body: "Track response rate, pass-through rate, and time-to-fill in one place.", icon: "▣" }] } };
  if (archetype === "ecommerce") return { themeKey: "amber", screens: ["Store landing", "Shopper onboarding", "Product discovery", "Checkout summary", "Store analytics"], appNavigation: ["Home", "Catalog", "Cart", "Orders", "Profile"], dataModel: ["users", "products", "collections", "carts", "orders", "events"], branding: { ...defaults.branding, name: `${brand}Shop`, badge: "AI-Powered Commerce Layer", headlineA: "Show products.", accentB: "Increase", accentC: "conversion.", closing: "Grow repeat sales.", subtitle: `${brand}Shop improves discovery, merchandising, and post-purchase experience so the store converts more cleanly.`, primaryCta: "Shop smarter", secondaryCta: "Browse collections", featuresAccent: "sell better", features: [{ title: "Smarter Discovery", body: "Help shoppers find the right product faster with cleaner navigation and relevance.", icon: "⌕" }, { title: "Merchandising", body: "Highlight the right products, bundles, and collections for more conversion.", icon: "◎" }, { title: "Checkout Flow", body: "Reduce friction with clearer cart, shipping, and purchase states.", icon: "✓" }, { title: "Store Analytics", body: "See which collections, pages, and offers actually move revenue.", icon: "↗" }] } };
  return defaults;
}

function buildStack(archetype: MvpArchetype) { const base = ["Next.js App Router", "Tailwind UI", "Vercel deployment", "PostHog analytics"]; if (archetype === "marketplace") return [...base, "Supabase Auth + Postgres", "Resend", "Stripe"]; if (archetype === "creator") return [...base, "Supabase Auth + Postgres", "Resend", "Media storage"]; if (archetype === "education") return [...base, "Supabase Auth + Postgres", "Resend", "Progress tracking"]; if (archetype === "health") return [...base, "Supabase Auth + Postgres", "Resend", "Secure care notes"]; if (archetype === "fintech") return [...base, "Supabase Auth + Postgres", "Resend", "Financial insights layer"]; if (archetype === "recruiting") return [...base, "Supabase Auth + Postgres", "Resend", "Candidate scoring"]; if (archetype === "ecommerce") return [...base, "Supabase Auth + Postgres", "Stripe", "Resend"]; return [...base, "Supabase Auth + Postgres", "Resend"]; }
function buildIntegrations(archetype: MvpArchetype) { const base = ["Supabase for auth, data, and storage", "PostHog for activation and funnel analytics", "Resend for transactional email"]; if (archetype === "agency") return [...base, "Lead source enrichment"]; if (archetype === "marketplace") return [...base, "Payments and booking sync"]; if (archetype === "creator") return [...base, "Audience and offer sync"]; if (archetype === "education") return [...base, "Lesson progress sync"]; if (archetype === "fintech") return [...base, "Cash flow insights connector"]; if (archetype === "recruiting") return [...base, "ATS-style pipeline sync"]; if (archetype === "ecommerce") return [...base, "Catalog and order sync"]; return base; }
function buildRoadmap(archetype: MvpArchetype) { const common = ["Day 1–2: define schema, auth, and project creation flow", "Day 3–4: build onboarding and the first core workflow", "Day 5–6: implement success state and progression logic", "Day 7–8: add analytics and event tracking", "Day 9–10: wire onboarding and lifecycle email", "Day 11–12: polish UI, copy, and empty states", "Day 13–14: QA, deploy, and invite first real users"]; if (archetype === "agency") return [...common.slice(0, 2), "Day 5–6: implement lead feed and proposal draft flow", ...common.slice(3)]; if (archetype === "marketplace") return [...common.slice(0, 2), "Day 5–6: implement listing detail, match flow, and trust layer", ...common.slice(3)]; if (archetype === "education") return [...common.slice(0, 2), "Day 5–6: implement lesson progress and milestone summary", ...common.slice(3)]; return common; }
function toBrandName(idea: string) { const words = idea.replace(/[^a-zA-Z0-9 ]/g, " ").split(/\s+/).filter(Boolean).slice(0, 2); if (words.length === 0) return "BuildlyPilot"; return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(""); }
function normalizeOutcome(value: string) { return value.replace(/^help\s+/i, "").replace(/\.$/, ""); }
