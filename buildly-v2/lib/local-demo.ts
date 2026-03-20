import type { ValidationInput } from "./buildly";
import { defaultProjectConfig, type BuildlyProjectConfig } from "./buildly-os";

export type AgentPayloadLite = {
  input: ValidationInput;
  urgency: string;
  agentActions: string[];
  mvpScope: string[];
  generatedCopy: {
    headline: string;
    subheadline: string;
    cta: string;
  };
  meta?: {
    provider?: string;
    model?: string;
    reasoning?: string;
    error?: string;
  };
  validation: {
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
  };
};

export type LandingVariant = {
  id: string;
  type: "Lead Capture" | "Waitlist" | "Pre-Sell";
  angle: string;
  headline: string;
  subheadline: string;
  cta: string;
  audience: string;
};

export type ExperimentPlan = {
  id: string;
  title: string;
  channel: string;
  goal: string;
  budget: string;
};

export type LocalProject = {
  id: string;
  createdAt: string;
  updatedAt: string;
  input: ValidationInput;
  result: AgentPayloadLite;
  variants: LandingVariant[];
  experiments: ExperimentPlan[];
  config?: BuildlyProjectConfig;
};

export type PublishedLanding = {
  slug: string;
  projectId: string;
  variantId: string;
  variantType: LandingVariant["type"];
  idea: string;
  icp: string;
  valueProp: string;
  angle: string;
  headline: string;
  subheadline: string;
  cta: string;
  audience: string;
  publishedAt: string;
};

export type LandingEvent = {
  id: string;
  slug: string;
  projectId: string;
  type: "page_view" | "cta_click" | "lead_submit";
  sessionId: string;
  referrer?: string;
  createdAt: string;
};

export type LandingLead = {
  id: string;
  slug: string;
  projectId: string;
  email: string;
  name: string;
  note: string;
  createdAt: string;
};

export type VariantSignal = {
  slug: string;
  variantId: string;
  variantType: LandingVariant["type"];
  headline: string;
  views: number;
  ctaClicks: number;
  leads: number;
  ctr: number;
  conversion: number;
};

export type ProjectSignal = {
  projectId: string;
  totalViews: number;
  totalCtaClicks: number;
  totalLeads: number;
  ctr: number;
  conversion: number;
  variants: VariantSignal[];
  bestVariant: VariantSignal | null;
};

export type ProjectDecision = {
  code: "go" | "iterate" | "narrow_icp" | "test_pricing" | "kill";
  label: string;
  rationale: string;
  confidence: "Low" | "Medium" | "High";
};

export type MvpBrief = {
  title: string;
  summary: string;
  features: string[];
  backlog: string[];
  doNotBuild: string[];
};

export type BenchmarkReport = {
  segment: "B2B" | "Consumer" | "Prosumer";
  verdict: "Strong" | "Promising" | "Weak";
  expectedCtr: string;
  expectedConversion: string;
  explanation: string;
};

export type PivotRecommendation = {
  title: string;
  reason: string;
  nextTest: string;
};

export type InvestorMemo = {
  title: string;
  summary: string;
  bullets: string[];
};

export type MarketAnalysis = {
  segment: "B2B" | "Consumer" | "Prosumer";
  marketAttractiveness: "High" | "Medium" | "Low";
  buyerUrgency: "High" | "Medium" | "Low";
  competitivePressure: "High" | "Medium" | "Low";
  entryWedge: string;
  recommendedChannel: string;
  opportunities: string[];
  topRisks: string[];
  summary: string;
};

const KEYS = {
  projects: "buildly/local-projects/v1",
  landings: "buildly/local-landings/v1",
  events: "buildly/local-events/v1",
  leads: "buildly/local-leads/v1",
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readCollection<T>(key: string): T[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCollection<T>(key: string, value: T[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function makeId(prefix = "buildly") {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "buildly";
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function normalizeProject(project: LocalProject): LocalProject {
  return {
    ...project,
    config: defaultProjectConfig(project.config),
  };
}

export function buildLocalProject(input: {
  payload: AgentPayloadLite;
  variants: LandingVariant[];
  experiments: ExperimentPlan[];
  projectId?: string;
  config?: Partial<BuildlyProjectConfig>;
}): LocalProject {
  const now = new Date().toISOString();
  return {
    id: input.projectId || makeId("project"),
    createdAt: now,
    updatedAt: now,
    input: input.payload.input,
    result: input.payload,
    variants: input.variants,
    experiments: input.experiments,
    config: defaultProjectConfig(input.config),
  };
}

export function saveProject(project: LocalProject) {
  const projects = readCollection<LocalProject>(KEYS.projects);
  const existing = projects.findIndex((item) => item.id === project.id);
  const next = normalizeProject({ ...project, updatedAt: new Date().toISOString() });
  if (existing >= 0) projects.splice(existing, 1, next);
  else projects.unshift(next);
  writeCollection(KEYS.projects, projects);
  return next;
}

export function listProjects() {
  return readCollection<LocalProject>(KEYS.projects)
    .map(normalizeProject)
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
}

export function getProject(projectId: string) {
  return listProjects().find((item) => item.id === projectId) || null;
}

export function remixProject(projectId: string) {
  const project = getProject(projectId);
  if (!project) return null;
  const remixed = buildLocalProject({
    payload: project.result,
    variants: project.variants,
    experiments: project.experiments,
    config: {
      ...project.config,
      remixedFromId: project.id,
      buildOrigin: "remix",
      seedPrompt: project.config?.seedPrompt || project.input.idea,
    },
  });
  return saveProject(remixed);
}

export function buildReferenceSummary(projects: LocalProject[], selectedIds: string[]) {
  const references = projects.filter((project) => selectedIds.includes(project.id));
  if (references.length === 0) return "";
  return references
    .map((project) => `Reference: ${project.input.idea} for ${project.input.icp}. Winning angle: ${project.result.generatedCopy.headline}. Theme preset: ${project.config?.themePreset || "lovable_soft"}.`)
    .join("\n");
}

export function publishVariant(project: LocalProject, variant: LandingVariant) {
  const landings = readCollection<PublishedLanding>(KEYS.landings);
  const existing = landings.find((item) => item.projectId === project.id && item.variantId === variant.id);
  if (existing) return existing;

  const landing: PublishedLanding = {
    slug: `${slugify(project.input.idea)}-${variant.id}-${Date.now().toString(36)}`.slice(0, 64),
    projectId: project.id,
    variantId: variant.id,
    variantType: variant.type,
    idea: project.input.idea,
    icp: project.input.icp,
    valueProp: project.input.value,
    angle: variant.angle,
    headline: variant.headline,
    subheadline: variant.subheadline,
    cta: variant.cta,
    audience: variant.audience,
    publishedAt: new Date().toISOString(),
  };

  landings.unshift(landing);
  writeCollection(KEYS.landings, landings);
  return landing;
}

export function listPublishedLandings(projectId?: string) {
  const landings = readCollection<PublishedLanding>(KEYS.landings).sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
  return projectId ? landings.filter((item) => item.projectId === projectId) : landings;
}

export function getPublishedLanding(slug: string) {
  return readCollection<PublishedLanding>(KEYS.landings).find((item) => item.slug === slug) || null;
}

export function getSessionId(slug: string) {
  if (typeof window === "undefined" || typeof window.sessionStorage === "undefined") return makeId("session");
  const key = `buildly/session/${slug}`;
  const existing = window.sessionStorage.getItem(key);
  if (existing) return existing;
  const next = makeId("session");
  window.sessionStorage.setItem(key, next);
  return next;
}

export function trackLandingEvent(slug: string, type: LandingEvent["type"], sessionId?: string) {
  const landing = getPublishedLanding(slug);
  if (!landing) return null;

  const events = readCollection<LandingEvent>(KEYS.events);
  const resolvedSession = sessionId || getSessionId(slug);

  if (type === "page_view") {
    const duplicate = events.some((item) => item.slug === slug && item.type === type && item.sessionId === resolvedSession);
    if (duplicate) return null;
  }

  const event: LandingEvent = {
    id: makeId("event"),
    slug,
    projectId: landing.projectId,
    type,
    sessionId: resolvedSession,
    referrer: typeof document !== "undefined" ? document.referrer : undefined,
    createdAt: new Date().toISOString(),
  };
  events.unshift(event);
  writeCollection(KEYS.events, events);
  return event;
}

export function submitLead(slug: string, input: { email: string; name?: string; note?: string }) {
  const landing = getPublishedLanding(slug);
  if (!landing) return { ok: false as const, error: "Landing not found." };

  const email = input.email.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false as const, error: "Enter a valid email address." };

  const leads = readCollection<LandingLead>(KEYS.leads);
  const duplicate = leads.some((item) => item.slug === slug && item.email.toLowerCase() === email);
  if (duplicate) return { ok: false as const, error: "This email is already on the waitlist." };

  const lead: LandingLead = {
    id: makeId("lead"),
    slug,
    projectId: landing.projectId,
    email,
    name: input.name?.trim() || "",
    note: input.note?.trim() || "",
    createdAt: new Date().toISOString(),
  };

  leads.unshift(lead);
  writeCollection(KEYS.leads, leads);
  trackLandingEvent(slug, "lead_submit");

  return { ok: true as const, lead };
}

export function listProjectLeads(projectId: string) {
  return readCollection<LandingLead>(KEYS.leads)
    .filter((item) => item.projectId === projectId)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function getLandingSignal(slug: string): VariantSignal | null {
  const landing = getPublishedLanding(slug);
  if (!landing) return null;
  const events = readCollection<LandingEvent>(KEYS.events).filter((item) => item.slug === slug);
  const leads = readCollection<LandingLead>(KEYS.leads).filter((item) => item.slug === slug);
  const views = events.filter((item) => item.type === "page_view").length;
  const ctaClicks = events.filter((item) => item.type === "cta_click").length;
  const leadCount = leads.length;

  return {
    slug,
    variantId: landing.variantId,
    variantType: landing.variantType,
    headline: landing.headline,
    views,
    ctaClicks,
    leads: leadCount,
    ctr: views > 0 ? round((ctaClicks / views) * 100) : 0,
    conversion: views > 0 ? round((leadCount / views) * 100) : 0,
  };
}

export function getProjectSignal(projectId: string): ProjectSignal {
  const variants = listPublishedLandings(projectId)
    .map((landing) => getLandingSignal(landing.slug))
    .filter(Boolean) as VariantSignal[];

  const totalViews = variants.reduce((sum, item) => sum + item.views, 0);
  const totalCtaClicks = variants.reduce((sum, item) => sum + item.ctaClicks, 0);
  const totalLeads = variants.reduce((sum, item) => sum + item.leads, 0);
  const bestVariant = [...variants].sort((a, b) => b.leads - a.leads || b.conversion - a.conversion || b.views - a.views)[0] || null;

  return {
    projectId,
    totalViews,
    totalCtaClicks,
    totalLeads,
    ctr: totalViews > 0 ? round((totalCtaClicks / totalViews) * 100) : 0,
    conversion: totalViews > 0 ? round((totalLeads / totalViews) * 100) : 0,
    variants,
    bestVariant,
  };
}

export function decideFromSignal(project: LocalProject, signal: ProjectSignal): ProjectDecision {
  if (signal.totalViews === 0) return { code: "iterate", label: "Publish and drive first traffic", rationale: "You have variants, but no live traffic yet. Publish one page, drive 50 qualified visits, then decide.", confidence: "Low" };
  if (signal.totalViews < 50) return { code: "iterate", label: "Collect more signal", rationale: "The sample is still too small. Keep traffic focused on one audience and one promise until you cross 50–100 visits.", confidence: "Low" };
  const best = signal.bestVariant;
  if (!best) return { code: "iterate", label: "No winner yet", rationale: "No variant has enough data to stand out. Keep testing the top promise against a sharper ICP.", confidence: "Low" };
  if (signal.totalLeads >= 15 && best.conversion >= 10) return { code: "go", label: "Go build the MVP", rationale: `The ${best.variantType} variant is converting at ${best.conversion}% with real lead capture. The signal is strong enough to move into MVP scope.`, confidence: "High" };
  if (best.ctr >= 18 && best.conversion < 4) return { code: "narrow_icp", label: "Narrow the ICP", rationale: "People click, but too few convert. The promise gets attention, but the landing is still too broad or not specific enough for the right buyer.", confidence: "Medium" };
  if (signal.totalLeads >= 6 && best.conversion >= 5) return { code: "test_pricing", label: "Test pricing before building", rationale: "You have enough demand to keep going, but not enough to lock the MVP. Run a pricing or paid waitlist test before writing product code.", confidence: "Medium" };
  if (signal.totalViews >= 150 && signal.totalLeads < 3) return { code: "kill", label: "Kill or pause", rationale: "You gave the idea real traffic and the signal stayed weak. Unless you discover a sharper pain point, this is not worth building now.", confidence: "High" };
  return { code: "iterate", label: "Iterate positioning", rationale: `The current winner is ${best.variantType}, but the conversion signal still needs work. Tighten the headline, value prop, and CTA before generating the MVP.`, confidence: "Medium" };
}

export function buildMvpBrief(project: LocalProject, signal: ProjectSignal): MvpBrief {
  const decision = decideFromSignal(project, signal);
  const winner = signal.bestVariant;
  const core = winner?.headline || project.result.generatedCopy.headline;
  const focus = winner?.variantType || "Lead Capture";
  return {
    title: `${project.input.idea} MVP brief`,
    summary: `${decision.label}. Focus the MVP on the promise behind the ${focus} variant: ${core}. Build one narrow workflow for ${project.input.icp.toLowerCase()} and remove everything that does not support the first user outcome.`,
    features: [...project.result.mvpScope, `Winning validation angle: ${winner ? `${winner.variantType} (${winner.conversion}% conversion)` : "No live winner yet"}.`].slice(0, 4),
    backlog: [`User onboarding for ${project.input.icp.toLowerCase()}.`, "Primary workflow completion and confirmation state.", "Lead capture to retained user handoff.", "Basic analytics for activation and repeat usage."],
    doNotBuild: ["Complex collaboration before a clear activation loop exists.", "Admin panels and settings pages that do not impact validation.", "Multi-persona workflows before one ICP clearly wins."],
  };
}

export function benchmarkSignal(project: LocalProject, signal: ProjectSignal): BenchmarkReport {
  const segment = inferSegment(project);
  const expectedCtr = segment === "B2B" ? "3%–8%" : segment === "Consumer" ? "8%–18%" : "5%–12%";
  const expectedConversion = segment === "B2B" ? "4%–10%" : segment === "Consumer" ? "8%–20%" : "5%–12%";
  let verdict: BenchmarkReport["verdict"] = "Promising";
  if (signal.conversion >= (segment === "Consumer" ? 10 : 6) && signal.ctr >= (segment === "Consumer" ? 12 : 5)) verdict = "Strong";
  else if (signal.totalViews >= 100 && signal.conversion < (segment === "Consumer" ? 3 : 2)) verdict = "Weak";
  const explanation = verdict === "Strong" ? `This project is outperforming early ${segment} benchmark ranges on both click interest and lead capture.` : verdict === "Weak" ? `Relative to a rough ${segment} benchmark, the current traffic is not turning into enough intent. Rework message, audience, or offer.` : `This project is near an early ${segment} benchmark, but it still needs more traffic or a sharper winner before you lock the MVP.`;
  return { segment, verdict, expectedCtr, expectedConversion, explanation };
}

export function analyzeMarket(project: LocalProject): MarketAnalysis {
  const segment = inferSegment(project);
  const text = `${project.input.idea} ${project.input.icp} ${project.input.value}`.toLowerCase();
  const urgencyScore = scoreUrgency(text);
  const pressureScore = scoreCompetition(text);
  const buyerUrgency = urgencyScore >= 3 ? "High" : urgencyScore === 2 ? "Medium" : "Low";
  const competitivePressure = pressureScore >= 3 ? "High" : pressureScore === 2 ? "Medium" : "Low";
  let attractiveness: MarketAnalysis["marketAttractiveness"] = "Medium";
  if (urgencyScore >= 3 && pressureScore <= 2) attractiveness = "High";
  if (urgencyScore <= 1 || (pressureScore >= 3 && urgencyScore <= 2)) attractiveness = "Low";
  const entryWedge = getEntryWedge(project, segment, urgencyScore);
  const recommendedChannel = getRecommendedChannel(project, segment);
  const opportunities = buildOpportunities(project, segment, urgencyScore);
  const topRisks = buildMarketRisks(project, segment, pressureScore, urgencyScore);
  const summary = `${segment} market with ${buyerUrgency.toLowerCase()} buyer urgency and ${competitivePressure.toLowerCase()} competitive pressure. The best wedge is ${entryWedge.toLowerCase()}, with ${recommendedChannel.toLowerCase()} as the most natural first channel.`;
  return { segment, marketAttractiveness: attractiveness, buyerUrgency, competitivePressure, entryWedge, recommendedChannel, opportunities, topRisks, summary };
}

export function buildPivotPlan(project: LocalProject, signal: ProjectSignal): PivotRecommendation[] {
  const decision = decideFromSignal(project, signal);
  const winner = signal.bestVariant;
  if (decision.code === "go") return [{ title: "Double down on the winning angle", reason: `The ${winner?.variantType || "best"} variant is already producing usable signal.`, nextTest: "Keep one headline stable, then test onboarding intent or pricing instead of reworking the whole proposition." }, { title: "Interview fresh leads", reason: "You now have enough demand to extract the exact workflow people expect from v1.", nextTest: "Ask the next 5 leads what they tried before, how often the pain appears, and what would make them pay now." }, { title: "Scope a narrower MVP", reason: "Momentum is good, so unnecessary features become the main risk.", nextTest: "Ship one core workflow and one success metric before adding collaboration, dashboards, or settings." }];
  if (decision.code === "narrow_icp") return [{ title: "Shrink the audience", reason: "Clicks exist, but the current segment is too broad to convert consistently.", nextTest: `Rewrite the page for one sub-segment inside ${project.input.icp.toLowerCase()} and remove generic wording.` }, { title: "Use sharper proof", reason: "Visitors need stronger evidence that the offer is made for them specifically.", nextTest: "Add one concrete before/after result and one painful workflow example above the fold." }, { title: "Reduce CTA ambiguity", reason: "A broad CTA can hide weak buying intent.", nextTest: "Switch from a vague CTA to a very specific action like book demo, join cohort, or request early access." }];
  if (decision.code === "test_pricing") return [{ title: "Add a paid intent step", reason: "You have enough interest to move from curiosity to willingness-to-pay validation.", nextTest: "Test a paid waitlist, refundable deposit, or pricing survey with one concrete package." }, { title: "Position by outcome not features", reason: "Pricing tests work best when tied to a measurable outcome.", nextTest: "Rewrite the offer around time saved, revenue gained, or manual work eliminated." }, { title: "Segment high-intent leads", reason: "Not every lead should influence pricing equally.", nextTest: "Tag leads who replied fastest or gave detailed notes, and test pricing with them first." }];
  if (decision.code === "kill") return [{ title: "Keep the pain, change the wedge", reason: "Weak response often means the angle is wrong, not always that the market is dead.", nextTest: "Reframe the problem around a narrower urgent use case rather than the full product vision." }, { title: "Change acquisition source", reason: "Low-quality traffic can make a decent idea look dead.", nextTest: "Run one test in a channel where the ICP already hangs out instead of broad paid traffic." }, { title: "Archive and compare later", reason: "Some ideas are better paused than endlessly tuned.", nextTest: "Start a new concept in Buildly, then compare both signals side by side after 1 week." }];
  return [{ title: "Sharpen the headline", reason: "The main promise is still not crisp enough to turn interest into action.", nextTest: "Write three variants that each focus on one painful outcome, then test only one audience at a time." }, { title: "Test one channel deeply", reason: "Spreading traffic too widely makes the signal noisy.", nextTest: `Concentrate the next traffic batch on ${project.result.validation.channel} and compare only one winner against one challenger.` }, { title: "Collect richer notes from leads", reason: "Qualitative feedback helps explain why conversion is weak or strong.", nextTest: "Ask every new lead what they do today, what breaks, and what result they want this month." }];
}

export function buildInvestorMemo(project: LocalProject, signal: ProjectSignal): InvestorMemo {
  const decision = decideFromSignal(project, signal);
  const winner = signal.bestVariant;
  const benchmark = benchmarkSignal(project, signal);
  return { title: `${project.input.idea} traction memo`, summary: `${decision.label}. Buildly observed ${signal.totalViews} views, ${signal.totalLeads} captured leads, ${signal.conversion}% visitor-to-lead conversion, and a current benchmark verdict of ${benchmark.verdict.toLowerCase()} for ${benchmark.segment.toLowerCase()} demand.`, bullets: [`Best current angle: ${winner ? `${winner.variantType} at ${winner.conversion}% conversion` : "no winning variant yet"}.`, `Primary ICP tested: ${project.input.icp}.`, `Recommended next move: ${decision.label}.`, `Validation thesis: ${project.result.validation.insight}`] };
}

export function exportLeadsCsv(projectId: string) {
  const leads = listProjectLeads(projectId);
  const rows = [["name", "email", "note", "created_at"], ...leads.map((lead) => [lead.name || "", lead.email, lead.note || "", lead.createdAt])];
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

function inferSegment(project: LocalProject): BenchmarkReport["segment"] { const text = `${project.input.idea} ${project.input.icp} ${project.input.value}`.toLowerCase(); if (/consumer|parents|students|creators|fitness|dating|beauty|food|travel|tiktok|instagram|reddit/.test(text)) return "Consumer"; if (/freelance|creator|agency|coach|consultant|designer|solo|independent/.test(text)) return "Prosumer"; return "B2B"; }
function scoreUrgency(text: string) { if (/(save|compliance|revenue|sales|pipeline|deadline|risk|manual|ops|automation|urgent|churn|cost|time)/.test(text)) return 3; if (/(improve|better|faster|simpler|easier|consistent|growth|organize)/.test(text)) return 2; return 1; }
function scoreCompetition(text: string) { if (/(ai|crm|productivity|analytics|marketing|design|project management|fitness app|content)/.test(text)) return 3; if (/(workflow|automation|saas|dashboard|community|marketplace)/.test(text)) return 2; return 1; }
function getEntryWedge(project: LocalProject, segment: MarketAnalysis["segment"], urgencyScore: number) { if (urgencyScore >= 3 && segment === "B2B") return `a narrow operational pain for ${project.input.icp.toLowerCase()}`; if (segment === "Consumer") return "a single emotionally resonant outcome with strong social proof"; if (segment === "Prosumer") return "a time-saving workflow that pays back within the first week"; return "one painful workflow with a concrete before/after promise"; }
function getRecommendedChannel(project: LocalProject, segment: MarketAnalysis["segment"]) { if (segment === "B2B") return project.result.validation.channel || "LinkedIn outbound + founder-led outreach"; if (segment === "Consumer") return "TikTok / Instagram / creator communities"; return "X / LinkedIn / niche communities"; }
function buildOpportunities(project: LocalProject, segment: MarketAnalysis["segment"], urgencyScore: number) { const opportunities = [`Position around ${project.input.value.toLowerCase()}.`, `Test a sharper wedge for ${project.input.icp.toLowerCase()}.`]; if (segment === "B2B") opportunities.push("Use founder-led outreach to validate pain before scaling traffic."); if (segment === "Consumer") opportunities.push("Lean on social proof and visual results to accelerate trust."); if (urgencyScore >= 3) opportunities.push("Buyers likely respond to a strong ROI or time-saving framing."); return opportunities.slice(0, 3); }
function buildMarketRisks(project: LocalProject, segment: MarketAnalysis["segment"], pressureScore: number, urgencyScore: number) { const risks = [] as string[]; if (pressureScore >= 3) risks.push("Crowded space with strong incumbent expectations."); if (urgencyScore <= 1) risks.push("Problem may feel nice-to-have rather than urgent."); if (segment === "Consumer") risks.push("Traffic may be cheap but intent quality may vary widely."); if (segment === "B2B") risks.push("Sales cycle may be longer than initial landing tests suggest."); if (risks.length === 0) risks.push("The ICP may still be broader than the real winning buyer segment."); return risks.slice(0, 3); }
function csvEscape(value: string) { return `"${String(value || "").replace(/"/g, '""')}"`; }
