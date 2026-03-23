import { decideFromSignal, type LandingLead, type LocalProject, type MarketAnalysis, type ProjectSignal } from "./local-demo";

export type ValidationDimension = {
  label: string;
  score: number;
  rationale: string;
  status: "weak" | "average" | "strong";
};

export type ValidationScorecard = {
  overallScore: number;
  verdict: "Too early" | "Promising" | "Build-ready" | "Investor-ready";
  investmentReadiness: "Low" | "Medium" | "High";
  buildReadiness: "Do not build" | "Validate more" | "Narrow MVP" | "Build now";
  dimensions: ValidationDimension[];
  strengths: string[];
  risks: string[];
  nextMilestones: string[];
};

export type EvidenceBlock = {
  title: string;
  status: "missing" | "partial" | "strong";
  summary: string;
};

export type InterviewInsight = {
  theme: string;
  count: number;
  evidence: string[];
};

export type InterviewIntelligence = {
  summary: string;
  themes: InterviewInsight[];
  objections: string[];
  buyingSignals: string[];
  nextQuestions: string[];
};

export function buildValidationScorecard(project: LocalProject, signal: ProjectSignal, leads: LandingLead[], market: MarketAnalysis): ValidationScorecard {
  const notes = leads.map((lead) => lead.note || "").join(" ").toLowerCase();
  const decision = decideFromSignal(project, signal);

  const dimensions: ValidationDimension[] = [
    scoreDimension("Pain intensity", painIntensityScore(project, market, notes), `${market.buyerUrgency} buyer urgency with ${market.marketAttractiveness.toLowerCase()} market attractiveness.`),
    scoreDimension("ICP clarity", icpClarityScore(project), `Current ICP: ${project.input.icp}.`),
    scoreDimension("Willingness to pay", willingnessToPayScore(project, notes), "Estimated from problem wording, urgency, and direct buyer language in notes."),
    scoreDimension("Acquisition realism", acquisitionRealismScore(project, market), `Recommended first channel: ${market.recommendedChannel}.`),
    scoreDimension("Landing performance", landingPerformanceScore(signal), `${signal.totalViews} views, ${signal.totalLeads} leads, ${signal.conversion}% conversion.`),
    scoreDimension("Lead quality", leadQualityScore(leads), `${leads.length} total leads and ${leads.filter((lead) => Boolean(lead.note)).length} leads with notes.`),
    scoreDimension("Interview strength", interviewStrengthScore(leads), "Measures whether Buildly has enough qualitative signal to justify product decisions."),
    scoreDimension("MVP readiness", mvpReadinessScore(decision.code, signal.totalLeads), `Decision engine currently says: ${decision.label}.`),
  ];

  const overallScore = Math.round(dimensions.reduce((sum, item) => sum + item.score, 0) / dimensions.length);
  const verdict = overallScore >= 85 ? "Investor-ready" : overallScore >= 72 ? "Build-ready" : overallScore >= 56 ? "Promising" : "Too early";
  const investmentReadiness = overallScore >= 82 ? "High" : overallScore >= 62 ? "Medium" : "Low";
  const buildReadiness = decision.code === "go" ? "Build now" : decision.code === "test_pricing" ? "Narrow MVP" : decision.code === "narrow_icp" ? "Validate more" : decision.code === "kill" ? "Do not build" : "Validate more";

  const strengths = dimensions.filter((item) => item.score >= 75).map((item) => `${item.label} is already strong.`).slice(0, 3);
  const risks = dimensions.filter((item) => item.score < 60).map((item) => `${item.label} is still weak.`).slice(0, 3);
  const nextMilestones = buildMilestones(decision.code, signal, leads);

  return { overallScore, verdict, investmentReadiness, buildReadiness, dimensions, strengths, risks, nextMilestones };
}

export function buildEvidenceBlocks(project: LocalProject, signal: ProjectSignal, leads: LandingLead[], market: MarketAnalysis): EvidenceBlock[] {
  return [
    {
      title: "Problem framing",
      status: project.input.value.trim().length > 30 ? "strong" : "partial",
      summary: `${project.input.idea} for ${project.input.icp}. Promise: ${project.input.value}`,
    },
    {
      title: "Market wedge",
      status: market.marketAttractiveness === "High" ? "strong" : market.marketAttractiveness === "Medium" ? "partial" : "missing",
      summary: `Segment ${market.segment}. Wedge: ${market.entryWedge}.`,
    },
    {
      title: "Traffic and conversion",
      status: signal.totalLeads >= 10 && signal.conversion >= 5 ? "strong" : signal.totalViews >= 40 ? "partial" : "missing",
      summary: `${signal.totalViews} views, ${signal.totalCtaClicks} CTA clicks, ${signal.totalLeads} leads, ${signal.conversion}% conversion.`,
    },
    {
      title: "Lead evidence",
      status: leads.length >= 8 ? "strong" : leads.length >= 3 ? "partial" : "missing",
      summary: `${leads.length} leads collected. ${leads.filter((lead) => Boolean(lead.note)).length} contain founder notes.`,
    },
    {
      title: "Interview intelligence",
      status: leads.filter((lead) => Boolean(lead.note)).length >= 5 ? "strong" : leads.some((lead) => Boolean(lead.note)) ? "partial" : "missing",
      summary: summarizeLeadNotes(leads),
    },
    {
      title: "Build decision",
      status: signal.totalViews >= 50 ? "strong" : "partial",
      summary: decideFromSignal(project, signal).rationale,
    },
  ];
}

export function buildInterviewIntelligence(project: LocalProject, leads: LandingLead[]): InterviewIntelligence {
  const notedLeads = leads.filter((lead) => Boolean(lead.note));
  const allNotes = notedLeads.map((lead) => lead.note.toLowerCase());
  const themes = [
    makeTheme("Time saving", notedLeads, /(save|faster|time|manual|hours|minutes)/),
    makeTheme("Revenue / pipeline", notedLeads, /(revenue|sales|clients|pipeline|close|deal|paid)/),
    makeTheme("Workflow pain", notedLeads, /(messy|spreadsheet|broken|chaos|hard|friction|pain)/),
    makeTheme("Trust / accuracy", notedLeads, /(trust|accurate|confidence|proof|quality|reliable)/),
    makeTheme("Willingness to buy", notedLeads, /(pay|price|budget|worth|buy|subscribe)/),
  ].filter((item) => item.count > 0).sort((a, b) => b.count - a.count);

  const objections = extractSentences(allNotes, /(too expensive|already use|not urgent|manual is fine|need team buy-in|not now|later|unclear)/).slice(0, 5);
  const buyingSignals = extractSentences(allNotes, /(would pay|need this|when can i use|interested|book|demo|trial|beta|want this)/).slice(0, 5);
  const nextQuestions = [
    `What are ${project.input.icp.toLowerCase()} using today instead of this?`,
    "How often does the painful workflow happen each week?",
    "What result would make them switch immediately?",
    "Would they pay now, and under what budget?",
    "What feature is truly mandatory for v1?",
  ];

  return {
    summary: notedLeads.length === 0 ? "No interview notes yet. Buildly needs qualitative proof, not just top-of-funnel metrics." : `${notedLeads.length} leads include qualitative notes. The dominant themes show what people actually care about, what they resist, and what they might pay for.`,
    themes: themes.slice(0, 4),
    objections,
    buyingSignals,
    nextQuestions,
  };
}

function scoreDimension(label: string, score: number, rationale: string): ValidationDimension {
  return {
    label,
    score,
    rationale,
    status: score >= 75 ? "strong" : score >= 55 ? "average" : "weak",
  };
}

function painIntensityScore(project: LocalProject, market: MarketAnalysis, notes: string) {
  let score = market.buyerUrgency === "High" ? 84 : market.buyerUrgency === "Medium" ? 68 : 48;
  if (/(save|manual|revenue|cost|urgent|broken|follow-up|pipeline|compliance|churn)/.test(`${project.input.value.toLowerCase()} ${notes}`)) score += 8;
  return clamp(score);
}

function icpClarityScore(project: LocalProject) {
  const icp = project.input.icp.toLowerCase();
  let score = 52;
  if (icp.split(" ").length >= 2) score += 10;
  if (/(independent|freelance|founder|coach|agent|designer|clinic|agency|ops|sales)/.test(icp)) score += 14;
  if (/(everyone|businesses|companies|people|users)/.test(icp)) score -= 10;
  return clamp(score);
}

function willingnessToPayScore(project: LocalProject, notes: string) {
  let score = 50;
  if (/(revenue|save|clients|leads|automation|cost|pipeline|paid|subscription|crm|ops)/.test(project.input.value.toLowerCase())) score += 18;
  if (/(pay|budget|worth|buy|price)/.test(notes)) score += 12;
  return clamp(score);
}

function acquisitionRealismScore(project: LocalProject, market: MarketAnalysis) {
  let score = 58;
  if (project.result.validation.channel.toLowerCase().includes(market.recommendedChannel.split(" ")[0].toLowerCase())) score += 16;
  if (/(linkedin|reddit|tiktok|meta|outbound|x)/i.test(market.recommendedChannel)) score += 8;
  return clamp(score);
}

function landingPerformanceScore(signal: ProjectSignal) {
  if (signal.totalViews === 0) return 20;
  let score = 35;
  if (signal.totalViews >= 50) score += 15;
  if (signal.totalLeads >= 5) score += 15;
  if (signal.conversion >= 3) score += 10;
  if (signal.conversion >= 6) score += 10;
  if (signal.conversion >= 10) score += 10;
  return clamp(score);
}

function leadQualityScore(leads: LandingLead[]) {
  if (leads.length === 0) return 22;
  let score = 42 + Math.min(22, leads.length * 3);
  score += Math.min(18, leads.filter((lead) => Boolean(lead.note)).length * 4);
  return clamp(score);
}

function interviewStrengthScore(leads: LandingLead[]) {
  const noted = leads.filter((lead) => Boolean(lead.note)).length;
  if (noted === 0) return 18;
  let score = 40 + Math.min(45, noted * 9);
  return clamp(score);
}

function mvpReadinessScore(code: string, leadCount: number) {
  if (code === "go") return clamp(82 + Math.min(10, leadCount));
  if (code === "test_pricing") return 70;
  if (code === "narrow_icp") return 52;
  if (code === "kill") return 20;
  return 46;
}

function buildMilestones(code: string, signal: ProjectSignal, leads: LandingLead[]) {
  if (code === "go") return ["Lock the MVP around one core workflow.", "Run 5 founder calls with the hottest leads.", "Define one activation metric before coding v1."];
  if (code === "test_pricing") return ["Run a paid waitlist or deposit test.", "Separate curiosity leads from buying-intent leads.", "Rewrite the offer around ROI, not features."];
  if (code === "narrow_icp") return ["Rewrite the ICP around one sub-segment.", "Re-test the best headline on a narrower audience.", "Collect 5 more notes explaining why people hesitate."];
  if (signal.totalViews < 50) return ["Drive the first 50 qualified visits.", "Publish one variant only.", "Collect the first 3 interview notes."];
  return ["Refine the promise.", "Test one new wedge.", "Collect more qualitative proof."];
}

function makeTheme(theme: string, leads: LandingLead[], regex: RegExp): InterviewInsight {
  const evidence = leads.filter((lead) => regex.test(lead.note.toLowerCase())).slice(0, 3).map((lead) => lead.note);
  return { theme, count: evidence.length, evidence };
}

function extractSentences(notes: string[], regex: RegExp) {
  return notes.flatMap((note) => note.split(/[.!?]/)).map((item) => item.trim()).filter((item) => item && regex.test(item));
}

function summarizeLeadNotes(leads: LandingLead[]) {
  const noted = leads.filter((lead) => Boolean(lead.note));
  if (noted.length === 0) return "No interview or lead notes stored yet.";
  return `${noted.length} leads left notes. Most useful next step is turning those notes into pain, objection, and pricing patterns.`;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}
