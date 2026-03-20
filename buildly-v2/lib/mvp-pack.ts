import type { LocalProject, MvpBrief, ProjectDecision, ProjectSignal } from "./local-demo";
import { themePresetToThemeKey } from "./buildly-os";
import {
  FAMILY_TEMPLATES,
  detectProductFamily,
  type DesignLanguage,
  type NavigationPattern,
  type PagePrimitive,
  type ProductFamily,
} from "./product-families";

export type MvpArchetype =
  | "marketplace"
  | "ecommerce"
  | "fintech"
  | "education"
  | "recruiting"
  | "creator"
  | "b2b_saas"
  | "support"
  | "consumer";

export type MvpThemeKey = "cyan" | "violet" | "emerald" | "amber" | "indigo" | "rose";
export type MvpFeatureCard = { title: string; body: string; icon: string };

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
  productFamily: ProductFamily;
  designLanguage: DesignLanguage;
  navigationPattern: NavigationPattern;
  pagePrimitives: PagePrimitive[];
  trustSignals: string[];
  retentionLoop: string[];
  opsSurface: string[];
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

export function buildMvpPack(input: {
  project: LocalProject;
  signal: ProjectSignal;
  decision: ProjectDecision;
  brief: MvpBrief;
}): MvpPack {
  const { project, signal, decision, brief } = input;
  const targetUser = project.input.icp;
  const coreOutcome = normalizeOutcome(project.input.value);
  const sourceText = `${project.input.idea} ${targetUser} ${coreOutcome}`.toLowerCase();
  const productFamily = detectProductFamily(sourceText);
  const template = FAMILY_TEMPLATES[productFamily];
  const archetype = mapFamilyToArchetype(productFamily);
  const forcedTheme = themePresetToThemeKey(project.config?.themePreset || null);
  const themeKey = forcedTheme || template.defaultTheme;
  const brand = toBrandName(project.input.idea);
  const branding = buildBranding(productFamily, brand, targetUser, coreOutcome);
  const screens = template.pages.map(humanizePageName);
  const appNavigation = buildNavigation(productFamily);
  const dataModel = buildDataModel(productFamily);
  const stack = buildStack(productFamily);
  const integrations = buildIntegrations(productFamily);
  const roadmap14Days = buildRoadmap(productFamily);
  const productOneLiner = `${branding.name} helps ${targetUser.toLowerCase()} ${coreOutcome.toLowerCase()}.`;

  const userStories = [
    `As a ${targetUser.toLowerCase()}, I want a ${template.label.toLowerCase()} experience that feels credible from the first session.`,
    `As a ${targetUser.toLowerCase()}, I want discovery, trust, and the core action to be obvious and fast.`,
    `As a ${targetUser.toLowerCase()}, I want the product to guide me into the next step without confusion.`,
    `As a founder, I want the MVP to include retention loops and an ops surface from day one.`,
  ];

  const knowledge = [project.config?.workspaceKnowledge, project.config?.projectKnowledge].filter(Boolean).join("\n");
  const buildPrompt = [
    `Build an MVP for: ${project.input.idea}.`,
    `Product family: ${productFamily}.`,
    `Design language: ${template.designLanguage}.`,
    `Navigation pattern: ${template.navigation}.`,
    `Theme: ${themeKey}.`,
    `Target user: ${targetUser}.`,
    `Core outcome: ${coreOutcome}.`,
    `Current decision: ${decision.label}.`,
    `Winning angle: ${signal.bestVariant?.headline || project.result.generatedCopy.headline}.`,
    `Must-have features from validation: ${brief.features.join("; ")}.`,
    `Mandatory pages: ${template.pages.join("; ")}.`,
    `Mandatory primitives: ${template.primitives.join("; ")}.`,
    `Trust signals: ${template.trustSignals.join("; ")}.`,
    `Retention loop: ${template.retentionLoop.join("; ")}.`,
    `Ops surface: ${template.opsSurface.join("; ")}.`,
    `Navigation: ${appNavigation.join("; ")}.`,
    `Data model: ${dataModel.join("; ")}.`,
    `Stack: ${stack.join("; ")}.`,
    `Integrations: ${integrations.join("; ")}.`,
    knowledge ? `Knowledge to respect:\n${knowledge}` : "Knowledge to respect: none.",
    "Return a landing page, authenticated product shell, trust layer, core action flow, retention loops, and admin/ops views.",
  ].join("\n");

  const prdMarkdown = [
    `# ${branding.name} MVP`,
    "",
    `## Product family`,
    productFamily,
    "",
    `## Design language`,
    template.designLanguage,
    "",
    `## Theme`,
    themeKey,
    "",
    `## One-liner`,
    productOneLiner,
    "",
    `## Mandatory pages`,
    ...template.pages.map((item) => `- ${item}`),
    "",
    `## Mandatory primitives`,
    ...template.primitives.map((item) => `- ${item}`),
    "",
    `## Trust signals`,
    ...template.trustSignals.map((item) => `- ${item}`),
    "",
    `## Retention loop`,
    ...template.retentionLoop.map((item) => `- ${item}`),
    "",
    `## Ops surface`,
    ...template.opsSurface.map((item) => `- ${item}`),
    "",
    `## Screens`,
    ...screens.map((item) => `- ${item}`),
    "",
    `## Navigation`,
    ...appNavigation.map((item) => `- ${item}`),
    "",
    `## Data model`,
    ...dataModel.map((item) => `- ${item}`),
    "",
    `## User stories`,
    ...userStories.map((item) => `- ${item}`),
    "",
    `## 14-day roadmap`,
    ...roadmap14Days.map((item) => `- ${item}`),
    "",
    `## Builder prompt`,
    buildPrompt,
  ].join("\n");

  return {
    archetype,
    productFamily,
    designLanguage: template.designLanguage,
    navigationPattern: template.navigation,
    pagePrimitives: template.primitives,
    trustSignals: template.trustSignals,
    retentionLoop: template.retentionLoop,
    opsSurface: template.opsSurface,
    themeKey,
    productOneLiner,
    targetUser,
    coreOutcome,
    userStories,
    screens,
    appNavigation,
    dataModel,
    stack,
    integrations,
    roadmap14Days,
    buildPrompt,
    prdMarkdown,
    branding,
  };
}

function mapFamilyToArchetype(family: ProductFamily): MvpArchetype {
  if (family === "marketplace_booking") return "marketplace";
  if (family === "commerce_storefront" || family === "delivery_local") return "ecommerce";
  if (family === "finance_copilot") return "fintech";
  if (family === "education_path") return "education";
  if (family === "recruiting_pipeline") return "recruiting";
  if (family === "creator_membership") return "creator";
  if (family === "support_hub") return "support";
  if (family === "team_workspace") return "b2b_saas";
  return "consumer";
}

function buildBranding(family: ProductFamily, brand: string, targetUser: string, coreOutcome: string): MvpBranding {
  const map: Record<ProductFamily, MvpBranding> = {
    marketplace_booking: makeBranding({ name: `${brand}Stay`, badge: "AI-Powered Booking Marketplace", headlineA: "Search smarter.", accentB: "Book", accentC: "with confidence.", closing: "Trust every step.", subtitle: `${brand}Stay helps ${targetUser.toLowerCase()} ${coreOutcome.toLowerCase()} with richer search, trust signals, and a smoother booking flow.`, primaryCta: "Explore listings", secondaryCta: "See how booking works", featuresTitle: "Everything you need to", featuresAccent: "book with trust", featuresSubtitle: "Search, compare, message, and reserve without guesswork.", features: [{ title: "Search + filters", body: "Find the best fit using dates, categories, price, and availability.", icon: "⌕" }, { title: "Trust signals", body: "Ratings, profile quality, policies, and proof make decisions easier.", icon: "✓" }, { title: "Booking flow", body: "Move from listing detail to inquiry or reservation with less friction.", icon: "◷" }, { title: "Provider tools", body: "Hosts and providers manage listings, calendars, and messages in one place.", icon: "▣" }], footerTitle: `Ready to launch ${brand}Stay?`, footerSubtitle: "Create a marketplace experience with discovery, trust, and booking built in.", footerCta: "Start now", footerNote: `© 2026 ${brand}Stay. Generated by Buildly.` }),
    commerce_storefront: makeBranding({ name: `${brand}Shop`, badge: "AI-Powered Storefront", headlineA: "Show products.", accentB: "Increase", accentC: "conversion.", closing: "Grow repeat sales.", subtitle: `${brand}Shop helps ${targetUser.toLowerCase()} ${coreOutcome.toLowerCase()} through better merchandising, cleaner checkout, and stronger repeat purchase loops.`, primaryCta: "Shop smarter", secondaryCta: "Browse collections", featuresTitle: "Everything you need to", featuresAccent: "sell better", featuresSubtitle: "Catalog, cart, checkout, and orders in a credible commerce flow.", features: [{ title: "Catalog discovery", body: "Organize collections, product pages, and merchandising blocks for clearer browsing.", icon: "◎" }, { title: "Cart and checkout", body: "Reduce purchase friction with a cleaner cart and checkout summary.", icon: "✓" }, { title: "Order flow", body: "Make confirmation, order state, and post-purchase visibility feel real.", icon: "◔" }, { title: "Promotions", body: "Surface bundles, promo codes, and offers that support conversion.", icon: "↗" }], footerTitle: `Ready to launch ${brand}Shop?`, footerSubtitle: "Turn a generic storefront into a real buying experience.", footerCta: "Start now", footerNote: `© 2026 ${brand}Shop. Generated by Buildly.` }),
    delivery_local: makeBranding({ name: `${brand}Now`, badge: "AI-Powered Local Ordering", headlineA: "Find local.", accentB: "Order", accentC: "faster.", closing: "Track every step.", subtitle: `${brand}Now helps ${targetUser.toLowerCase()} ${coreOutcome.toLowerCase()} with faster local discovery, simpler cart flow, and clearer delivery status.`, primaryCta: "Start an order", secondaryCta: "See local options", featuresTitle: "Everything you need to", featuresAccent: "order confidently", featuresSubtitle: "Address-first search, menu flow, ETA clarity, and reorder loops.", features: [{ title: "Local discovery", body: "Search by address, availability, ratings, and price range.", icon: "⌕" }, { title: "Menu flow", body: "Show merchants, menus, variants, and cart state cleanly.", icon: "🍽" }, { title: "ETA tracking", body: "Make status, ETA, and order progress visible end to end.", icon: "◷" }, { title: "Reorder loop", body: "Bring users back through favorites, promos, and quick reorder.", icon: "↺" }], footerTitle: `Ready to launch ${brand}Now?`, footerSubtitle: "Create a credible local ordering experience with speed and visibility.", footerCta: "Start now", footerNote: `© 2026 ${brand}Now. Generated by Buildly.` }),
    finance_copilot: makeBranding({ name: `${brand}Flow`, badge: "AI-Powered Finance Copilot", headlineA: "Understand money.", accentB: "Spot", accentC: "patterns.", closing: "Act sooner.", subtitle: `${brand}Flow helps ${targetUser.toLowerCase()} ${coreOutcome.toLowerCase()} with dashboards, budgets, cash flow, and useful alerts.`, primaryCta: "See your dashboard", secondaryCta: "Explore insights", featuresTitle: "Everything you need to", featuresAccent: "manage better", featuresSubtitle: "Accounts, analytics, wealth visibility, and retention via financial alerts.", features: [{ title: "Unified dashboard", body: "Balances, categories, budgets, and recent movement in one overview.", icon: "▣" }, { title: "Cash flow", body: "Make inflow, outflow, and runway easier to interpret.", icon: "↗" }, { title: "Alerts", body: "Bring users back with the right anomaly or budget signal.", icon: "⚑" }, { title: "Wealth view", body: "Aggregate assets, liabilities, and progress into a clearer picture.", icon: "◎" }], footerTitle: `Ready to launch ${brand}Flow?`, footerSubtitle: "Build a finance assistant that feels useful and trustworthy from day one.", footerCta: "Start now", footerNote: `© 2026 ${brand}Flow. Generated by Buildly.` }),
    education_path: makeBranding({ name: `${brand}Academy`, badge: "AI-Powered Learning Path", headlineA: "Guide learning.", accentB: "Build", accentC: "momentum.", closing: "Finish stronger.", subtitle: `${brand}Academy helps ${targetUser.toLowerCase()} ${coreOutcome.toLowerCase()} through structured paths, lessons, milestones, and clear progress.`, primaryCta: "Start learning", secondaryCta: "See the curriculum", featuresTitle: "Everything you need to", featuresAccent: "teach better", featuresSubtitle: "Curriculum, lesson flow, progress, and milestones in one learning product.", features: [{ title: "Curriculum path", body: "Turn content into a clear journey instead of isolated lessons.", icon: "⇢" }, { title: "Lesson player", body: "Move learners smoothly from one module to the next.", icon: "▶" }, { title: "Progress tracking", body: "Keep motivation high with milestones, streaks, and completion clarity.", icon: "↗" }, { title: "Credentials", body: "Add certificates and proof of progress as a commitment layer.", icon: "◎" }], footerTitle: `Ready to launch ${brand}Academy?`, footerSubtitle: "Build a learning product with guided structure and visible progression.", footerCta: "Start now", footerNote: `© 2026 ${brand}Academy. Generated by Buildly.` }),
    recruiting_pipeline: makeBranding({ name: `${brand}Hire`, badge: "AI-Powered Recruiting Pipeline", headlineA: "Find talent.", accentB: "Track", accentC: "every stage.", closing: "Hire better.", subtitle: `${brand}Hire helps ${targetUser.toLowerCase()} ${coreOutcome.toLowerCase()} with job discovery, candidate pipeline, status tracking, and recruiter workflows.`, primaryCta: "Start hiring", secondaryCta: "See the pipeline", featuresTitle: "Everything you need to", featuresAccent: "hire faster", featuresSubtitle: "Jobs, candidate signal, pipeline stages, and recruiter-side operations.", features: [{ title: "Job tracker", body: "Save roles, track applications, and make next steps visible.", icon: "▣" }, { title: "Candidate queue", body: "Prioritize stronger candidates with less noise.", icon: "◎" }, { title: "Status updates", body: "Keep candidates and recruiters aligned on the pipeline state.", icon: "↗" }, { title: "ATS-ready flow", body: "Add recruiter-side notes, stages, and handoff-friendly structure.", icon: "⚙" }], footerTitle: `Ready to launch ${brand}Hire?`, footerSubtitle: "Create a recruiting product with real pipeline credibility.", footerCta: "Start now", footerNote: `© 2026 ${brand}Hire. Generated by Buildly.` }),
    creator_membership: makeBranding({ name: `${brand}Circle`, badge: "AI-Powered Creator Membership", headlineA: "Grow attention.", accentB: "Convert", accentC: "members.", closing: "Keep them engaged.", subtitle: `${brand}Circle helps ${targetUser.toLowerCase()} ${coreOutcome.toLowerCase()} through memberships, gated content, community chat, and recurring engagement loops.`, primaryCta: "Start your community", secondaryCta: "See membership flow", featuresTitle: "Everything you need to", featuresAccent: "grow membership", featuresSubtitle: "Tiers, gated access, creator feed, and community loops in one product.", features: [{ title: "Membership tiers", body: "Package clear benefits and access by level.", icon: "◎" }, { title: "Gated content", body: "Create a stronger reason to subscribe and stay subscribed.", icon: "✦" }, { title: "Community chat", body: "Add belonging and direct interaction beyond the content alone.", icon: "✉" }, { title: "Retention loop", body: "Use digests, new posts, and unlocks to drive repeat visits.", icon: "↗" }], footerTitle: `Ready to launch ${brand}Circle?`, footerSubtitle: "Turn audience attention into recurring membership and community energy.", footerCta: "Start now", footerNote: `© 2026 ${brand}Circle. Generated by Buildly.` }),
    team_workspace: makeBranding({ name: `${brand}Workspace`, badge: "AI-Powered Team Workspace", headlineA: "Align teams.", accentB: "Ship", accentC: "with context.", closing: "Work faster.", subtitle: `${brand}Workspace helps ${targetUser.toLowerCase()} ${coreOutcome.toLowerCase()} with channels, tasks, workflows, huddles, and AI-assisted context.`, primaryCta: "Open workspace", secondaryCta: "See collaboration flow", featuresTitle: "Everything you need to", featuresAccent: "collaborate better", featuresSubtitle: "Channels, projects, workflows, and AI search in one workspace shell.", features: [{ title: "Channels + threads", body: "Keep discussions organized around work instead of chaos.", icon: "◉" }, { title: "Tasks + projects", body: "Bridge communication and execution in one surface.", icon: "☑" }, { title: "Workflow builder", body: "Automate repeat actions and cut coordination overhead.", icon: "⚙" }, { title: "AI context", body: "Summaries and search help people re-enter work faster.", icon: "✦" }], footerTitle: `Ready to launch ${brand}Workspace?`, footerSubtitle: "Create a workspace product with collaboration and execution built together.", footerCta: "Start now", footerNote: `© 2026 ${brand}Workspace. Generated by Buildly.` }),
    support_hub: makeBranding({ name: `${brand}Support`, badge: "AI-Powered Support Hub", headlineA: "Resolve faster.", accentB: "Route", accentC: "the right issue.", closing: "Protect service quality.", subtitle: `${brand}Support helps ${targetUser.toLowerCase()} ${coreOutcome.toLowerCase()} with chat intake, ticket operations, resolution flow, and SLA visibility.`, primaryCta: "Open inbox", secondaryCta: "See support flow", featuresTitle: "Everything you need to", featuresAccent: "resolve faster", featuresSubtitle: "Widget, queue, ticket detail, and agent workspace in one support shell.", features: [{ title: "Support widget", body: "Capture intent through live messaging and self-serve entry.", icon: "✉" }, { title: "Ticket queue", body: "Prioritize the next best issue with better context.", icon: "⚑" }, { title: "Resolution workspace", body: "Keep replies, notes, and customer context together.", icon: "▣" }, { title: "SLA reporting", body: "Measure speed, backlog, and quality with real ops views.", icon: "↗" }], footerTitle: `Ready to launch ${brand}Support?`, footerSubtitle: "Build a support product with inbox, ticketing, and SLA credibility.", footerCta: "Start now", footerNote: `© 2026 ${brand}Support. Generated by Buildly.` }),
  };
  return map[family];
}

function buildNavigation(family: ProductFamily): string[] {
  const map: Record<ProductFamily, string[]> = {
    marketplace_booking: ["Search", "Wishlist", "Messages", "Bookings", "Profile"],
    commerce_storefront: ["Home", "Catalog", "Cart", "Orders", "Profile"],
    delivery_local: ["Discover", "Merchants", "Cart", "Tracking", "Profile"],
    finance_copilot: ["Overview", "Accounts", "Analytics", "Budgets", "Alerts"],
    education_path: ["Home", "Curriculum", "Lessons", "Progress", "Certificates"],
    recruiting_pipeline: ["Jobs", "Tracker", "Candidates", "Interviews", "Reports"],
    creator_membership: ["Home", "Feed", "Memberships", "Chat", "Members"],
    team_workspace: ["Home", "Channels", "Projects", "Workflows", "AI Search"],
    support_hub: ["Inbox", "Tickets", "Customers", "SLA", "Settings"],
  };
  return map[family];
}

function buildDataModel(family: ProductFamily): string[] {
  const map: Record<ProductFamily, string[]> = {
    marketplace_booking: ["users", "listings", "availability", "bookings", "reviews", "messages"],
    commerce_storefront: ["users", "products", "collections", "carts", "orders", "promotions"],
    delivery_local: ["users", "merchants", "menus", "carts", "orders", "delivery_events"],
    finance_copilot: ["users", "accounts", "transactions", "budgets", "alerts", "forecasts"],
    education_path: ["users", "courses", "lessons", "progress_events", "projects", "certificates"],
    recruiting_pipeline: ["users", "jobs", "applications", "candidates", "stages", "interviews"],
    creator_membership: ["users", "tiers", "posts", "member_access", "chats", "engagement_events"],
    team_workspace: ["users", "channels", "messages", "projects", "tasks", "workflow_runs"],
    support_hub: ["users", "tickets", "customers", "messages", "sla_events", "notes"],
  };
  return map[family];
}

function buildStack(family: ProductFamily): string[] {
  const base = ["Next.js App Router", "Tailwind UI", "Vercel deployment", "PostHog analytics"];
  if (["marketplace_booking", "commerce_storefront", "delivery_local"].includes(family)) return [...base, "Supabase Auth + Postgres", "Stripe", "Resend"];
  if (family === "finance_copilot") return [...base, "Supabase Auth + Postgres", "Resend", "Financial insights layer"];
  if (family === "education_path") return [...base, "Supabase Auth + Postgres", "Resend", "Progress tracking"];
  if (family === "recruiting_pipeline") return [...base, "Supabase Auth + Postgres", "Resend", "Pipeline scoring"];
  if (family === "creator_membership") return [...base, "Supabase Auth + Postgres", "Resend", "Media storage"];
  return [...base, "Supabase Auth + Postgres", "Resend"];
}

function buildIntegrations(family: ProductFamily): string[] {
  const base = ["Supabase for auth, data, and storage", "PostHog for activation and funnel analytics", "Resend for lifecycle email"];
  if (family === "marketplace_booking") return [...base, "Payments and booking sync", "Provider messaging"];
  if (family === "commerce_storefront") return [...base, "Catalog and order sync", "Checkout provider"];
  if (family === "delivery_local") return [...base, "Merchant availability sync", "Order status tracking"];
  if (family === "finance_copilot") return [...base, "Account connection layer", "Alert rules engine"];
  if (family === "education_path") return [...base, "Progress sync", "Certificate export"];
  if (family === "recruiting_pipeline") return [...base, "ATS sync", "Application status events"];
  if (family === "creator_membership") return [...base, "Membership billing", "Digest email"];
  if (family === "team_workspace") return [...base, "Workspace notifications", "Workflow triggers"];
  if (family === "support_hub") return [...base, "Messaging widget", "Ticket routing"];
  return base;
}

function buildRoadmap(family: ProductFamily): string[] {
  const common = [
    "Day 1-2: define schema, auth, and project creation flow",
    "Day 3-4: build onboarding and the first core workflow",
    "Day 5-6: implement success state and progression logic",
    "Day 7-8: add analytics and event tracking",
    "Day 9-10: wire onboarding and lifecycle email",
    "Day 11-12: polish UI, copy, and empty states",
    "Day 13-14: QA, deploy, and invite first real users",
  ];
  if (family === "marketplace_booking") return [...common.slice(0, 2), "Day 5-6: implement search, listing detail, and booking trust layer", ...common.slice(3)];
  if (family === "commerce_storefront") return [...common.slice(0, 2), "Day 5-6: implement cart, checkout, and order confirmation", ...common.slice(3)];
  if (family === "delivery_local") return [...common.slice(0, 2), "Day 5-6: implement merchant menu, cart, and order tracking", ...common.slice(3)];
  if (family === "finance_copilot") return [...common.slice(0, 2), "Day 5-6: implement dashboard, budgets, and alert feed", ...common.slice(3)];
  if (family === "education_path") return [...common.slice(0, 2), "Day 5-6: implement curriculum path, lesson player, and progress summary", ...common.slice(3)];
  if (family === "recruiting_pipeline") return [...common.slice(0, 2), "Day 5-6: implement jobs, tracker, and recruiter pipeline", ...common.slice(3)];
  if (family === "creator_membership") return [...common.slice(0, 2), "Day 5-6: implement memberships, gated content, and community loop", ...common.slice(3)];
  if (family === "team_workspace") return [...common.slice(0, 2), "Day 5-6: implement channels, tasks, and workflow actions", ...common.slice(3)];
  if (family === "support_hub") return [...common.slice(0, 2), "Day 5-6: implement widget intake, ticket queue, and SLA states", ...common.slice(3)];
  return common;
}

function humanizePageName(value: string): string {
  return value.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function makeBranding(input: MvpBranding): MvpBranding { return input; }

function toBrandName(idea: string): string {
  const words = idea.replace(/[^a-zA-Z0-9 ]/g, " ").split(/\s+/).filter(Boolean).slice(0, 2);
  if (words.length === 0) return "BuildlyPilot";
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join("");
}

function normalizeOutcome(value: string): string {
  return value.replace(/^help\s+/i, "").replace(/\.$/, "");
}
