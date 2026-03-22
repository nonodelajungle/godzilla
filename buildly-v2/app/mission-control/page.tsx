"use client";

import { useEffect, useMemo, useState } from "react";

type Verdict = "Go" | "Iterate" | "Drop";
type Readiness = "Low" | "Medium" | "High";
type Stage = "Discovery" | "Validation" | "Ready to build";
type Priority = "P1" | "P2" | "P3";
type ExperimentStatus = "Planned" | "Running" | "Passed" | "Failed";
type TabKey = "overview" | "signal" | "experiments" | "compare" | "handoff";

type ValidationInput = {
  idea: string;
  icp: string;
  value: string;
};

type ScorecardItem = {
  label: string;
  score: number;
  insight: string;
};

type Signal = {
  views: number;
  clicks: number;
  leads: number;
  interviews: number;
  paymentIntents: number;
};

type Experiment = {
  id: string;
  title: string;
  hypothesis: string;
  channel: string;
  successMetric: string;
  status: ExperimentStatus;
};

type Variant = {
  title: string;
  copy: string;
  cta: string;
  useCase: string;
};

type BuildItem = {
  title: string;
  description: string;
  priority: Priority;
};

type MissionProject = {
  id: string;
  createdAt: string;
  updatedAt: string;
  input: ValidationInput;
  analysisScore: number;
  scorecard: ScorecardItem[];
  channel: string;
  wedge: string;
  signal: Signal;
  experiments: Experiment[];
  variants: Variant[];
  trafficKit: {
    linkedin: string;
    dm: string;
    email: string;
    community: string;
  };
  handoff: {
    thesis: string;
    mvpGoal: string;
    activationMoment: string;
    userFlow: string[];
    pages: string[];
    buildPlan: BuildItem[];
    doNotBuild: string[];
    risks: string[];
  };
};

const STORAGE_KEY = "buildly-mission-control-v1";
const LEGACY_KEYS = ["buildly-workspace-pro-v1", "buildly-validate-workspace-v1"];

const demoInputs: ValidationInput[] = [
  {
    idea: "AI assistant for freelance designers",
    icp: "Freelance designers",
    value: "Help freelance designers find clients faster and automate proposal follow-up.",
  },
  {
    idea: "Lead qualification copilot for boutique agencies",
    icp: "Boutique agencies with inconsistent inbound lead quality",
    value: "Help agency owners score inbound leads instantly and follow up faster with the right offer.",
  },
  {
    idea: "Onboarding copilot for early-stage SaaS",
    icp: "Seed to Series A SaaS teams with weak activation rates",
    value: "Help SaaS teams shorten time-to-value and improve activation without redesigning the whole product.",
  },
];

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function hashText(value: string) {
  let total = 0;
  for (let i = 0; i < value.length; i += 1) total += value.charCodeAt(i) * (i + 1);
  return total;
}

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function copyText(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) navigator.clipboard.writeText(text);
}

function safeParse(raw: string | null) {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function isInput(value: unknown): value is ValidationInput {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.idea === "string" && typeof candidate.icp === "string" && typeof candidate.value === "string";
}

function buildProject(input: ValidationInput): MissionProject {
  const idea = input.idea.trim() || "New startup idea";
  const icp = input.icp.trim() || "Early users";
  const value = input.value.trim() || "Help users solve a painful workflow faster.";
  const text = `${idea} ${icp} ${value}`.toLowerCase();
  const seed = hashText(text);

  const urgency = clamp(46 + (seed % 35) + (/save|revenue|sales|manual|cost|faster|time|pipeline|clients|activation/.test(text) ? 10 : 0));
  const willingnessToPay = clamp(43 + (Math.floor(seed / 7) % 35) + (/b2b|agency|saas|sales|ops|finance|crm|onboarding/.test(text) ? 12 : 0));
  const channelAccess = clamp(40 + (Math.floor(seed / 11) % 33) + (/freelance|agency|designer|coach|founder|creator|saas|boutique/.test(text) ? 11 : 0));
  const differentiation = clamp(38 + (Math.floor(seed / 13) % 31) + (/assistant|copilot|automation|qualify|activation|proposal|onboarding/.test(text) ? 12 : 0));

  const scorecard: ScorecardItem[] = [
    {
      label: "Urgency",
      score: urgency,
      insight: urgency >= 70 ? "Pain feels immediate enough to validate with a sharp promise." : "Pain exists, but the trigger moment is still too fuzzy.",
    },
    {
      label: "Willingness to pay",
      score: willingnessToPay,
      insight: willingnessToPay >= 70 ? "The promise is close to a monetizable business pain." : "You need a clearer ROI or a narrower buyer segment.",
    },
    {
      label: "Channel access",
      score: channelAccess,
      insight: channelAccess >= 70 ? "You have a believable first route to reach qualified buyers." : "The first acquisition wedge is still under-defined.",
    },
    {
      label: "Differentiation",
      score: differentiation,
      insight: differentiation >= 70 ? "The wedge is distinct enough to stand out in an early test." : "The positioning still risks sounding generic.",
    },
  ];

  const analysisScore = Math.round(scorecard.reduce((sum, item) => sum + item.score, 0) / scorecard.length);
  const channel = channelAccess >= 72
    ? "Founder-led outreach + LinkedIn"
    : channelAccess >= 60
      ? "LinkedIn + niche communities"
      : "Manual interviews + micro landing page";

  const wedge = differentiation >= 68
    ? `Own one painful job: ${idea.toLowerCase()} for ${icp.toLowerCase()}.`
    : `Position around one painful workflow for ${icp.toLowerCase()}, not the whole market.`;

  const experiments: Experiment[] = [
    {
      id: makeId(),
      title: "Headline test",
      hypothesis: "A sharper pain-first promise will convert better than a broad positioning line.",
      channel: "Landing page",
      successMetric: "At least 5% visitor-to-lead conversion or 8 qualified leads.",
      status: "Planned",
    },
    {
      id: makeId(),
      title: "Founder-led outreach",
      hypothesis: `Direct conversations with ${icp.toLowerCase()} will reveal if the pain is urgent enough to pay for.`,
      channel: channel,
      successMetric: "5 interviews booked or 3 highly engaged replies.",
      status: "Running",
    },
    {
      id: makeId(),
      title: "Pricing signal",
      hypothesis: "A stronger buyer signal appears when the offer includes an explicit paid next step.",
      channel: "Email follow-up",
      successMetric: "At least 2 payment intents or pricing conversations.",
      status: "Planned",
    },
  ];

  const variants: Variant[] = [
    {
      title: "Pain-first",
      copy: `Stop losing time with ${idea.toLowerCase()}. Built for ${icp.toLowerCase()} who need results faster.`,
      cta: "Get early access",
      useCase: "Use when the buyer already feels the pain intensely.",
    },
    {
      title: "Outcome-first",
      copy: `From messy workflow to measurable outcome: ${value}`,
      cta: "See the workflow",
      useCase: "Use when the result matters more than the mechanism.",
    },
    {
      title: "Niche-wedge",
      copy: `The narrow path for ${icp.toLowerCase()} who want ${value.toLowerCase()}`,
      cta: "Join the waitlist",
      useCase: "Use when you need sharper positioning against broader tools.",
    },
  ];

  const trafficKit = {
    linkedin: `Most ${icp.toLowerCase()} do not need more tools. They need a shorter path to ${value.toLowerCase()} I’m validating that assumption now with a very narrow product wedge.`,
    dm: `Hey — I’m testing a focused product for ${icp.toLowerCase()} that helps them ${value.toLowerCase()} Open to a 10-minute reaction?`,
    email: `Subject: Quick feedback request\n\nI’m validating a focused solution for ${icp.toLowerCase()} to ${value.toLowerCase()} Curious what your current workaround looks like.`,
    community: `I’m validating a product for ${icp.toLowerCase()} around this promise: “${value}”. Looking for direct feedback from people who live this workflow.`,
  };

  const handoff = {
    thesis: `If ${icp.toLowerCase()} can reach ${value.toLowerCase()} through one shorter workflow, they will prefer a focused product over a generic stack.`,
    mvpGoal: `Ship the narrowest workflow that proves ${idea.toLowerCase()} is worth adopting and paying for.`,
    activationMoment: `The user sees a clear before/after improvement in the painful workflow inside the first session.`,
    userFlow: [
      "Founder or buyer understands the promise immediately.",
      `User lands in one focused workflow for ${icp.toLowerCase()}.`,
      "User completes the core action with low setup friction.",
      "User gets a visible outcome and a reason to return.",
    ],
    pages: [
      "Landing / promise page",
      "Primary workflow page",
      "Result / success state",
      "Simple follow-up or retention prompt",
    ],
    buildPlan: [
      {
        title: "Mission dashboard",
        description: "One screen with live score, verdict, signal, experiments, and next action.",
        priority: "P1",
      },
      {
        title: "Message + GTM assets",
        description: "Variants and acquisition assets that move the founder from analysis to execution.",
        priority: "P1",
      },
      {
        title: "Core workflow MVP",
        description: "The single product path that proves the value proposition in practice.",
        priority: "P1",
      },
      {
        title: "Portfolio compare",
        description: "Compare multiple ideas to decide where to focus build energy.",
        priority: "P2",
      },
      {
        title: "Scope lock",
        description: "Explicitly codify what does not belong in v1.",
        priority: "P2",
      },
    ],
    doNotBuild: [
      "Collaboration features before one ICP clearly wins.",
      "Broad admin/settings surfaces that do not increase validation quality.",
      "Feature breadth that dilutes the wedge.",
    ],
    risks: [
      channelAccess < 62 ? "Acquisition path is still under-defined." : "Channel exists, but quality matters more than volume.",
      willingnessToPay < 66 ? "ROI is not explicit enough yet." : "Pricing should be tested earlier than usual.",
      differentiation < 64 ? "The concept still risks sounding too horizontal." : "Wedge is clear, but focus must stay narrow.",
    ],
  };

  const now = new Date().toISOString();

  return {
    id: makeId(),
    createdAt: now,
    updatedAt: now,
    input: { idea, icp, value },
    analysisScore,
    scorecard,
    channel,
    wedge,
    signal: { views: 0, clicks: 0, leads: 0, interviews: 0, paymentIntents: 0 },
    experiments,
    variants,
    trafficKit,
    handoff,
  };
}

function migrateLegacyProjects(): MissionProject[] {
  const inputs: ValidationInput[] = [];

  for (const key of LEGACY_KEYS) {
    const parsed = safeParse(typeof window !== "undefined" ? window.localStorage.getItem(key) : null);
    if (!Array.isArray(parsed)) continue;
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const rawInput = (item as { input?: unknown }).input;
      if (isInput(rawInput)) inputs.push(rawInput);
    }
  }

  const unique = new Map<string, ValidationInput>();
  for (const input of inputs) {
    unique.set(`${input.idea}||${input.icp}||${input.value}`.toLowerCase(), input);
  }

  return Array.from(unique.values()).map(buildProject);
}

function deriveProjectState(project: MissionProject) {
  const ctr = project.signal.views > 0 ? round((project.signal.clicks / project.signal.views) * 100) : 0;
  const conversion = project.signal.views > 0 ? round((project.signal.leads / project.signal.views) * 100) : 0;

  const signalScore = clamp(
    project.signal.leads * 4 +
      project.signal.interviews * 7 +
      project.signal.paymentIntents * 14 +
      Math.min(ctr, 25) * 1.2 +
      Math.min(conversion, 20) * 2.2 -
      (project.signal.views >= 120 && project.signal.leads === 0 ? 22 : 0),
    0,
    100,
  );

  const liveScore = Math.round(project.analysisScore * 0.65 + signalScore * 0.35);
  const readiness: Readiness = liveScore >= 82 ? "High" : liveScore >= 64 ? "Medium" : "Low";

  const verdict: Verdict =
    project.signal.paymentIntents >= 2 || (project.signal.leads >= 10 && project.signal.interviews >= 4 && conversion >= 5)
      ? "Go"
      : project.signal.views >= 150 && project.signal.leads <= 2
        ? "Drop"
        : liveScore >= 74 && project.signal.leads >= 4
          ? "Go"
          : "Iterate";

  const confidence = clamp(liveScore + (verdict === "Go" ? 6 : verdict === "Drop" ? -4 : 0));
  const stage: Stage = verdict === "Go" && readiness === "High" ? "Ready to build" : verdict === "Iterate" ? "Validation" : "Discovery";

  const sortedStrengths = [...project.scorecard].sort((a, b) => b.score - a.score).slice(0, 2).map((item) => `${item.label}: ${item.insight}`);
  const blockers = [...project.scorecard].sort((a, b) => a.score - b.score).slice(0, 2).map((item) => `${item.label}: ${item.insight}`);

  if (project.signal.leads >= 5) sortedStrengths.push("Live signal: the project is already attracting enough interest to justify a focused next step.");
  if (project.signal.paymentIntents >= 1) sortedStrengths.push("Payment intent: buyers are starting to signal value beyond curiosity.");
  if (project.signal.views >= 120 && project.signal.leads <= 2) blockers.push("Signal quality: traffic is not turning into enough qualified demand yet.");
  if (project.signal.interviews < 3) blockers.push("Learning loop: there are not enough real buyer conversations yet.");

  const upgrades = [
    project.signal.views < 60 ? `Drive a first high-quality batch of traffic via ${project.channel}.` : "Keep traffic focused on the current winning angle.",
    project.signal.interviews < 5 ? `Book 5 interviews with ${project.input.icp.toLowerCase()} and document objections.` : "Translate interview learnings into a tighter onboarding path.",
    project.signal.paymentIntents < 2 ? "Test a stronger paid signal before expanding scope." : "Use payment intent to lock the MVP boundary.",
  ];

  const nextAction = verdict === "Go"
    ? "Lock the MVP scope around the winning workflow and stop adding breadth."
    : verdict === "Iterate"
      ? "Run the next focused experiment before changing the whole concept."
      : "Pause build mode and return to pain discovery before investing more effort.";

  const decisionReason = verdict === "Go"
    ? "Buildly sees enough evidence to move into a narrow MVP, provided the team preserves focus on the winning wedge."
    : verdict === "Iterate"
      ? "There is meaningful potential here, but Buildly still recommends one tighter validation loop before build mode."
      : "Buildly recommends pausing the current framing because the signal does not justify product expansion yet.";

  return {
    ctr,
    conversion,
    signalScore,
    liveScore,
    readiness,
    verdict,
    confidence,
    stage,
    strengths: sortedStrengths.slice(0, 3),
    blockers: blockers.slice(0, 3),
    upgrades,
    nextAction,
    decisionReason,
  };
}

function statusTone(status: ExperimentStatus) {
  if (status === "Passed") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "Failed") return "bg-rose-50 text-rose-700 border-rose-200";
  if (status === "Running") return "bg-cyan-50 text-cyan-700 border-cyan-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

function verdictTone(verdict: Verdict) {
  if (verdict === "Go") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (verdict === "Iterate") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-rose-50 text-rose-700 border-rose-200";
}

function priorityTone(priority: Priority) {
  if (priority === "P1") return "bg-emerald-100 text-emerald-700";
  if (priority === "P2") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

export default function MissionControlPage() {
  const [form, setForm] = useState<ValidationInput>(demoInputs[0]);
  const [projects, setProjects] = useState<MissionProject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const current = safeParse(typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null);
    if (Array.isArray(current) && current.length > 0) {
      setProjects(current as MissionProject[]);
      setSelectedId((current[0] as MissionProject).id);
      return;
    }

    const migrated = migrateLegacyProjects();
    if (migrated.length > 0) {
      setProjects(migrated);
      setSelectedId(migrated[0].id);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((project) => `${project.input.idea} ${project.input.icp} ${project.input.value}`.toLowerCase().includes(q));
  }, [projects, query]);

  const selectedProject = useMemo(() => projects.find((project) => project.id === selectedId) || projects[0] || null, [projects, selectedId]);
  const selectedState = useMemo(() => (selectedProject ? deriveProjectState(selectedProject) : null), [selectedProject]);
  const rankedProjects = useMemo(() => [...projects].sort((a, b) => deriveProjectState(b).liveScore - deriveProjectState(a).liveScore), [projects]);
  const averageScore = projects.length > 0 ? Math.round(rankedProjects.reduce((sum, project) => sum + deriveProjectState(project).liveScore, 0) / projects.length) : 0;
  const readyProjects = rankedProjects.filter((project) => deriveProjectState(project).stage === "Ready to build").length;
  const topProjects = rankedProjects.slice(0, 3);

  function loadExample(index: number) {
    setForm(demoInputs[index]);
  }

  function handleGenerate() {
    setIsGenerating(true);
    const next = buildProject(form);
    window.setTimeout(() => {
      setProjects((current) => [next, ...current]);
      setSelectedId(next.id);
      setActiveTab("overview");
      setIsGenerating(false);
    }, 450);
  }

  function updateProject(projectId: string, updater: (project: MissionProject) => MissionProject) {
    setProjects((current) => current.map((project) => (project.id === projectId ? { ...updater(project), updatedAt: new Date().toISOString() } : project)));
  }

  function adjustSignal(projectId: string, patch: Partial<Signal>) {
    updateProject(projectId, (project) => ({
      ...project,
      signal: {
        views: Math.max(0, project.signal.views + (patch.views || 0)),
        clicks: Math.max(0, project.signal.clicks + (patch.clicks || 0)),
        leads: Math.max(0, project.signal.leads + (patch.leads || 0)),
        interviews: Math.max(0, project.signal.interviews + (patch.interviews || 0)),
        paymentIntents: Math.max(0, project.signal.paymentIntents + (patch.paymentIntents || 0)),
      },
    }));
  }

  function setExperimentStatus(projectId: string, experimentId: string, status: ExperimentStatus) {
    updateProject(projectId, (project) => ({
      ...project,
      experiments: project.experiments.map((experiment) => (experiment.id === experimentId ? { ...experiment, status } : experiment)),
    }));
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,196,190,0.12),transparent_26%),radial-gradient(circle_at_top_right,rgba(121,103,255,0.12),transparent_28%),linear-gradient(180deg,#f8fbfd_0%,#f4f7fb_100%)] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="rounded-[32px] border border-slate-200 bg-white/88 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 text-lg font-bold text-white">B</div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Buildly Mission Control</div>
                <div className="text-xl font-bold tracking-tight text-slate-950">Live validation, experiments, comparison, and build handoff in one premium workspace</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <a href="/" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 font-semibold text-slate-700">Home</a>
              <a href="/validate" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 font-semibold text-slate-700">Validate V1</a>
              <a href="/workspace" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 font-semibold text-slate-700">Workspace</a>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[330px_1fr]">
          <aside className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Generate an exceptional project</div>
              <p className="mt-2 text-sm leading-6 text-slate-500">Create a higher-level workspace with live signal, experiment engine, portfolio compare, and build handoff.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {demoInputs.map((_, index) => (
                  <button key={index} onClick={() => loadExample(index)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">Example {index + 1}</button>
                ))}
              </div>
              <div className="mt-4 space-y-3">
                <InputField label="Idea" value={form.idea} onChange={(value) => setForm({ ...form, idea: value })} placeholder="AI tool for a painful workflow" />
                <InputField label="ICP" value={form.icp} onChange={(value) => setForm({ ...form, icp: value })} placeholder="Who feels the pain first?" />
                <InputField label="Value proposition" value={form.value} onChange={(value) => setForm({ ...form, value })} placeholder="What concrete result do they get?" textarea />
              </div>
              <button onClick={handleGenerate} disabled={isGenerating || !form.idea.trim() || !form.icp.trim() || !form.value.trim()} className="mt-4 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60">
                {isGenerating ? "Generating mission control..." : "Generate Mission Control"}
              </button>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Portfolio snapshot</div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniStat label="Projects" value={String(projects.length)} />
                <MiniStat label="Avg score" value={averageScore ? String(averageScore) : "—"} />
                <MiniStat label="Ready" value={String(readyProjects)} />
                <MiniStat label="Best score" value={rankedProjects[0] ? String(deriveProjectState(rankedProjects[0]).liveScore) : "—"} />
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Projects</div>
                  <p className="mt-1 text-sm text-slate-500">Search and reopen previous missions.</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{filteredProjects.length}</span>
              </div>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search project" className="mt-4 w-full rounded-2xl border border-slate-200 bg-[#fbfbfc] px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-200 focus:bg-white" />
              <div className="mt-4 max-h-[520px] space-y-3 overflow-auto pr-1">
                {filteredProjects.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">No project yet.</div>
                ) : filteredProjects.map((project) => {
                  const state = deriveProjectState(project);
                  return (
                    <button key={project.id} onClick={() => setSelectedId(project.id)} className={`w-full rounded-2xl border p-4 text-left transition ${selectedProject?.id === project.id ? "border-cyan-300 bg-cyan-50/60" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-slate-900">{project.input.idea}</div>
                          <div className="mt-1 text-sm text-slate-500">{project.input.icp}</div>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${verdictTone(state.verdict)}`}>{state.verdict}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span>{formatDate(project.updatedAt)}</span>
                        <span>{state.liveScore}/100</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <section className="space-y-6">
            {!selectedProject || !selectedState ? (
              <div className="rounded-[32px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 shadow-sm">
                Generate your first project to unlock Mission Control.
              </div>
            ) : (
              <>
                <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-3xl">
                      <div className="flex flex-wrap gap-2">
                        <span className={`rounded-full border px-3 py-2 text-sm font-semibold ${verdictTone(selectedState.verdict)}`}>{selectedState.verdict}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">Stage · {selectedState.stage}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">Readiness · {selectedState.readiness}</span>
                      </div>
                      <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-slate-950 md:text-5xl">{selectedProject.input.idea}</h1>
                      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-500 md:text-lg">{selectedProject.input.value}</p>
                      <div className="mt-5 rounded-3xl border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(45,197,186,0.16),transparent_35%),linear-gradient(135deg,#0f172a,#111827_55%,#0b2230)] p-5 text-white">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Executive summary</div>
                            <div className="mt-3 text-5xl font-bold tracking-tight">{selectedState.liveScore}/100</div>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200">{selectedState.decisionReason}</p>
                          </div>
                          <div className="grid gap-3 md:min-w-[300px] md:grid-cols-2">
                            <HeroMetric label="Confidence" value={`${selectedState.confidence}%`} />
                            <HeroMetric label="CTR" value={`${selectedState.ctr}%`} />
                            <HeroMetric label="Conversion" value={`${selectedState.conversion}%`} />
                            <HeroMetric label="Channel" value={selectedProject.channel} small />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 lg:w-[330px]">
                      <div className="text-sm font-semibold text-slate-900">Founder copilot</div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{selectedState.nextAction}</p>
                      <div className="mt-4 rounded-2xl bg-white p-4">
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-600">Wedge</div>
                        <p className="mt-2 text-sm leading-6 text-slate-700">{selectedProject.wedge}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm">
                  <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} label="Overview" />
                  <TabButton active={activeTab === "signal"} onClick={() => setActiveTab("signal")} label="Live signal" />
                  <TabButton active={activeTab === "experiments"} onClick={() => setActiveTab("experiments")} label="Experiment board" />
                  <TabButton active={activeTab === "compare"} onClick={() => setActiveTab("compare")} label="Portfolio compare" />
                  <TabButton active={activeTab === "handoff"} onClick={() => setActiveTab("handoff")} label="Build handoff" />
                </div>

                {activeTab === "overview" ? (
                  <div className="grid gap-6">
                    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="text-sm font-semibold text-slate-900">Validation scorecard</div>
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                          {selectedProject.scorecard.map((item) => (
                            <div key={item.label} className="rounded-2xl border border-slate-200 p-4">
                              <div className="flex items-center justify-between gap-3">
                                <div className="font-semibold text-slate-900">{item.label}</div>
                                <div className="text-sm font-semibold text-slate-900">{item.score}/100</div>
                              </div>
                              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                                <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500" style={{ width: `${item.score}%` }} />
                              </div>
                              <p className="mt-3 text-sm leading-6 text-slate-500">{item.insight}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="text-sm font-semibold text-slate-900">Verdict explanation</div>
                        <div className="mt-4 space-y-4">
                          <InsightBlock title="What is strong" items={selectedState.strengths} />
                          <InsightBlock title="What blocks this project" items={selectedState.blockers} />
                          <InsightBlock title="How to increase value" items={selectedState.upgrades} />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="text-sm font-semibold text-slate-900">Mission checklist</div>
                      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {selectedProject.handoff.risks.map((risk) => (
                          <div key={risk} className="rounded-2xl border border-slate-200 p-4 text-sm leading-6 text-slate-700">{risk}</div>
                        ))}
                        {selectedProject.handoff.doNotBuild.map((item) => (
                          <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{item}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                {activeTab === "signal" ? (
                  <div className="grid gap-6">
                    <div className="grid gap-4 md:grid-cols-5">
                      <MetricCard label="Views" value={String(selectedProject.signal.views)} />
                      <MetricCard label="Clicks" value={String(selectedProject.signal.clicks)} />
                      <MetricCard label="Leads" value={String(selectedProject.signal.leads)} />
                      <MetricCard label="Interviews" value={String(selectedProject.signal.interviews)} />
                      <MetricCard label="Payment intent" value={String(selectedProject.signal.paymentIntents)} />
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="text-sm font-semibold text-slate-900">Live validation engine</div>
                        <p className="mt-2 text-sm leading-6 text-slate-500">Use these controls to simulate real market signal and watch the verdict evolve in real time.</p>
                        <div className="mt-5 flex flex-wrap gap-3">
                          <ActionButton label="+25 views" onClick={() => adjustSignal(selectedProject.id, { views: 25 })} />
                          <ActionButton label="+5 clicks" onClick={() => adjustSignal(selectedProject.id, { clicks: 5 })} />
                          <ActionButton label="+2 leads" onClick={() => adjustSignal(selectedProject.id, { leads: 2 })} />
                          <ActionButton label="+1 interview" onClick={() => adjustSignal(selectedProject.id, { interviews: 1 })} />
                          <ActionButton label="+1 payment intent" onClick={() => adjustSignal(selectedProject.id, { paymentIntents: 1 })} />
                          <ActionButton label="Reset signal" onClick={() => updateProject(selectedProject.id, (project) => ({ ...project, signal: { views: 0, clicks: 0, leads: 0, interviews: 0, paymentIntents: 0 } }))} subtle />
                        </div>
                      </div>

                      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="text-sm font-semibold text-slate-900">Live decision</div>
                        <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className={`inline-flex rounded-full border px-3 py-2 text-sm font-semibold ${verdictTone(selectedState.verdict)}`}>{selectedState.verdict}</div>
                              <div className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{selectedState.liveScore}/100</div>
                            </div>
                            <div className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700">Signal score · {selectedState.signalScore}</div>
                          </div>
                          <p className="mt-4 text-sm leading-7 text-slate-600">{selectedState.decisionReason}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {activeTab === "experiments" ? (
                  <div className="grid gap-6 xl:grid-cols-4">
                    {(["Planned", "Running", "Passed", "Failed"] as ExperimentStatus[]).map((status) => (
                      <div key={status} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-slate-900">{status}</div>
                          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(status)}`}>{selectedProject.experiments.filter((item) => item.status === status).length}</span>
                        </div>
                        <div className="mt-4 space-y-3">
                          {selectedProject.experiments.filter((item) => item.status === status).length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">No experiment in this lane.</div>
                          ) : selectedProject.experiments.filter((item) => item.status === status).map((experiment) => (
                            <div key={experiment.id} className="rounded-2xl border border-slate-200 p-4">
                              <div className="font-semibold text-slate-900">{experiment.title}</div>
                              <div className="mt-2 text-sm leading-6 text-slate-600">{experiment.hypothesis}</div>
                              <div className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-600">{experiment.channel}</div>
                              <div className="mt-2 text-sm leading-6 text-slate-500">Success: {experiment.successMetric}</div>
                              <div className="mt-4 flex flex-wrap gap-2">
                                {(["Planned", "Running", "Passed", "Failed"] as ExperimentStatus[]).map((candidate) => (
                                  <button key={candidate} onClick={() => setExperimentStatus(selectedProject.id, experiment.id, candidate)} className={`rounded-full border px-3 py-1 text-xs font-semibold ${candidate === experiment.status ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
                                    {candidate}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {activeTab === "compare" ? (
                  <div className="grid gap-6">
                    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="text-sm font-semibold text-slate-900">Portfolio leaderboard</div>
                      <div className="mt-5 grid gap-4 md:grid-cols-3">
                        {topProjects.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">No project yet.</div>
                        ) : topProjects.map((project) => {
                          const state = deriveProjectState(project);
                          return (
                            <button key={project.id} onClick={() => setSelectedId(project.id)} className={`rounded-2xl border p-5 text-left transition ${selectedProject.id === project.id ? "border-cyan-300 bg-cyan-50/50" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
                              <div className="flex items-start justify-between gap-3">
                                <div className="font-semibold text-slate-900">{project.input.idea}</div>
                                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${verdictTone(state.verdict)}`}>{state.verdict}</span>
                              </div>
                              <div className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{state.liveScore}</div>
                              <div className="mt-1 text-sm text-slate-500">{project.input.icp}</div>
                              <div className="mt-4 text-sm leading-6 text-slate-600">{state.nextAction}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="text-sm font-semibold text-slate-900">Compare what matters</div>
                      <div className="mt-5 overflow-auto">
                        <table className="min-w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-500">
                              <th className="px-3 py-3 font-semibold">Project</th>
                              <th className="px-3 py-3 font-semibold">Live score</th>
                              <th className="px-3 py-3 font-semibold">Verdict</th>
                              <th className="px-3 py-3 font-semibold">Leads</th>
                              <th className="px-3 py-3 font-semibold">Interviews</th>
                              <th className="px-3 py-3 font-semibold">Payment intent</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rankedProjects.map((project) => {
                              const state = deriveProjectState(project);
                              return (
                                <tr key={project.id} className="border-b border-slate-100">
                                  <td className="px-3 py-4">
                                    <button onClick={() => setSelectedId(project.id)} className="text-left font-semibold text-slate-900 hover:text-cyan-700">{project.input.idea}</button>
                                    <div className="mt-1 text-xs text-slate-500">{project.input.icp}</div>
                                  </td>
                                  <td className="px-3 py-4 font-semibold text-slate-900">{state.liveScore}</td>
                                  <td className="px-3 py-4"><span className={`rounded-full border px-3 py-1 text-xs font-semibold ${verdictTone(state.verdict)}`}>{state.verdict}</span></td>
                                  <td className="px-3 py-4 text-slate-700">{project.signal.leads}</td>
                                  <td className="px-3 py-4 text-slate-700">{project.signal.interviews}</td>
                                  <td className="px-3 py-4 text-slate-700">{project.signal.paymentIntents}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : null}

                {activeTab === "handoff" ? (
                  <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="text-sm font-semibold text-slate-900">Premium build handoff</div>
                      <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-600">Product thesis</div>
                        <p className="mt-3 text-sm leading-7 text-slate-700">{selectedProject.handoff.thesis}</p>
                      </div>
                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <InfoPanel title="MVP goal" body={selectedProject.handoff.mvpGoal} />
                        <InfoPanel title="Activation moment" body={selectedProject.handoff.activationMoment} />
                      </div>
                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <ListPanel title="User flow" items={selectedProject.handoff.userFlow} />
                        <ListPanel title="Pages to build" items={selectedProject.handoff.pages} />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="text-sm font-semibold text-slate-900">Backlog priorities</div>
                        <div className="mt-4 space-y-3">
                          {selectedProject.handoff.buildPlan.map((item) => (
                            <div key={item.title} className="rounded-2xl border border-slate-200 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="font-semibold text-slate-900">{item.title}</div>
                                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                                </div>
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityTone(item.priority)}`}>{item.priority}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="text-sm font-semibold text-slate-900">Do not build yet</div>
                        <div className="mt-4 space-y-3">
                          {selectedProject.handoff.doNotBuild.map((item) => (
                            <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{item}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-2xl font-bold tracking-tight text-slate-950">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{label}</div>
    </div>
  );
}

function HeroMetric({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">{label}</div>
      <div className={`mt-2 font-semibold text-white ${small ? "text-sm leading-6" : "text-2xl"}`}>{value}</div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-3xl font-bold tracking-tight text-slate-950">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, textarea }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; textarea?: boolean }) {
  return (
    <label className="block text-left">
      <span className="mb-2 block text-sm font-semibold text-slate-900">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-[#fbfbfc] px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-200 focus:bg-white" />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-slate-200 bg-[#fbfbfc] px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-200 focus:bg-white" />
      )}
    </label>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${active ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-700 hover:bg-slate-100"}`}>
      {label}
    </button>
  );
}

function ActionButton({ label, onClick, subtle }: { label: string; onClick: () => void; subtle?: boolean }) {
  return (
    <button onClick={onClick} className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${subtle ? "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100" : "bg-slate-950 text-white hover:bg-slate-900"}`}>
      {label}
    </button>
  );
}

function InsightBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{item}</div>
        ))}
      </div>
    </div>
  );
}

function TrafficCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <button onClick={() => copyText(text)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">Copy</button>
      </div>
      <pre className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{text}</pre>
    </div>
  );
}

function InfoPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}

function ListPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
