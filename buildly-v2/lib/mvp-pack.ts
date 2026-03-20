import type { LocalProject, MvpBrief, ProjectDecision, ProjectSignal } from "./local-demo";
import { themePresetToThemeKey } from "./buildly-os";

export type MvpArchetype = "agency" | "b2b_saas" | "marketplace" | "creator" | "education" | "health" | "fintech" | "recruiting" | "ecommerce" | "consumer";
export type MvpThemeKey = "cyan" | "violet" | "emerald" | "amber" | "indigo" | "rose";
export type MvpFeatureCard = { title: string; body: string; icon: string };
export type MvpBranding = { name: string; badge: string; headlineA: string; accentB: string; accentC: string; closing: string; subtitle: string; primaryCta: string; secondaryCta: string; featuresTitle: string; featuresAccent: string; featuresSubtitle: string; features: MvpFeatureCard[]; footerTitle: string; footerSubtitle: string; footerCta: string; footerNote: string };
export type MvpPack = { archetype: MvpArchetype; themeKey: MvpThemeKey; productOneLiner: string; targetUser: string; coreOutcome: string; userStories: string[]; screens: string[]; appNavigation: string[]; dataModel: string[]; stack: string[]; integrations: string[]; roadmap14Days: string[]; buildPrompt: string; prdMarkdown: string; branding: MvpBranding };
type ArchetypeConfig = { themeKey: MvpThemeKey; screens: string[]; appNavigation: string[]; dataModel: string[]; branding: MvpBranding };

type B2BMode = "sales" | "ops" | "analytics" | "support";
type ConsumerMode = "assistant" | "planner" | "community" | "general";

export function buildMvpPack(input: { project: LocalProject; signal: ProjectSignal; decision: ProjectDecision; brief: MvpBrief }): MvpPack {
  const { project, signal, decision, brief } = input;
  const targetUser = project.input.icp;
  const coreOutcome = normalizeOutcome(project.input.value);
  const text = `${project.input.idea} ${targetUser} ${coreOutcome}`.toLowerCase();
  const winningAngle = signal.bestVariant?.headline || project.result.generatedCopy.headline;
  const archetype = detectArchetype(project.input.idea, targetUser, coreOutcome);
  const config = getArchetypeConfig(archetype, project.input.idea, targetUser, coreOutcome, text);
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
    `## Archetype`, archetype,
    "",
    `## Theme`, themeKey,
    "",
    `## Theme preset`, project.config?.themePreset || "default",
    "",
    `## Build origin`, project.config?.buildOrigin || "manual",
    "",
    `## One-liner`, productOneLiner,
    "",
    `## Why now`, `${decision.label}. Validation shows ${signal.totalLeads} leads and ${signal.conversion}% conversion from current traffic.`,
    "",
    `## Winning angle`, winningAngle,
    "",
    `## Brand direction`, `- Badge: ${config.branding.badge}`, `- Primary CTA: ${config.branding.primaryCta}`, `- Secondary CTA: ${config.branding.secondaryCta}`,
    "",
    `## Must build now`, ...brief.features.map((item) => `- ${item}`),
    "",
    `## Archetype navigation`, ...config.appNavigation.map((item) => `- ${item}`),
    "",
    `## Screens`, ...config.screens.map((item) => `- ${item}`),
    "",
    `## Data model`, ...config.dataModel.map((item) => `- ${item}`),
    "",
    `## User stories`, ...userStories.map((item) => `- ${item}`),
    "",
    `## Recommended stack`, ...stack.map((item) => `- ${item}`),
    "",
    `## Integrations`, ...integrations.map((item) => `- ${item}`),
    "",
    `## Knowledge`, knowledge || "None provided.",
    "",
    `## 14-day roadmap`, ...roadmap14Days.map((item) => `- ${item}`),
    "",
    `## Builder prompt`, buildPrompt,
  ].join("\n");

  return { archetype, themeKey, productOneLiner, targetUser, coreOutcome, userStories, screens: config.screens, appNavigation: config.appNavigation, dataModel: config.dataModel, stack, integrations, roadmap14Days, buildPrompt, prdMarkdown, branding: config.branding };
}

function detectArchetype(idea: string, icp: string, value: string): MvpArchetype {
  const text = `${idea} ${icp} ${value}`.toLowerCase();
  const scores: Record<MvpArchetype, number> = {
    agency: countMatches(text, ["agency","freelance","freelancer","designer","proposal","client","outreach","cold email","lead gen","portfolio"]),
    b2b_saas: countMatches(text, ["saas","b2b","ops","operation","workflow","automation","dashboard","reporting","crm","pipeline","backoffice","admin","team"]),
    marketplace: countMatches(text, ["marketplace","listing","vendor","seller","buyer","booking","rental","matchmaking","directory","inventory of providers"]),
    creator: countMatches(text, ["creator","newsletter","audience","content","social media","ugc","influencer","community-led","membership"]),
    education: countMatches(text, ["course","coach","training","learn","student","teacher","academy","cohort","lesson","tutoring"]),
    health: countMatches(text, ["health","medical","clinic","patient","therapy","fitness","nutrition","wellness","sleep","mental health","habit"]),
    fintech: countMatches(text, ["finance","fintech","accounting","invoice","cash flow","bank","budget","expense","billing","payments","revenue forecasting"]),
    recruiting: countMatches(text, ["recruit","hiring","candidate","talent","job board","interview","resume","applicant","sourcing"]),
    ecommerce: countMatches(text, ["shop","store","ecommerce","commerce","product catalog","cart","checkout","sku","brand","merchandising"]),
    consumer: countMatches(text, ["app","consumer","mobile","community","planner","assistant","habit","daily","personal"]),
  };
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0] as [MvpArchetype, number];
  if (best && best[1] > 0) return best[0];
  return "consumer";
}

function getArchetypeConfig(archetype: MvpArchetype, idea: string, targetUser: string, coreOutcome: string, text: string): ArchetypeConfig {
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

  if (archetype === "agency") return {
    themeKey: "cyan",
    screens: ["Landing page", "Client onboarding", "Lead discovery", "Proposal builder", "Pipeline analytics"],
    appNavigation: ["Dashboard", "Leads", "Proposals", "Pipeline", "Settings"],
    dataModel: ["users", "leads", "proposals", "campaigns", "pipeline_events", "clients"],
    branding: {
      name: "ProposalPilot",
      badge: "AI-Powered Client Acquisition",
      headlineA: "Find clients.",
      accentB: "Send",
      accentC: "proposals.",
      closing: "Close deals.",
      subtitle: "The AI assistant that finds high-quality leads, writes personalized proposals, and automates follow-ups — so you can focus on your craft.",
      primaryCta: "Start finding clients",
      secondaryCta: "See how it works",
      featuresTitle: "Everything you need to",
      featuresAccent: "land more clients",
      featuresSubtitle: "Stop cold-emailing into the void. Let AI handle the grind while you do what you love.",
      features: [
        { title: "Smart Lead Discovery", body: "Find prospects who already match your niche and buying intent.", icon: "⌕" },
        { title: "Proposal Generator", body: "Draft personalized proposals from your offer, portfolio, and target profile.", icon: "📄" },
        { title: "Follow-Up Automation", body: "Keep momentum with tasteful reminders and pipeline-aware outreach.", icon: "◔" },
        { title: "Pipeline Analytics", body: "Track outreach, reply rate, and close rate from first contact to signed deal.", icon: "↗" },
      ],
      footerTitle: "Ready to stop chasing clients?",
      footerSubtitle: "Join independent operators landing more deals with less manual outreach.",
      footerCta: "Get started free",
      footerNote: "© 2026 ProposalPilot. Generated by Buildly.",
    },
  };

  if (archetype === "b2b_saas") return buildB2BConfig(defaults, brand, targetUser, coreOutcome, text);
  if (archetype === "consumer") return buildConsumerConfig(defaults, brand, targetUser, coreOutcome, text);

  if (archetype === "marketplace") return { themeKey: "amber", screens: ["Marketplace landing", "Buyer onboarding", "Listings feed", "Listing detail", "Trust analytics"], appNavigation: ["Home", "Browse", "Matches", "Orders", "Profile"], dataModel: ["users", "listings", "matches", "orders", "reviews", "messages"], branding: { ...defaults.branding, name: `${brand}Match`, badge: "AI-Powered Marketplace", headlineA: "Match demand.", accentB: "Surface", accentC: "supply.", closing: "Create trust.", subtitle: `${brand}Match helps both sides of the marketplace discover the right fit faster, with higher trust and less search friction.`, primaryCta: "Explore listings", secondaryCta: "How matching works", featuresAccent: "match faster", features: [{ title: "Smart Matching", body: "Recommend the best listing or provider based on intent and constraints.", icon: "◎" }, { title: "Verified Profiles", body: "Increase confidence with social proof, ratings, and structured trust signals.", icon: "✓" }, { title: "Availability Engine", body: "Show real availability and fit, not just static catalog pages.", icon: "◷" }, { title: "Conversion Analytics", body: "Track inquiry-to-booking conversion across the full marketplace flow.", icon: "↗" }] } };
  if (archetype === "creator") return { themeKey: "rose", screens: ["Creator landing", "Audience onboarding", "Content workspace", "Offer page", "Audience analytics"], appNavigation: ["Home", "Audience", "Content", "Offers", "Analytics"], dataModel: ["users", "audience_segments", "content_items", "offers", "events", "sales"], branding: { ...defaults.branding, name: `${brand}Studio`, badge: "AI-Powered Creator Engine", headlineA: "Grow audience.", accentB: "Package", accentC: "offers.", closing: "Monetize better.", subtitle: `${brand}Studio helps creators turn attention into repeatable offers, sharper content, and healthier monetization loops.`, primaryCta: "Build your audience engine", secondaryCta: "See creator workflow", featuresAccent: "earn smarter", features: [{ title: "Audience Insights", body: "See which themes, segments, and hooks actually move your audience.", icon: "✦" }, { title: "Content Planning", body: "Generate repeatable content systems instead of starting from scratch every week.", icon: "🗓" }, { title: "Offer Builder", body: "Package products, services, or memberships around proven audience demand.", icon: "◎" }, { title: "Revenue Analytics", body: "Track conversion from content to email to purchase with less guesswork.", icon: "↗" }] } };
  if (archetype === "education") return { themeKey: "emerald", screens: ["Learning landing", "Student onboarding", "Lesson path", "Progress report", "Cohort analytics"], appNavigation: ["Home", "Courses", "Progress", "Community", "Settings"], dataModel: ["users", "courses", "lessons", "enrollments", "progress_events", "cohorts"], branding: { ...defaults.branding, name: `${brand}Academy`, badge: "AI-Powered Learning Platform", headlineA: "Learn faster.", accentB: "Stay", accentC: "engaged.", closing: "Finish stronger.", subtitle: `${brand}Academy turns knowledge into guided progress, clearer milestones, and higher completion rates.`, primaryCta: "Start learning", secondaryCta: "See the curriculum", featuresAccent: "teach better", features: [{ title: "Guided Paths", body: "Turn complex topics into clear milestone-based learning journeys.", icon: "⇢" }, { title: "Adaptive Lessons", body: "Show the right next lesson based on intent, progress, and friction signals.", icon: "✦" }, { title: "Progress Reports", body: "Help students and instructors understand momentum, gaps, and wins.", icon: "↗" }, { title: "Cohort Signals", body: "Track completion, participation, and retention at the cohort level.", icon: "◎" }] } };
  if (archetype === "health") return { themeKey: "emerald", screens: ["Health landing", "Patient onboarding", "Care plan", "Progress summary", "Care analytics"], appNavigation: ["Home", "Plan", "Check-ins", "Progress", "Settings"], dataModel: ["users", "care_plans", "checkins", "habits", "progress_events", "coach_notes"], branding: { ...defaults.branding, name: `${brand}Care`, badge: "AI-Powered Health Journey", headlineA: "Support change.", accentB: "Guide", accentC: "progress.", closing: "Build consistency.", subtitle: `${brand}Care helps people stay consistent with personalized guidance, progress visibility, and supportive nudges.`, primaryCta: "Start your plan", secondaryCta: "See the journey", featuresAccent: "care better", features: [{ title: "Guided Onboarding", body: "Capture goals, context, and constraints without overwhelming the user.", icon: "♡" }, { title: "Personalized Plan", body: "Turn intent into a realistic plan with milestones and supportive check-ins.", icon: "✦" }, { title: "Progress Tracking", body: "Show consistency, streaks, and outcome progress in a motivating way.", icon: "↗" }, { title: "Coach Visibility", body: "Surface the right signals for coaching, follow-up, and retention.", icon: "◎" }] } };
  if (archetype === "fintech") return { themeKey: "violet", screens: ["Finance landing", "Account onboarding", "Money dashboard", "Insights", "Forecast analytics"], appNavigation: ["Overview", "Accounts", "Insights", "Forecasts", "Settings"], dataModel: ["users", "accounts", "transactions", "insights", "forecasts", "alerts"], branding: { ...defaults.branding, name: `${brand}Flow`, badge: "AI-Powered Finance Copilot", headlineA: "Understand money.", accentB: "Spot", accentC: "patterns.", closing: "Act sooner.", subtitle: `${brand}Flow turns financial activity into clear guidance, useful forecasts, and faster decisions.`, primaryCta: "See your cash flow", secondaryCta: "Explore insights", featuresAccent: "manage better", features: [{ title: "Unified Overview", body: "See balances, movement, and financial priorities at a glance.", icon: "▣" }, { title: "Insight Engine", body: "Turn transactions into categories, anomalies, and decision-ready signals.", icon: "✦" }, { title: "Forecasting", body: "Anticipate short-term cash flow and upcoming pressure points.", icon: "↗" }, { title: "Smart Alerts", body: "Receive the right alert when spending, runway, or risk shifts.", icon: "◔" }] } };
  if (archetype === "recruiting") return { themeKey: "violet", screens: ["Talent landing", "Company onboarding", "Candidate pipeline", "Match detail", "Hiring analytics"], appNavigation: ["Home", "Candidates", "Matches", "Pipeline", "Reports"], dataModel: ["users", "jobs", "candidates", "matches", "interviews", "pipeline_events"], branding: { ...defaults.branding, name: `${brand}Hire`, badge: "AI-Powered Hiring Workflow", headlineA: "Find talent.", accentB: "Review", accentC: "faster.", closing: "Hire better.", subtitle: `${brand}Hire helps teams move from sourcing to shortlist with less noise and better signal.`, primaryCta: "Start hiring", secondaryCta: "See hiring flow", featuresAccent: "hire faster", features: [{ title: "Candidate Matching", body: "Prioritize candidates using structured fit rather than noisy resumes alone.", icon: "◎" }, { title: "Pipeline Clarity", body: "See which roles are moving, blocked, or losing momentum.", icon: "↗" }, { title: "Interview Prep", body: "Generate focused interview angles from role requirements and candidate profiles.", icon: "✦" }, { title: "Hiring Reports", body: "Track response rate, pass-through rate, and time-to-fill in one place.", icon: "▣" }] } };
  if (archetype === "ecommerce") return { themeKey: "amber", screens: ["Store landing", "Shopper onboarding", "Product discovery", "Checkout summary", "Store analytics"], appNavigation: ["Home", "Catalog", "Cart", "Orders", "Profile"], dataModel: ["users", "products", "collections", "carts", "orders", "events"], branding: { ...defaults.branding, name: `${brand}Shop`, badge: "AI-Powered Commerce Layer", headlineA: "Show products.", accentB: "Increase", accentC: "conversion.", closing: "Grow repeat sales.", subtitle: `${brand}Shop improves discovery, merchandising, and post-purchase experience so the store converts more cleanly.`, primaryCta: "Shop smarter", secondaryCta: "Browse collections", featuresAccent: "sell better", features: [{ title: "Smarter Discovery", body: "Help shoppers find the right product faster with cleaner navigation and relevance.", icon: "⌕" }, { title: "Merchandising", body: "Highlight the right products, bundles, and collections for more conversion.", icon: "◎" }, { title: "Checkout Flow", body: "Reduce friction with clearer cart, shipping, and purchase states.", icon: "✓" }, { title: "Store Analytics", body: "See which collections, pages, and offers actually move revenue.", icon: "↗" }] } };
  return defaults;
}

function buildB2BConfig(defaults: ArchetypeConfig, brand: string, targetUser: string, coreOutcome: string, text: string): ArchetypeConfig {
  const mode = detectB2BMode(text);
  if (mode === "sales") return { themeKey: "cyan", screens: ["Landing page", "Sales team onboarding", "Pipeline board", "Deal workspace", "Revenue analytics"], appNavigation: ["Overview", "Accounts", "Pipeline", "Playbooks", "Reports"], dataModel: ["users", "accounts", "deals", "playbooks", "activities", "revenue_events"], branding: { ...defaults.branding, name: `${brand}Revenue`, badge: "AI-Powered Revenue Workflow", headlineA: "Run pipeline.", accentB: "Close", accentC: "deals.", closing: "Move revenue.", subtitle: `${brand}Revenue helps ${targetUser.toLowerCase()} ${coreOutcome.toLowerCase()} with a clearer pipeline, faster deal execution, and better forecasting.`, primaryCta: "Open pipeline", secondaryCta: "See sales workflow", featuresAccent: "close faster", features: [{ title: "Pipeline Board", body: "See deals, stages, blockers, and next actions in one view.", icon: "◎" }, { title: "Account Workspace", body: "Keep stakeholder context, notes, and deal movement together.", icon: "▣" }, { title: "Playbook Automation", body: "Trigger the right follow-up and next step without manual overhead.", icon: "⚙" }, { title: "Revenue Analytics", body: "Track deal flow, win rate, and forecast movement over time.", icon: "↗" }] } };
  if (mode === "analytics") return { themeKey: "indigo", screens: ["Landing page", "Workspace onboarding", "Metrics dashboard", "Insight explorer", "Executive analytics"], appNavigation: ["Overview", "Metrics", "Insights", "Reports", "Settings"], dataModel: ["users", "workspaces", "metrics", "insights", "reports", "events"], branding: { ...defaults.branding, name: `${brand}Insights`, badge: "AI-Powered Analytics Layer", headlineA: "See patterns.", accentB: "Turn", accentC: "metrics into decisions.", closing: "Act earlier.", subtitle: `${brand}Insights helps ${targetUser.toLowerCase()} ${coreOutcome.toLowerCase()} by turning noisy metrics into clear decisions and action.`, primaryCta: "Explore insights", secondaryCta: "See dashboards", featuresAccent: "see clearer", features: [{ title: "Metrics Dashboard", body: "Turn raw numbers into a clean operational picture.", icon: "▣" }, { title: "Insight Explorer", body: "Move from anomaly to explanation faster.", icon: "✦" }, { title: "Report Builder", body: "Package findings into reusable reports for teams or clients.", icon: "📄" }, { title: "Decision Signals", body: "Highlight what needs attention first.", icon: "↗" }] } };
  if (mode === "support") return { themeKey: "indigo", screens: ["Landing page", "Team onboarding", "Inbox workspace", "Resolution view", "Support analytics"], appNavigation: ["Overview", "Inbox", "Customers", "Resolutions", "Reports"], dataModel: ["users", "tickets", "customers", "messages", "resolutions", "sla_events"], branding: { ...defaults.branding, name: `${brand}Support`, badge: "AI-Powered Support Workflow", headlineA: "Resolve faster.", accentB: "Prioritize", accentC: "the right tickets.", closing: "Improve service.", subtitle: `${brand}Support helps ${targetUser.toLowerCase()} ${coreOutcome.toLowerCase()} with a smarter inbox, better triage, and clearer resolution flow.`, primaryCta: "Open inbox", secondaryCta: "See support flow", featuresAccent: "resolve faster", features: [{ title: "Smart Inbox", body: "Route the right issue to the right person faster.", icon: "✉" }, { title: "Priority Triage", body: "Surface urgency, risk, and next-best action.", icon: "⚑" }, { title: "Resolution Workspace", body: "Keep context, replies, and fixes together.", icon: "▣" }, { title: "SLA Analytics", body: "Track response, resolution, and service quality.", icon: "↗" }] } };
  return { themeKey: "indigo", screens: ["Landing page", "Workspace onboarding", "Operations dashboard", "Automation builder", "Analytics"], appNavigation: ["Overview", "Workflows", "Tasks", "Reports", "Settings"], dataModel: ["users", "teams", "workflows", "tasks", "automation_runs", "events"], branding: { ...defaults.branding, name: `${brand}OS`, badge: "AI-Powered Ops Platform", headlineA: "Unify your ops.", accentB: "Automate", accentC: "execution.", closing: "Scale calmly.", subtitle: `${brand}OS gives teams a single control layer for work, automation, and visibility — without the usual operational chaos.`, primaryCta: "Start free workspace", secondaryCta: "Book demo", featuresAccent: "run smarter", features: [{ title: "Unified Dashboard", body: "See team activity, workflow health, and bottlenecks in one place.", icon: "▣" }, { title: "Automation Builder", body: "Turn repetitive handoffs into reliable flows with less manual work.", icon: "⚙" }, { title: "Team Visibility", body: "Give operators, managers, and founders the context they need to act fast.", icon: "👁" }, { title: "Performance Reports", body: "Track adoption, completion, and throughput with actionable reports.", icon: "↗" }] } };
}

function buildConsumerConfig(defaults: ArchetypeConfig, brand: string, targetUser: string, coreOutcome: string, text: string): ArchetypeConfig {
  const mode = detectConsumerMode(text);
  if (mode === "assistant") return { themeKey: "rose", screens: ["Landing page", "Personal onboarding", "Assistant workspace", "Generated result", "Usage analytics"], appNavigation: ["Home", "Assistant", "History", "Insights", "Profile"], dataModel: ["users", "sessions", "prompts", "outputs", "favorites", "events"], branding: { ...defaults.branding, name: `${brand}Assist`, badge: "AI-Powered Personal Assistant", headlineA: "Ask once.", accentB: "Get", accentC: "clarity instantly.", closing: "Come back daily.", subtitle: `${brand}Assist helps ${targetUser.toLowerCase()} ${coreOutcome.toLowerCase()} through a fast assistant-style experience that feels useful from the first session.`, primaryCta: "Try the assistant", secondaryCta: "See example results", featuresAccent: "get help faster", features: [{ title: "Assistant Workspace", body: "Move from input to useful output in one focused screen.", icon: "✦" }, { title: "Saved Results", body: "Keep the most helpful outputs easy to revisit.", icon: "📌" }, { title: "Fast Iteration", body: "Adjust prompts or actions without restarting the experience.", icon: "◔" }, { title: "Usage Signals", body: "Track what gets value and what gets ignored.", icon: "↗" }] } };
  if (mode === "planner") return { themeKey: "rose", screens: ["Landing page", "Goal onboarding", "Planner board", "Progress summary", "Habit analytics"], appNavigation: ["Home", "Plan", "Today", "Progress", "Settings"], dataModel: ["users", "plans", "tasks", "streaks", "progress_events", "reminders"], branding: { ...defaults.branding, name: `${brand}Plan`, badge: "AI-Powered Personal Planner", headlineA: "Plan clearly.", accentB: "Stay", accentC: "consistent.", closing: "See progress.", subtitle: `${brand}Plan helps ${targetUser.toLowerCase()} ${coreOutcome.toLowerCase()} through a guided daily planning and progress loop.`, primaryCta: "Start planning", secondaryCta: "See the flow", featuresAccent: "stay on track", features: [{ title: "Planner Board", body: "Turn intent into a clear daily or weekly plan.", icon: "🗓" }, { title: "Today View", body: "Focus on the next right action instead of the full backlog.", icon: "☼" }, { title: "Progress Tracking", body: "Visualize streaks, completion, and momentum.", icon: "↗" }, { title: "Reminders", body: "Bring users back at the right moment.", icon: "⏰" }] } };
  if (mode === "community") return { themeKey: "rose", screens: ["Landing page", "Profile onboarding", "Community feed", "Group detail", "Engagement analytics"], appNavigation: ["Home", "Feed", "Groups", "Messages", "Profile"], dataModel: ["users", "profiles", "posts", "groups", "messages", "engagement_events"], branding: { ...defaults.branding, name: `${brand}Circle`, badge: "AI-Powered Community Experience", headlineA: "Find your people.", accentB: "Share", accentC: "what matters.", closing: "Stay engaged.", subtitle: `${brand}Circle helps ${targetUser.toLowerCase()} ${coreOutcome.toLowerCase()} through community, belonging, and repeat interaction.`, primaryCta: "Join the community", secondaryCta: "See the feed", featuresAccent: "engage deeper", features: [{ title: "Community Feed", body: "Keep the most relevant conversations front and center.", icon: "◎" }, { title: "Groups", body: "Create focused spaces around topics or goals.", icon: "◉" }, { title: "Messages", body: "Turn interaction into direct connection.", icon: "✉" }, { title: "Engagement Analytics", body: "See what keeps people returning.", icon: "↗" }] } };
  return defaults;
}

function detectB2BMode(text: string): B2BMode {
  const sales = countMatches(text, ["sales","crm","lead","prospect","deal","revenue","outreach","pipeline"]);
  const analytics = countMatches(text, ["analytics","bi","reporting","dashboard","metric","insight","data"]);
  const support = countMatches(text, ["support","ticket","help desk","customer service","inbox","resolution","sla"]);
  const ops = countMatches(text, ["ops","workflow","automation","approval","handoff","task","backoffice"]);
  const ranked = ([ ["sales", sales], ["analytics", analytics], ["support", support], ["ops", ops] ] as const).sort((a, b) => b[1] - a[1]);
  return ranked[0][1] > 0 ? ranked[0][0] : "ops";
}

function detectConsumerMode(text: string): ConsumerMode {
  const assistant = countMatches(text, ["assistant","copilot","ai companion","chat","generate","recommendation"]);
  const planner = countMatches(text, ["plan","planner","habit","routine","daily","goal","schedule","organize"]);
  const community = countMatches(text, ["community","social","group","friends","network","forum","creator community"]);
  const ranked = ([ ["assistant", assistant], ["planner", planner], ["community", community] ] as const).sort((a, b) => b[1] - a[1]);
  return ranked[0][1] > 0 ? ranked[0][0] : "general";
}

function countMatches(text: string, phrases: string[]) { return phrases.reduce((sum, phrase) => sum + (text.includes(phrase) ? 1 : 0), 0); }
function buildStack(archetype: MvpArchetype) { const base = ["Next.js App Router", "Tailwind UI", "Vercel deployment", "PostHog analytics"]; if (archetype === "marketplace") return [...base, "Supabase Auth + Postgres", "Resend", "Stripe"]; if (archetype === "creator") return [...base, "Supabase Auth + Postgres", "Resend", "Media storage"]; if (archetype === "education") return [...base, "Supabase Auth + Postgres", "Resend", "Progress tracking"]; if (archetype === "health") return [...base, "Supabase Auth + Postgres", "Resend", "Secure care notes"]; if (archetype === "fintech") return [...base, "Supabase Auth + Postgres", "Resend", "Financial insights layer"]; if (archetype === "recruiting") return [...base, "Supabase Auth + Postgres", "Resend", "Candidate scoring"]; if (archetype === "ecommerce") return [...base, "Supabase Auth + Postgres", "Stripe", "Resend"]; return [...base, "Supabase Auth + Postgres", "Resend"]; }
function buildIntegrations(archetype: MvpArchetype) { const base = ["Supabase for auth, data, and storage", "PostHog for activation and funnel analytics", "Resend for transactional email"]; if (archetype === "agency") return [...base, "Lead source enrichment"]; if (archetype === "marketplace") return [...base, "Payments and booking sync"]; if (archetype === "creator") return [...base, "Audience and offer sync"]; if (archetype === "education") return [...base, "Lesson progress sync"]; if (archetype === "fintech") return [...base, "Cash flow insights connector"]; if (archetype === "recruiting") return [...base, "ATS-style pipeline sync"]; if (archetype === "ecommerce") return [...base, "Catalog and order sync"]; return base; }
function buildRoadmap(archetype: MvpArchetype) { const common = ["Day 1–2: define schema, auth, and project creation flow", "Day 3–4: build onboarding and the first core workflow", "Day 5–6: implement success state and progression logic", "Day 7–8: add analytics and event tracking", "Day 9–10: wire onboarding and lifecycle email", "Day 11–12: polish UI, copy, and empty states", "Day 13–14: QA, deploy, and invite first real users"]; if (archetype === "agency") return [...common.slice(0, 2), "Day 5–6: implement lead feed and proposal draft flow", ...common.slice(3)]; if (archetype === "marketplace") return [...common.slice(0, 2), "Day 5–6: implement listing detail, match flow, and trust layer", ...common.slice(3)]; if (archetype === "education") return [...common.slice(0, 2), "Day 5–6: implement lesson progress and milestone summary", ...common.slice(3)]; return common; }
function toBrandName(idea: string) { const words = idea.replace(/[^a-zA-Z0-9 ]/g, " ").split(/\s+/).filter(Boolean).slice(0, 2); if (words.length === 0) return "BuildlyPilot"; return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(""); }
function normalizeOutcome(value: string) { return value.replace(/^help\s+/i, "").replace(/\.$/, ""); }
