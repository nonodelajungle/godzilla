"use client";

import { useEffect, useMemo, useState } from "react";

type Verdict = "Go" | "Iterate" | "Drop";
type Readiness = "Low" | "Medium" | "High";
type Stage = "Discovery" | "Validation" | "Ready to build";
type Priority = "P1" | "P2" | "P3";

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

type WorkspaceProject = {
  id: string;
  createdAt: string;
  updatedAt: string;
  input: ValidationInput;
  score: number;
  verdict: Verdict;
  readiness: Readiness;
  stage: Stage;
  confidence: number;
  scorecard: ScorecardItem[];
  channel: string;
  wedge: string;
  nextAction: string;
  decisionReason: string;
  launchChecklist: string[];
  risks: string[];
  experiments: string[];
  landingVariants: Variant[];
  trafficKit: {
    linkedin: string;
    dm: string;
    email: string;
    community: string;
  };
  buildPlan: BuildItem[];
  doNotBuild: string[];
};

type LegacyProject = {
  id: string;
  createdAt: string;
  updatedAt: string;
  input: ValidationInput;
  score: number;
  verdict: Verdict;
  readiness: Readiness;
  scorecard: ScorecardItem[];
  channel: string;
  wedge: string;
  decisionReason: string;
  landingVariants: string[];
  trafficKit: {
    linkedin: string;
    dm: string;
    email: string;
    community: string;
  };
  blueprint: Array<{ title: string; description: string; effort: "S" | "M" | "L" }>;
};

const STORAGE_KEY = "buildly-workspace-pro-v1";
const LEGACY_STORAGE_KEY = "buildly-validate-workspace-v1";

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

function hashText(value: string) {
  let total = 0;
  for (let i = 0; i < value.length; i += 1) total += value.charCodeAt(i) * (i + 1);
  return total;
}

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readinessFromScore(score: number): Readiness {
  if (score >= 80) return "High";
  if (score >= 64) return "Medium";
  return "Low";
}

function verdictFromScore(score: number): Verdict {
  if (score >= 74) return "Go";
  if (score >= 58) return "Iterate";
  return "Drop";
}

function stageFromVerdict(verdict: Verdict, readiness: Readiness): Stage {
  if (verdict === "Go" && readiness === "High") return "Ready to build";
  if (verdict === "Iterate") return "Validation";
  return "Discovery";
}

function toneForVerdict(verdict: Verdict) {
  if (verdict === "Go") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (verdict === "Iterate") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-rose-50 text-rose-700 border-rose-200";
}

function toneForPriority(priority: Priority) {
  if (priority === "P1") return "bg-emerald-100 text-emerald-700";
  if (priority === "P2") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function copyText(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text);
  }
}

function buildProject(input: ValidationInput): WorkspaceProject {
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
      insight: willingnessToPay >= 70 ? "The promise is close to a monetizable business pain." : "You likely need a clearer ROI or a narrower buyer segment.",
    },
    {
      label: "Channel access",
      score: channelAccess,
      insight: channelAccess >= 70 ? "You have a believable first route to reach qualified buyers." : "The acquisition wedge is not obvious enough yet.",
    },
    {
      label: "Differentiation",
      score: differentiation,
      insight: differentiation >= 70 ? "The wedge is distinct enough to stand out in an early test." : "The positioning still risks sounding too generic.",
    },
  ];

  const score = Math.round(scorecard.reduce((sum, item) => sum + item.score, 0) / scorecard.length);
  const verdict = verdictFromScore(score);
  const readiness = readinessFromScore(score);
  const confidence = clamp(score + (verdict === "Go" ? 6 : verdict === "Iterate" ? 0 : -6));
  const stage = stageFromVerdict(verdict, readiness);

  const channel = channelAccess >= 72
    ? "Founder-led outreach + LinkedIn"
    : channelAccess >= 60
      ? "LinkedIn + niche communities"
      : "Manual interviews + micro landing page";

  const wedge = differentiation >= 68
    ? `Own one painful job: ${idea.toLowerCase()} for ${icp.toLowerCase()}.`
    : `Position around one painful workflow for ${icp.toLowerCase()}, not the whole market.`;

  const nextAction = verdict === "Go"
    ? "Launch one focused landing test, collect 10 qualified conversations, then lock the MVP scope."
    : verdict === "Iterate"
      ? "Rewrite the promise for one sharper sub-segment and rerun the first validation loop."
      : "Pause product build and do problem discovery interviews before writing more code.";

  const decisionReason = verdict === "Go"
    ? "The signal looks strong enough to justify a narrow MVP once the first traction loop confirms the wedge."
    : verdict === "Iterate"
      ? "There is potential here, but the message or audience still needs tightening before build mode."
      : "The current framing is too weak to justify building before deeper discovery.";

  const risks = [
    channelAccess < 62 ? "Acquisition path is still under-defined." : "The first channel exists, but message discipline matters.",
    willingnessToPay < 66 ? "ROI is not explicit enough yet." : "Pricing can likely be tested earlier than usual.",
    differentiation < 64 ? "The concept still risks sounding horizontal." : "The wedge is clear, but focus must stay narrow.",
  ];

  const experiments = [
    `Test one headline built around: ${value.replace(/\.$/, "")}`,
    `Run one lightweight acquisition experiment on ${channel}.`,
    `Interview 5 ${icp.toLowerCase()} and ask what they do today instead.`,
  ];

  const launchChecklist = [
    "Write one promise for one buyer, not three buyers at once.",
    "Publish only one primary CTA for the first experiment.",
    "Collect qualitative notes from every interested lead.",
    "Do not expand scope before a clear winning angle emerges.",
  ];

  const landingVariants: Variant[] = [
    {
      title: "Pain-first",
      copy: `Stop losing time with ${idea.toLowerCase()}. Built for ${icp.toLowerCase()} who need results faster.`,
      cta: "Get early access",
      useCase: "Use this when the pain is already obvious to the buyer.",
    },
    {
      title: "Outcome-first",
      copy: `From messy workflow to measurable outcome: ${value}`,
      cta: "See the workflow",
      useCase: "Use this when the user buys the result more than the mechanics.",
    },
    {
      title: "Niche-wedge",
      copy: `The narrow path for ${icp.toLowerCase()} who want ${value.toLowerCase()}`,
      cta: "Join the waitlist",
      useCase: "Use this when you need sharper positioning against broad tools.",
    },
  ];

  const trafficKit = {
    linkedin: `Most ${icp.toLowerCase()} do not need more tools. They need a shorter path to ${value.toLowerCase()} I’m validating that assumption now with a very narrow product wedge.`,
    dm: `Hey — I’m testing a focused product for ${icp.toLowerCase()} that helps them ${value.toLowerCase()} Open to a 10-minute reaction?`,
    email: `Subject: Quick feedback request\n\nI’m validating a focused solution for ${icp.toLowerCase()} to ${value.toLowerCase()} Curious what your current workaround looks like.`,
    community: `I’m validating a product for ${icp.toLowerCase()} around this promise: “${value}”. Looking for direct feedback from people who live this workflow.`,
  };

  const buildPlan: BuildItem[] = [
    {
      title: "Validation dashboard",
      description: "Single screen with score, verdict, winning angle, and next action.",
      priority: "P1",
    },
    {
      title: "Messaging generator",
      description: "Three testable positioning angles with copy ready to ship.",
      priority: "P1",
    },
    {
      title: "Traffic launcher",
      description: "Acquisition assets that move the founder from analysis to action immediately.",
      priority: "P1",
    },
    {
      title: "History and compare",
      description: "Reopen ideas and compare which project deserves build mode first.",
      priority: "P2",
    },
    {
      title: "Build scope lock",
      description: "Explicitly mark what enters v1 and what stays out of scope.",
      priority: "P2",
    },
  ];

  const doNotBuild = [
    "Complex collaboration before one ICP clearly wins.",
    "Settings/admin surfaces that do not improve validation or activation.",
    "Feature breadth that dilutes the core workflow promise.",
  ];

  const now = new Date().toISOString();

  return {
    id: makeId(),
    createdAt: now,
    updatedAt: now,
    input: { idea, icp, value },
    score,
    verdict,
    readiness,
    stage,
    confidence,
    scorecard,
    channel,
    wedge,
    nextAction,
    decisionReason,
    launchChecklist,
    risks,
    experiments,
    landingVariants,
    trafficKit,
    buildPlan,
    doNotBuild,
  };
}

function migrateLegacyProject(project: LegacyProject): WorkspaceProject {
  const verdict = project.verdict;
  const readiness = project.readiness;
  const stage = stageFromVerdict(verdict, readiness);
  const confidence = clamp(project.score + (verdict === "Go" ? 6 : verdict === "Iterate" ? 0 : -6));

  return {
    id: project.id,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    input: project.input,
    score: project.score,
    verdict,
    readiness,
    stage,
    confidence,
    scorecard: project.scorecard,
    channel: project.channel,
    wedge: project.wedge,
    nextAction: verdict === "Go"
      ? "Move into a narrow MVP scope after one more traction test."
      : verdict === "Iterate"
        ? "Tighten ICP and message before expanding build scope."
        : "Return to discovery before coding more features.",
    decisionReason: project.decisionReason,
    launchChecklist: [
      "Keep one primary audience per experiment.",
      "Use one CTA at a time.",
      "Collect notes from each interested lead.",
      "Do not add feature breadth before a winner appears.",
    ],
    risks: [
      "Current wedge may still be too broad.",
      "Demand signal needs stronger proof before scaling.",
      "Channel quality matters more than traffic volume at this stage.",
    ],
    experiments: [
      "Compare one winning headline against one sharper niche variant.",
      `Push one test on ${project.channel}.`,
      `Interview 5 ${project.input.icp.toLowerCase()} about current workarounds.`,
    ],
    landingVariants: project.landingVariants.map((copy, index) => ({
      title: `Variant ${index + 1}`,
      copy,
      cta: index === 0 ? "Get early access" : index === 1 ? "See the workflow" : "Join the waitlist",
      useCase: "Migrated from the previous Buildly validation workspace.",
    })),
    trafficKit: project.trafficKit,
    buildPlan: project.blueprint.map((item, index) => ({
      title: item.title,
      description: item.description,
      priority: index < 2 ? "P1" : index < 4 ? "P2" : "P3",
    })),
    doNotBuild: [
      "Large collaboration surfaces before traction quality is proven.",
      "Broad dashboards that do not move validation forward.",
      "Too many workflows in v1.",
    ],
  };
}

export default function PremiumWorkspacePage() {
  const [form, setForm] = useState<ValidationInput>(demoInputs[0]);
  const [projects, setProjects] = useState<WorkspaceProject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "messaging" | "gtm" | "build">("overview");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as WorkspaceProject[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProjects(parsed);
          setSelectedId(parsed[0].id);
          return;
        }
      }

      const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!legacyRaw) return;
      const legacyParsed = JSON.parse(legacyRaw) as LegacyProject[];
      if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
        const migrated = legacyParsed.map(migrateLegacyProject);
        setProjects(migrated);
        setSelectedId(migrated[0].id);
      }
    } catch {
      // ignore malformed storage
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const selectedProject = useMemo(() => projects.find((project) => project.id === selectedId) || projects[0] || null, [projects, selectedId]);
  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((project) => `${project.input.idea} ${project.input.icp} ${project.input.value}`.toLowerCase().includes(q));
  }, [projects, query]);

  const averageScore = projects.length ? Math.round(projects.reduce((sum, project) => sum + project.score, 0) / projects.length) : 0;
  const readyProjects = projects.filter((project) => project.stage === "Ready to build").length;
  const topProjects = [...projects].sort((a, b) => b.score - a.score).slice(0, 3);

  function loadExample(index: number) {
    setForm(demoInputs[index]);
  }

  function handleGenerate() {
    setIsGenerating(true);
    const nextProject = buildProject(form);
    window.setTimeout(() => {
      setProjects((current) => [nextProject, ...current]);
      setSelectedId(nextProject.id);
      setActiveTab("overview");
      setIsGenerating(false);
    }, 450);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,196,190,0.12),transparent_26%),radial-gradient(circle_at_top_right,rgba(121,103,255,0.12),transparent_28%),linear-gradient(180deg,#f8fbfd_0%,#f4f7fb_100%)] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="rounded-[32px] border border-slate-200 bg-white/85 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 text-lg font-bold text-white">B</div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Buildly premium workspace</div>
                <div className="text-xl font-bold tracking-tight text-slate-950">From idea scoring to launch plan and build scope</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <a href="/" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 font-semibold text-slate-700">Home</a>
              <a href="/validate" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 font-semibold text-slate-700">Validate V1</a>
              <a href="/dashboard" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 font-semibold text-slate-700">Dashboard</a>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[320px_1fr]">
          <aside className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Create a premium project</div>
              <p className="mt-2 text-sm leading-6 text-slate-500">Generate a higher-level workspace with score, positioning, GTM, and build scope.</p>
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
                {isGenerating ? "Generating workspace..." : "Generate premium workspace"}
              </button>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Portfolio snapshot</div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniStat label="Projects" value={String(projects.length)} />
                <MiniStat label="Avg score" value={averageScore ? String(averageScore) : "—"} />
                <MiniStat label="Ready" value={String(readyProjects)} />
                <MiniStat label="Top score" value={projects[0] ? String(Math.max(...projects.map((item) => item.score))) : "—"} />
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Projects</div>
                  <p className="mt-1 text-sm text-slate-500">Search and reopen previous work.</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{filteredProjects.length}</span>
              </div>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search project" className="mt-4 w-full rounded-2xl border border-slate-200 bg-[#fbfbfc] px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-200 focus:bg-white" />
              <div className="mt-4 max-h-[480px] space-y-3 overflow-auto pr-1">
                {filteredProjects.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">No project yet.</div>
                ) : filteredProjects.map((project) => (
                  <button key={project.id} onClick={() => setSelectedId(project.id)} className={`w-full rounded-2xl border p-4 text-left transition ${selectedProject?.id === project.id ? "border-cyan-300 bg-cyan-50/60" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-900">{project.input.idea}</div>
                        <div className="mt-1 text-sm text-slate-500">{project.input.icp}</div>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneForVerdict(project.verdict)}`}>{project.verdict}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>{formatDate(project.updatedAt)}</span>
                      <span>{project.score}/100</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="space-y-6">
            {!selectedProject ? (
              <div className="rounded-[32px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 shadow-sm">
                Generate your first project to unlock the premium workspace.
              </div>
            ) : (
              <>
                <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-3xl">
                      <div className="flex flex-wrap gap-2">
                        <span className={`rounded-full border px-3 py-2 text-sm font-semibold ${toneForVerdict(selectedProject.verdict)}`}>{selectedProject.verdict}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">Stage · {selectedProject.stage}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">Readiness · {selectedProject.readiness}</span>
                      </div>
                      <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-slate-950 md:text-5xl">{selectedProject.input.idea}</h1>
                      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-500 md:text-lg">{selectedProject.input.value}</p>
                      <div className="mt-5 rounded-3xl border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(45,197,186,0.16),transparent_35%),linear-gradient(135deg,#0f172a,#111827_55%,#0b2230)] p-5 text-white">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Executive summary</div>
                            <div className="mt-3 text-5xl font-bold tracking-tight">{selectedProject.score}/100</div>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200">{selectedProject.decisionReason}</p>
                          </div>
                          <div className="grid gap-3 md:min-w-[280px] md:grid-cols-2">
                            <HeroMetric label="Confidence" value={`${selectedProject.confidence}%`} />
                            <HeroMetric label="Channel" value={selectedProject.channel} small />
                            <HeroMetric label="ICP" value={selectedProject.input.icp} small />
                            <HeroMetric label="Next move" value="Launch focused test" small />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 lg:w-[320px]">
                      <div className="text-sm font-semibold text-slate-900">Recommended next action</div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{selectedProject.nextAction}</p>
                      <div className="mt-4 rounded-2xl bg-white p-4">
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-600">Wedge</div>
                        <p className="mt-2 text-sm leading-6 text-slate-700">{selectedProject.wedge}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm">
                  <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} label="Overview" />
                  <TabButton active={activeTab === "messaging"} onClick={() => setActiveTab("messaging")} label="Messaging" />
                  <TabButton active={activeTab === "gtm"} onClick={() => setActiveTab("gtm")} label="Go-to-market" />
                  <TabButton active={activeTab === "build"} onClick={() => setActiveTab("build")} label="Build plan" />
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
                        <div className="text-sm font-semibold text-slate-900">Risks to manage</div>
                        <div className="mt-4 space-y-3">
                          {selectedProject.risks.map((risk) => (
                            <div key={risk} className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{risk}</div>
                          ))}
                        </div>
                        <div className="mt-5 text-sm font-semibold text-slate-900">Launch checklist</div>
                        <div className="mt-3 space-y-3">
                          {selectedProject.launchChecklist.map((item) => (
                            <div key={item} className="rounded-2xl border border-slate-200 p-4 text-sm leading-6 text-slate-600">{item}</div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">Portfolio compare</div>
                          <p className="mt-2 text-sm text-slate-500">See which project deserves build attention first.</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Top projects</span>
                      </div>
                      <div className="mt-5 grid gap-4 md:grid-cols-3">
                        {topProjects.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">No project yet.</div>
                        ) : topProjects.map((project) => (
                          <button key={project.id} onClick={() => setSelectedId(project.id)} className={`rounded-2xl border p-5 text-left transition ${selectedProject.id === project.id ? "border-cyan-300 bg-cyan-50/50" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="font-semibold text-slate-900">{project.input.idea}</div>
                              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneForVerdict(project.verdict)}`}>{project.verdict}</span>
                            </div>
                            <div className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{project.score}</div>
                            <div className="mt-1 text-sm text-slate-500">{project.input.icp}</div>
                            <div className="mt-4 text-sm leading-6 text-slate-600">{project.nextAction}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                {activeTab === "messaging" ? (
                  <div className="grid gap-6">
                    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="text-sm font-semibold text-slate-900">Positioning wedge</div>
                      <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">{selectedProject.wedge}</div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                      {selectedProject.landingVariants.map((variant) => (
                        <div key={variant.title} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-semibold text-slate-900">{variant.title}</div>
                            <button onClick={() => copyText(`${variant.copy}\nCTA: ${variant.cta}`)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">Copy</button>
                          </div>
                          <p className="mt-4 text-base leading-7 text-slate-800">{variant.copy}</p>
                          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">{variant.useCase}</div>
                          <div className="mt-4 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">{variant.cta}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {activeTab === "gtm" ? (
                  <div className="grid gap-6">
                    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="text-sm font-semibold text-slate-900">Recommended experiments</div>
                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        {selectedProject.experiments.map((experiment) => (
                          <div key={experiment} className="rounded-2xl border border-slate-200 p-4 text-sm leading-6 text-slate-700">{experiment}</div>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-6 lg:grid-cols-2">
                      <TrafficCard title="LinkedIn post" text={selectedProject.trafficKit.linkedin} />
                      <TrafficCard title="Direct message" text={selectedProject.trafficKit.dm} />
                      <TrafficCard title="Email outreach" text={selectedProject.trafficKit.email} />
                      <TrafficCard title="Community post" text={selectedProject.trafficKit.community} />
                    </div>
                  </div>
                ) : null}

                {activeTab === "build" ? (
                  <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
                    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="text-sm font-semibold text-slate-900">Build scope</div>
                      <div className="mt-5 space-y-3">
                        {selectedProject.buildPlan.map((item) => (
                          <div key={item.title} className="rounded-2xl border border-slate-200 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="font-semibold text-slate-900">{item.title}</div>
                                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                              </div>
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneForPriority(item.priority)}`}>{item.priority}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="text-sm font-semibold text-slate-900">Do not build yet</div>
                      <div className="mt-4 space-y-3">
                        {selectedProject.doNotBuild.map((item) => (
                          <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{item}</div>
                        ))}
                      </div>
                      <div className="mt-5 rounded-3xl border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(45,197,186,0.12),transparent_35%),linear-gradient(135deg,#0f172a,#111827_55%,#0b2230)] p-5 text-white">
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Build principle</div>
                        <p className="mt-3 text-sm leading-7 text-slate-200">Ship the narrowest workflow that proves the wedge. High-level products feel premium because they are focused, not because they are overloaded.</p>
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

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${active ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-700 hover:bg-slate-100"}`}>
      {label}
    </button>
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
