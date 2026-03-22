"use client";

import { useMemo, useState } from "react";

type TabKey = "overview" | "architecture" | "delivery" | "launch";
type Priority = "P1" | "P2" | "P3";
type Verdict = "Go" | "Iterate" | "Drop";

type StudioInput = { idea: string; icp: string; outcome: string };
type ScoreItem = { label: string; score: number; insight: string };
type FeatureItem = { title: string; description: string; priority: Priority };
type LayerItem = { name: string; role: string };
type ApiItem = { method: string; path: string; purpose: string };
type SprintItem = { sprint: string; focus: string; output: string };
type StackItem = { area: string; recommendation: string; why: string };

type StudioPlan = {
  score: number;
  verdict: Verdict;
  thesis: string;
  wedge: string;
  northStar: string;
  activationMoment: string;
  scorecard: ScoreItem[];
  scopeNow: FeatureItem[];
  scopeLater: string[];
  avoid: string[];
  layers: LayerItem[];
  apis: ApiItem[];
  stack: StackItem[];
  sprints: SprintItem[];
  launchChecklist: string[];
};

const examples: StudioInput[] = [
  { idea: "AI assistant for freelance designers", icp: "Freelance designers", outcome: "Help freelance designers find clients faster and automate proposal follow-up." },
  { idea: "Lead qualification copilot for boutique agencies", icp: "Boutique agencies with inconsistent inbound lead quality", outcome: "Help agency owners score inbound leads instantly and follow up faster with the right offer." },
  { idea: "Onboarding copilot for early-stage SaaS", icp: "Seed to Series A SaaS teams with weak activation rates", outcome: "Help SaaS teams shorten time-to-value and improve activation without redesigning the whole product." },
];

function clamp(value: number, min = 0, max = 100) { return Math.max(min, Math.min(max, value)); }
function hashText(value: string) { let total = 0; for (let i = 0; i < value.length; i += 1) total += value.charCodeAt(i) * (i + 1); return total; }
function verdictTone(verdict: Verdict) { if (verdict === "Go") return "bg-emerald-50 text-emerald-700 border-emerald-200"; if (verdict === "Iterate") return "bg-amber-50 text-amber-700 border-amber-200"; return "bg-rose-50 text-rose-700 border-rose-200"; }
function priorityTone(priority: Priority) { if (priority === "P1") return "bg-emerald-100 text-emerald-700"; if (priority === "P2") return "bg-amber-100 text-amber-700"; return "bg-slate-100 text-slate-700"; }

function buildPlan(input: StudioInput): StudioPlan {
  const idea = input.idea.trim() || "New startup idea";
  const icp = input.icp.trim() || "Early users";
  const outcome = input.outcome.trim() || "Help users solve one painful workflow faster.";
  const text = `${idea} ${icp} ${outcome}`.toLowerCase();
  const seed = hashText(text);
  const urgency = clamp(45 + (seed % 36) + (/save|revenue|sales|manual|cost|faster|time|pipeline|clients|activation/.test(text) ? 10 : 0));
  const willingnessToPay = clamp(44 + (Math.floor(seed / 7) % 35) + (/b2b|agency|saas|sales|ops|finance|crm|onboarding/.test(text) ? 11 : 0));
  const channelAccess = clamp(41 + (Math.floor(seed / 11) % 32) + (/freelance|agency|designer|founder|creator|saas|boutique/.test(text) ? 10 : 0));
  const technicalSimplicity = clamp(48 + (Math.floor(seed / 13) % 28) + (/assistant|copilot|automation|qualify|proposal|onboarding/.test(text) ? 8 : 0));
  const scorecard: ScoreItem[] = [
    { label: "Urgency", score: urgency, insight: urgency >= 70 ? "The pain looks strong enough to justify fast validation." : "The pain exists, but the trigger moment needs sharpening." },
    { label: "Willingness to pay", score: willingnessToPay, insight: willingnessToPay >= 70 ? "The promise maps to a monetizable business pain." : "ROI needs to be more explicit for buyers." },
    { label: "Channel access", score: channelAccess, insight: channelAccess >= 70 ? "There is a believable route to reach early buyers." : "The first acquisition wedge is not obvious enough yet." },
    { label: "Technical simplicity", score: technicalSimplicity, insight: technicalSimplicity >= 70 ? "The MVP can likely be shipped without heavy infrastructure." : "Keep the first version narrower to preserve velocity." },
  ];
  const score = Math.round(scorecard.reduce((sum, item) => sum + item.score, 0) / scorecard.length);
  const verdict: Verdict = score >= 74 ? "Go" : score >= 58 ? "Iterate" : "Drop";
  const baseIcp = icp.toLowerCase();
  const baseOutcome = outcome.toLowerCase();
  const baseIdea = idea.toLowerCase();
  return {
    score,
    verdict,
    thesis: `If ${baseIcp} can ${baseOutcome} through one shorter and more opinionated workflow, they will prefer a focused product over a generic stack.`,
    wedge: `Start with one narrow workflow only: ${baseIdea} for ${baseIcp}.`,
    northStar: `Weekly activated users who complete the core workflow and reach the promised result for ${baseIcp}.`,
    activationMoment: "The user experiences a visible before/after improvement in the painful workflow inside the first session.",
    scorecard,
    scopeNow: [
      { title: "Core workflow", description: `The smallest workflow that proves ${baseOutcome} in practice.`, priority: "P1" },
      { title: "Onboarding and framing", description: "A sharp entry point that aligns expectations and guides users to the first success state.", priority: "P1" },
      { title: "Result and next action", description: "A strong success state that makes the outcome obvious and creates a reason to continue.", priority: "P1" },
      { title: "Light analytics", description: "Enough instrumentation to understand activation, conversion and proof quality.", priority: "P2" },
      { title: "Operator controls", description: "Minimal controls to operate the MVP without a heavy admin product.", priority: "P3" },
    ],
    scopeLater: ["Advanced collaboration", "Deep customization", "Secondary workflows outside the core wedge", "Broad reporting surfaces"],
    avoid: ["Overbuilding before the wedge is proven", "Horizontal feature breadth", "Complex settings and admin panels", "Heavy infrastructure without product proof"],
    layers: [
      { name: "Presentation", role: "Landing, onboarding, workspace and success states." },
      { name: "Orchestration", role: "Business logic that sequences the core workflow." },
      { name: "AI engine", role: "Structured generation, scoring and product guidance." },
      { name: "Persistence", role: "Projects, runs, evidence and outputs." },
      { name: "Analytics", role: "Activation events and launch signals." },
    ],
    apis: [
      { method: "POST", path: "/api/projects", purpose: "Create and store a product brief." },
      { method: "POST", path: "/api/plan", purpose: "Generate thesis, architecture, scope and roadmap." },
      { method: "PATCH", path: "/api/evidence/:id", purpose: "Update validation signals and evidence." },
      { method: "GET", path: "/api/projects/:id/board", purpose: "Return the unified AI CTO board." },
    ],
    stack: [
      { area: "Frontend", recommendation: "Next.js + React + Tailwind", why: "Fast iteration speed and premium UI quality." },
      { area: "Backend", recommendation: "Next.js server routes", why: "Enough backend power for MVP speed without extra overhead." },
      { area: "Database", recommendation: "Postgres or Supabase", why: "Structured enough for product data and evidence." },
      { area: "Analytics", recommendation: "PostHog or lightweight tracking", why: "Activation and proof signals matter early." },
      { area: "Auth", recommendation: "Add later, not first", why: "Do not let auth complexity slow the first release." },
    ],
    sprints: [
      { sprint: "Sprint 1", focus: "Frame and ship the product entry", output: "Thesis, onboarding, first workspace shell and one clear promise." },
      { sprint: "Sprint 2", focus: "Build the core workflow", output: "Core action, result state and first activation path." },
      { sprint: "Sprint 3", focus: "Instrument proof", output: "Evidence tracking, analytics and a structured feedback loop." },
      { sprint: "Sprint 4", focus: "Launch and tighten", output: "Public release, one channel and scope refinement." },
    ],
    launchChecklist: ["One homepage promise", "One primary workflow", "One activation moment", "One launch channel", "One feedback loop after first users"],
  };
}

export default function UnifiedStudioPage() {
  const [form, setForm] = useState<StudioInput>(examples[0]);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const plan = useMemo(() => buildPlan(form), [form]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,196,190,0.12),transparent_26%),radial-gradient(circle_at_top_right,rgba(121,103,255,0.12),transparent_28%),linear-gradient(180deg,#f8fbfd_0%,#f4f7fb_100%)] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="rounded-[32px] border border-slate-200 bg-white/88 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 text-lg font-bold text-white">B</div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Buildly AI CTO Studio</div>
                <div className="text-xl font-bold tracking-tight text-slate-950">One product for validation, architecture, delivery and launch</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <a href="/ai-cto" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 font-semibold text-slate-700">AI CTO home</a>
              <a href="/cto-studio" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 font-semibold text-slate-700">CTO Studio</a>
              <a href="/founder-os-visual" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 font-semibold text-slate-700">Visual workspace</a>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[360px_1fr]">
          <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Merged product brief</div>
            <p className="mt-2 text-sm leading-6 text-slate-500">One brief becomes one unified Buildly AI CTO board.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {examples.map((_, index) => (
                <button key={index} onClick={() => setForm(examples[index])} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">Example {index + 1}</button>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              <Field label="Idea" value={form.idea} onChange={(value) => setForm({ ...form, idea: value })} />
              <Field label="ICP" value={form.icp} onChange={(value) => setForm({ ...form, icp: value })} />
              <Field label="Outcome" value={form.outcome} onChange={(value) => setForm({ ...form, outcome: value })} textarea />
            </div>
          </aside>

          <section className="space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${verdictTone(plan.verdict)}`}>{plan.verdict}</div>
                  <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-slate-950 md:text-5xl">{form.idea}</h1>
                  <p className="mt-4 max-w-3xl text-base leading-7 text-slate-500 md:text-lg">{plan.thesis}</p>
                </div>
                <div className="grid gap-3 md:min-w-[280px] md:grid-cols-2">
                  <Metric label="Score" value={`${plan.score}/100`} />
                  <Metric label="North star" value="Activated users" small />
                  <Metric label="Mode" value="Buildly AI CTO" small />
                  <Metric label="Activation" value="Visible result" small />
                </div>
              </div>
              <div className="mt-6 rounded-3xl border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(45,197,186,0.16),transparent_35%),linear-gradient(135deg,#0f172a,#111827_55%,#0b2230)] p-5 text-white">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Wedge</div>
                <p className="mt-3 text-sm leading-7 text-slate-200">{plan.wedge}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm">
              <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} label="Overview" />
              <TabButton active={activeTab === "architecture"} onClick={() => setActiveTab("architecture")} label="Architecture" />
              <TabButton active={activeTab === "delivery"} onClick={() => setActiveTab("delivery")} label="Delivery" />
              <TabButton active={activeTab === "launch"} onClick={() => setActiveTab("launch")} label="Launch" />
            </div>

            {activeTab === "overview" ? <div className="grid gap-6 xl:grid-cols-[1fr_1fr]"><Card title="Validation scorecard"><div className="space-y-4">{plan.scorecard.map((item)=><div key={item.label}><div className="mb-2 flex items-center justify-between text-sm"><span className="font-semibold text-slate-800">{item.label}</span><span className="text-slate-500">{item.score}/100</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500" style={{width:`${item.score}%`}} /></div><p className="mt-2 text-sm leading-6 text-slate-500">{item.insight}</p></div>)}</div></Card><Card title="MVP scope"><div className="space-y-3">{plan.scopeNow.map((item)=><div key={item.title} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div><div className="font-semibold text-slate-900">{item.title}</div><p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityTone(item.priority)}`}>{item.priority}</span></div></div>)}<div className="grid gap-4 md:grid-cols-2"><SimpleList title="Scope later" items={plan.scopeLater} /><SimpleList title="Avoid" items={plan.avoid} /></div></div></Card></div> : null}

            {activeTab === "architecture" ? <div className="grid gap-6 xl:grid-cols-[1fr_1fr]"><Card title="System layers"><div className="grid gap-4 md:grid-cols-5">{plan.layers.map((layer,index)=><div key={layer.name} className="relative rounded-2xl border border-slate-200 p-4"><div className="text-sm font-semibold text-slate-900">{layer.name}</div><p className="mt-2 text-sm leading-6 text-slate-600">{layer.role}</p>{index < plan.layers.length-1 ? <div className="absolute -right-2 top-1/2 hidden h-0.5 w-4 bg-slate-300 md:block" />:null}</div>)}</div></Card><Card title="API surface"><div className="space-y-3">{plan.apis.map((api)=><div key={`${api.method}-${api.path}`} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-center gap-2"><span className="rounded-full bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white">{api.method}</span><span className="font-mono text-sm text-slate-900">{api.path}</span></div><p className="mt-2 text-sm leading-6 text-slate-600">{api.purpose}</p></div>)}</div></Card></div> : null}

            {activeTab === "delivery" ? <div className="grid gap-6 xl:grid-cols-[1fr_1fr]"><Card title="Recommended stack"><div className="space-y-3">{plan.stack.map((item)=><div key={item.area} className="rounded-2xl border border-slate-200 p-4"><div className="font-semibold text-slate-900">{item.area}</div><div className="mt-2 text-sm font-medium text-cyan-700">{item.recommendation}</div><p className="mt-2 text-sm leading-6 text-slate-600">{item.why}</p></div>)}</div></Card><Card title="Sprint plan"><div className="space-y-3">{plan.sprints.map((item)=><div key={item.sprint} className="rounded-2xl border border-slate-200 p-4"><div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-600">{item.sprint}</div><div className="mt-2 font-semibold text-slate-900">{item.focus}</div><p className="mt-2 text-sm leading-6 text-slate-600">{item.output}</p></div>)}</div></Card></div> : null}

            {activeTab === "launch" ? <div className="grid gap-6 xl:grid-cols-[1fr_1fr]"><SimpleList title="Launch checklist" items={plan.launchChecklist} /><Card title="Activation moment"><div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">{plan.activationMoment}<div className="mt-4 text-sm font-semibold text-slate-900">{plan.northStar}</div></div></Card></div> : null}
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange: (value: string) => void; textarea?: boolean }) {
  return <label className="block text-left"><span className="mb-2 block text-sm font-semibold text-slate-900">{label}</span>{textarea ? <textarea value={value} onChange={(event)=>onChange(event.target.value)} className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-[#fbfbfc] px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-200 focus:bg-white" /> : <input value={value} onChange={(event)=>onChange(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-[#fbfbfc] px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-200 focus:bg-white" />}</label>;
}
function Card({ title, children }: { title: string; children: React.ReactNode }) { return <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"><div className="text-sm font-semibold text-slate-900">{title}</div><div className="mt-4">{children}</div></div>; }
function SimpleList({ title, items }: { title: string; items: string[] }) { return <div className="rounded-2xl border border-slate-200 p-4"><div className="text-sm font-semibold text-slate-900">{title}</div><ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">{items.map((item)=><li key={item}>• {item}</li>)}</ul></div>; }
function Metric({ label, value, small }: { label: string; value: string; small?: boolean }) { return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-600">{label}</div><div className={`mt-2 font-semibold text-slate-950 ${small ? "text-sm leading-6" : "text-2xl"}`}>{value}</div></div>; }
function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) { return <button onClick={onClick} className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${active ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-700 hover:bg-slate-100"}`}>{label}</button>; }
