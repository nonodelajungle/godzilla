import type { ValidationInput } from "./buildly";

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

export function buildLocalProject(input: {
  payload: AgentPayloadLite;
  variants: LandingVariant[];
  experiments: ExperimentPlan[];
  projectId?: string;
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
  };
}

export function saveProject(project: LocalProject) {
  const projects = readCollection<LocalProject>(KEYS.projects);
  const existing = projects.findIndex((item) => item.id === project.id);
  const next = { ...project, updatedAt: new Date().toISOString() };
  if (existing >= 0) projects.splice(existing, 1, next);
  else projects.unshift(next);
  writeCollection(KEYS.projects, projects);
  return next;
}

export function listProjects() {
  return readCollection<LocalProject>(KEYS.projects).sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
}

export function getProject(projectId: string) {
  return listProjects().find((item) => item.id === projectId) || null;
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
  if (signal.totalViews === 0) {
    return {
      code: "iterate",
      label: "Publish and drive first traffic",
      rationale: "You have variants, but no live traffic yet. Publish one page, drive 50 qualified visits, then decide.",
      confidence: "Low",
    };
  }

  if (signal.totalViews < 50) {
    return {
      code: "iterate",
      label: "Collect more signal",
      rationale: "The sample is still too small. Keep traffic focused on one audience and one promise until you cross 50–100 visits.",
      confidence: "Low",
    };
  }

  const best = signal.bestVariant;
  if (!best) {
    return {
      code: "iterate",
      label: "No winner yet",
      rationale: "No variant has enough data to stand out. Keep testing the top promise against a sharper ICP.",
      confidence: "Low",
    };
  }

  if (signal.totalLeads >= 15 && best.conversion >= 10) {
    return {
      code: "go",
      label: "Go build the MVP",
      rationale: `The ${best.variantType} variant is converting at ${best.conversion}% with real lead capture. The signal is strong enough to move into MVP scope.`,
      confidence: "High",
    };
  }

  if (best.ctr >= 18 && best.conversion < 4) {
    return {
      code: "narrow_icp",
      label: "Narrow the ICP",
      rationale: "People click, but too few convert. The promise gets attention, but the landing is still too broad or not specific enough for the right buyer.",
      confidence: "Medium",
    };
  }

  if (signal.totalLeads >= 6 && best.conversion >= 5) {
    return {
      code: "test_pricing",
      label: "Test pricing before building",
      rationale: "You have enough demand to keep going, but not enough to lock the MVP. Run a pricing or paid waitlist test before writing product code.",
      confidence: "Medium",
    };
  }

  if (signal.totalViews >= 150 && signal.totalLeads < 3) {
    return {
      code: "kill",
      label: "Kill or pause",
      rationale: "You gave the idea real traffic and the signal stayed weak. Unless you discover a sharper pain point, this is not worth building now.",
      confidence: "High",
    };
  }

  return {
    code: "iterate",
    label: "Iterate positioning",
    rationale: `The current winner is ${best.variantType}, but the conversion signal still needs work. Tighten the headline, value prop, and CTA before generating the MVP.`,
    confidence: "Medium",
  };
}

export function buildMvpBrief(project: LocalProject, signal: ProjectSignal): MvpBrief {
  const decision = decideFromSignal(project, signal);
  const winner = signal.bestVariant;
  const core = winner?.headline || project.result.generatedCopy.headline;
  const focus = winner?.variantType || "Lead Capture";

  return {
    title: `${project.input.idea} MVP brief`,
    summary: `${decision.label}. Focus the MVP on the promise behind the ${focus} variant: ${core}. Build one narrow workflow for ${project.input.icp.toLowerCase()} and remove everything that does not support the first user outcome.`,
    features: [
      ...project.result.mvpScope,
      `Winning validation angle: ${winner ? `${winner.variantType} (${winner.conversion}% conversion)` : "No live winner yet"}.`,
    ].slice(0, 4),
    backlog: [
      `User onboarding for ${project.input.icp.toLowerCase()}.`,
      "Primary workflow completion and confirmation state.",
      "Lead capture to retained user handoff.",
      "Basic analytics for activation and repeat usage.",
    ],
    doNotBuild: [
      "Complex collaboration before a clear activation loop exists.",
      "Admin panels and settings pages that do not impact validation.",
      "Multi-persona workflows before one ICP clearly wins.",
    ],
  };
}
