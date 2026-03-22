"use client";

import { useEffect, useMemo, useState } from "react";

type Verdict = "Go" | "Iterate" | "Drop";
type Effort = "S" | "M" | "L";

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

type BlueprintItem = {
  title: string;
  description: string;
  effort: Effort;
};

type Project = {
  id: string;
  createdAt: string;
  updatedAt: string;
  input: ValidationInput;
  score: number;
  verdict: Verdict;
  readiness: "Low" | "Medium" | "High";
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
  blueprint: BlueprintItem[];
};

const STORAGE_KEY = "buildly-validate-workspace-v1";

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

function buildProject(input: ValidationInput): Project {
  const idea = input.idea.trim() || "New startup idea";
  const icp = input.icp.trim() || "Early users";
  const value = input.value.trim() || "Help users solve a painful workflow faster.";
  const text = `${idea} ${icp} ${value}`.toLowerCase();
  const seed = hashText(text);

  const urgency = clamp(45 + (seed % 38) + (/save|revenue|sales|manual|cost|faster|time|pipeline|clients/.test(text) ? 9 : 0));
  const willingnessToPay = clamp(42 + (Math.floor(seed / 7) % 36) + (/b2b|agency|saas|sales|ops|finance|crm/.test(text) ? 12 : 0));
  const channelAccess = clamp(40 + (Math.floor(seed / 11) % 34) + (/freelance|agency|designer|coach|founder|creator|saas/.test(text) ? 10 : 0));
  const differentiation = clamp(38 + (Math.floor(seed / 13) % 32) + (/assistant|copilot|automation|qualify|activation|proposal/.test(text) ? 11 : 0));

  const scorecard: ScorecardItem[] = [
    {
      label: "Urgency",
      score: urgency,
      insight: urgency >= 70 ? "Pain looks immediate enough for a fast validation test." : "Pain exists, but the triggering moment still needs sharpening.",
    },
    {
      label: "Willingness to pay",
      score: willingnessToPay,
      insight: willingnessToPay >= 70 ? "The offer sounds monetizable if ROI stays concrete." : "Monetization may require a narrower promise or stronger ROI framing.",
    },
    {
      label: "Channel access",
      score: channelAccess,
      insight: channelAccess >= 70 ? "There is a believable first distribution wedge." : "Go narrower on the ICP and first channel before scaling traffic.",
    },
    {
      label: "Differentiation",
      score: differentiation,
      insight: differentiation >= 70 ? "The wedge feels distinct enough to stand out early." : "The positioning still risks sounding too horizontal.",
    },
  ];

  const score = Math.round(scorecard.reduce((sum, item) => sum + item.score, 0) / scorecard.length);
  const verdict: Verdict = score >= 74 ? "Go" : score >= 58 ? "Iterate" : "Drop";
  const readiness = score >= 80 ? "High" : score >= 64 ? "Medium" : "Low";
  const channel = channelAccess >= 72 ? "Founder-led outreach + LinkedIn" : channelAccess >= 60 ? "LinkedIn + niche communities" : "Manual interviews + micro landing page";
  const wedge = differentiation >= 68
    ? `Own one job: ${idea.toLowerCase()} for ${icp.toLowerCase()}.`
    : `Position around one painful workflow for ${icp.toLowerCase()}, not the whole market.`;

  const decisionReason = verdict === "Go"
    ? "The signal is strong enough to justify a narrow MVP after one more traction loop."
    : verdict === "Iterate"
      ? "The project has potential, but the message or audience still needs tightening."
      : "The current framing is too weak to justify building before deeper discovery.";

  const landingVariants = [
    `Stop losing time with ${idea.toLowerCase()}. Built for ${icp.toLowerCase()} who need results faster.`,
    `From messy workflow to measurable outcome: ${value}`,
    `The narrow path for ${icp.toLowerCase()} who want ${value.toLowerCase()}`,
  ];

  const trafficKit = {
    linkedin: `Most ${icp.toLowerCase()} do not need more tools. They need a shorter path to ${value.toLowerCase()} I’m testing that assumption now.`,
    dm: `Hey — I’m validating a product for ${icp.toLowerCase()} that helps them ${value.toLowerCase()} Open to a 10-minute reaction?`,
    email: `Subject: Quick feedback request\n\nI’m testing a focused solution for ${icp.toLowerCase()} to ${value.toLowerCase()} Would you be open to replying with your current workaround?`,
    community: `I’m validating a product for ${icp.toLowerCase()} around this promise: “${value}” Looking for honest feedback from people who live this workflow.`,
  };

  const blueprint: BlueprintItem[] = [
    {
      title: "Project dashboard",
      description: "One page with score, verdict, next action, and the current winning positioning angle.",
      effort: "S",
    },
    {
      title: "Validation scorecard",
      description: "Expose urgency, willingness to pay, channel access, and differentiation as first-class decision signals.",
      effort: "S",
    },
    {
      title: "Landing variants",
      description: "Generate 3 testable messaging angles so the founder can compare promise quality quickly.",
      effort: "M",
    },
    {
      title: "Traffic kit",
      description: "Give the user ready-to-copy acquisition content instead of stopping at analysis.",
      effort: "M",
    },
    {
      title: "History and resume",
      description: "Save projects locally and let the founder reopen any past validation flow instantly.",
      effort: "S",
    },
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
    scorecard,
    channel,
    wedge,
    decisionReason,
    landingVariants,
    trafficKit,
    blueprint,
  };
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function toneForVerdict(verdict: Verdict) {
  if (verdict === "Go") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (verdict === "Iterate") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-rose-50 text-rose-700 border-rose-200";
}

function toneForEffort(effort: Effort) {
  if (effort === "S") return "bg-emerald-100 text-emerald-700";
  if (effort === "M") return "bg-amber-100 text-amber-700";
  return "bg-rose-100 text-rose-700";
}

export default function ValidateWorkspacePage() {
  const [form, setForm] = useState<ValidationInput>(demoInputs[0]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Project[];
      if (Array.isArray(parsed)) {
        setProjects(parsed);
        if (parsed[0]) setSelectedId(parsed[0].id);
      }
    } catch {
      // ignore storage parse issues
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((project) => `${project.input.idea} ${project.input.icp} ${project.input.value}`.toLowerCase().includes(q));
  }, [projects, query]);

  const selectedProject = useMemo(() => {
    return projects.find((project) => project.id === selectedId) || projects[0] || null;
  }, [projects, selectedId]);

  const averageScore = projects.length > 0 ? Math.round(projects.reduce((sum, project) => sum + project.score, 0) / projects.length) : 0;
  const goProjects = projects.filter((project) => project.verdict === "Go").length;

  function loadExample(index: number) {
    setForm(demoInputs[index]);
  }

  function handleGenerate() {
    setIsGenerating(true);
    const nextProject = buildProject(form);
    window.setTimeout(() => {
      setProjects((current) => [nextProject, ...current]);
      setSelectedId(nextProject.id);
      setIsGenerating(false);
    }, 500);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,196,190,0.10),transparent_32%),radial-gradient(circle_at_top_right,rgba(121,103,255,0.10),transparent_30%),linear-gradient(180deg,#f8fcfc_0%,#f5f8fb_100%)] px-4 py-8 text-slate-900 md:px-6 md:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.07)] backdrop-blur md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">Buildly validate workspace</div>
              <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-slate-950 md:text-6xl">Score the idea, sharpen the message, then decide what to build.</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-500 md:text-lg">
                Cette V1 regroupe les 5 briques clés de Buildly dans une seule route exploitable : dashboard projet, historique, scorecard, variants de landing et traffic kit.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600">
                <a href="/" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 font-semibold">← Home</a>
                <a href="/dashboard" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 font-semibold">Dashboard existant</a>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 md:min-w-[360px]">
              <StatCard label="Projects" value={String(projects.length)} />
              <StatCard label="Avg score" value={averageScore ? String(averageScore) : "—"} />
              <StatCard label="Go verdicts" value={String(goProjects)} />
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Generate a project</div>
                <p className="mt-2 text-sm leading-6 text-slate-500">Prends une idée, calcule une vraie scorecard, produit un verdict et sauvegarde le projet dans l’historique local.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {demoInputs.map((_, index) => (
                  <button key={index} onClick={() => loadExample(index)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">Example {index + 1}</button>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <Field label="Startup idea" value={form.idea} onChange={(value) => setForm({ ...form, idea: value })} placeholder="AI tool for a narrow painful workflow" />
              <Field label="ICP" value={form.icp} onChange={(value) => setForm({ ...form, icp: value })} placeholder="Who feels the pain first?" />
              <Field label="Value proposition" value={form.value} onChange={(value) => setForm({ ...form, value: value })} placeholder="What result do they get?" textarea />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={handleGenerate} disabled={isGenerating || !form.idea.trim() || !form.icp.trim() || !form.value.trim()} className="rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60">
                {isGenerating ? "Generating..." : "Generate validation workspace"}
              </button>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">Local-first history enabled</div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">What this route ships</div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <FeatureCard title="1. Dashboard project" text="Résumé, verdict, next action and score in one place." />
              <FeatureCard title="2. History + resume" text="Save every idea locally and reopen it instantly." />
              <FeatureCard title="3. Validation scorecard" text="Urgency, willingness to pay, channel access, differentiation." />
              <FeatureCard title="4. Landing variants" text="Three messaging angles ready to test." />
              <FeatureCard title="5. Traffic kit" text="LinkedIn, DM, email and community copy ready to use." />
              <FeatureCard title="Immediate value" text="Turns Buildly from promise page into decision workspace." />
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">Project history</div>
                <p className="mt-2 text-sm text-slate-500">Search and reopen old ideas.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{filteredProjects.length} visible</span>
            </div>

            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search idea, ICP, or promise" className="mt-5 w-full rounded-2xl border border-slate-200 bg-[#fbfbfc] px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-200 focus:bg-white" />

            <div className="mt-5 max-h-[720px] space-y-3 overflow-auto pr-1">
              {filteredProjects.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">No project yet.</div>
              ) : filteredProjects.map((project) => (
                <button key={project.id} onClick={() => setSelectedId(project.id)} className={`w-full rounded-2xl border p-4 text-left transition ${selectedProject?.id === project.id ? "border-cyan-300 bg-cyan-50/60" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
                  <div className="flex items-start justify-between gap-4">
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

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            {!selectedProject ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-sm text-slate-500">Generate your first project to unlock the workspace.</div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Selected project</div>
                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{selectedProject.input.idea}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{selectedProject.input.value}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full border px-3 py-2 text-sm font-semibold ${toneForVerdict(selectedProject.verdict)}`}>{selectedProject.verdict}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">Readiness · {selectedProject.readiness}</span>
                  </div>
                </div>

                <div className="rounded-[26px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(45,197,186,0.16),transparent_35%),linear-gradient(135deg,#0f172a,#111827_55%,#0b2230)] p-6 text-white">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Validation summary</div>
                      <div className="mt-3 text-4xl font-bold tracking-tight">{selectedProject.score}/100</div>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200">{selectedProject.decisionReason}</p>
                    </div>
                    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-slate-100 backdrop-blur">Channel · {selectedProject.channel}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-slate-900">Validation scorecard</div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
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

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 p-5">
                    <div className="text-sm font-semibold text-slate-900">Wedge</div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{selectedProject.wedge}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-5">
                    <div className="text-sm font-semibold text-slate-900">Blueprint</div>
                    <div className="mt-3 space-y-3">
                      {selectedProject.blueprint.map((item) => (
                        <div key={item.title} className="rounded-2xl bg-slate-50 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-semibold text-slate-900">{item.title}</div>
                              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                            </div>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${toneForEffort(item.effort)}`}>{item.effort}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 p-5">
                    <div className="text-sm font-semibold text-slate-900">Landing variants</div>
                    <div className="mt-4 space-y-3">
                      {selectedProject.landingVariants.map((variant, index) => (
                        <div key={variant} className="rounded-2xl bg-slate-50 p-4">
                          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-600">Variant {index + 1}</div>
                          <p className="mt-2 text-sm leading-6 text-slate-700">{variant}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-5">
                    <div className="text-sm font-semibold text-slate-900">Traffic kit</div>
                    <div className="mt-4 space-y-3">
                      <TrafficCard title="LinkedIn" text={selectedProject.trafficKit.linkedin} />
                      <TrafficCard title="DM" text={selectedProject.trafficKit.dm} />
                      <TrafficCard title="Email" text={selectedProject.trafficKit.email} />
                      <TrafficCard title="Community" text={selectedProject.trafficKit.community} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-3xl font-bold tracking-tight text-slate-950">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  );
}

function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="font-semibold text-slate-900">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, textarea }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; textarea?: boolean }) {
  return (
    <label className="block text-left">
      <span className="mb-2 block text-sm font-semibold text-slate-900">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-[#fbfbfc] px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-200 focus:bg-white" />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-slate-200 bg-[#fbfbfc] px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-200 focus:bg-white" />
      )}
    </label>
  );
}

function TrafficCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-600">{title}</div>
      <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{text}</pre>
    </div>
  );
}
