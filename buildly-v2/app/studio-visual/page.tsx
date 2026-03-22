"use client";

import { useMemo, useState } from "react";

type Priority = "P1" | "P2" | "P3";
type Verdict = "Go" | "Iterate" | "Drop";
type TabKey = "overview" | "proof" | "architecture" | "delivery";

type Input = { idea: string; icp: string; outcome: string };
type ScoreItem = { label: string; score: number; insight: string };
type Signal = { views: number; clicks: number; leads: number; interviews: number; payment: number };
type ScopeItem = { title: string; description: string; priority: Priority };
type LayerItem = { name: string; role: string };
type SprintItem = { sprint: string; focus: string; output: string };

type Plan = {
  score: number;
  verdict: Verdict;
  thesis: string;
  wedge: string;
  northStar: string;
  scorecard: ScoreItem[];
  scopeNow: ScopeItem[];
  layers: LayerItem[];
  sprints: SprintItem[];
  launchChecklist: string[];
};

const examples: Input[] = [
  { idea: "AI assistant for freelance designers", icp: "Freelance designers", outcome: "Help freelance designers find clients faster and automate proposal follow-up." },
  { idea: "Lead qualification copilot for boutique agencies", icp: "Boutique agencies with inconsistent inbound lead quality", outcome: "Help agency owners score inbound leads instantly and follow up faster with the right offer." },
  { idea: "Onboarding copilot for early-stage SaaS", icp: "Seed to Series A SaaS teams with weak activation rates", outcome: "Help SaaS teams shorten time-to-value and improve activation without redesigning the whole product." },
];

function clamp(value: number, min = 0, max = 100) { return Math.max(min, Math.min(max, value)); }
function hashText(value: string) { let total = 0; for (let i = 0; i < value.length; i += 1) total += value.charCodeAt(i) * (i + 1); return total; }
function verdictTone(verdict: Verdict) { if (verdict === "Go") return "bg-emerald-50 text-emerald-700 border-emerald-200"; if (verdict === "Iterate") return "bg-amber-50 text-amber-700 border-amber-200"; return "bg-rose-50 text-rose-700 border-rose-200"; }
function priorityTone(priority: Priority) { if (priority === "P1") return "bg-emerald-100 text-emerald-700"; if (priority === "P2") return "bg-amber-100 text-amber-700"; return "bg-slate-100 text-slate-700"; }

function buildPlan(input: Input): Plan {
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
    { label: "Urgency", score: urgency, insight: urgency >= 70 ? "Strong enough to justify fast validation." : "The trigger moment still needs sharpening." },
    { label: "Willingness to pay", score: willingnessToPay, insight: willingnessToPay >= 70 ? "The promise maps to a monetizable pain." : "ROI needs to be more explicit." },
    { label: "Channel access", score: channelAccess, insight: channelAccess >= 70 ? "There is a believable route to early buyers." : "The first channel is not obvious enough yet." },
    { label: "Technical simplicity", score: technicalSimplicity, insight: technicalSimplicity >= 70 ? "The MVP can likely ship without heavy infrastructure." : "Keep the first version narrower." },
  ];
  const score = Math.round(scorecard.reduce((sum, item) => sum + item.score, 0) / scorecard.length);
  const verdict: Verdict = score >= 74 ? "Go" : score >= 58 ? "Iterate" : "Drop";
  return {
    score,
    verdict,
    thesis: `If ${icp.toLowerCase()} can ${outcome.toLowerCase()} through one shorter and more opinionated workflow, they will prefer a focused product over a generic stack.`,
    wedge: `Start with one narrow workflow only: ${idea.toLowerCase()} for ${icp.toLowerCase()}.`,
    northStar: `Weekly activated users who complete the core workflow and reach the promised result for ${icp.toLowerCase()}.`,
    scorecard,
    scopeNow: [
      { title: "Core workflow", description: `The smallest workflow that proves ${outcome.toLowerCase()} in practice.`, priority: "P1" },
      { title: "Onboarding and framing", description: "A sharp entry point that aligns expectations and guides users to first value.", priority: "P1" },
      { title: "Result and next action", description: "A success state that makes the outcome obvious and creates a reason to continue.", priority: "P1" },
      { title: "Light analytics", description: "Enough instrumentation to understand activation and proof quality.", priority: "P2" },
    ],
    layers: [
      { name: "Presentation", role: "Landing, onboarding, workspace and result states." },
      { name: "Orchestration", role: "Business logic that sequences the core workflow." },
      { name: "AI engine", role: "Structured generation, scoring and product guidance." },
      { name: "Persistence", role: "Projects, runs, evidence and outputs." },
      { name: "Analytics", role: "Activation events and launch signals." },
    ],
    sprints: [
      { sprint: "Sprint 1", focus: "Frame and ship the product entry", output: "Thesis, onboarding and one clear promise." },
      { sprint: "Sprint 2", focus: "Build the core workflow", output: "Core action, result state and activation path." },
      { sprint: "Sprint 3", focus: "Instrument proof", output: "Evidence tracking and structured feedback loop." },
      { sprint: "Sprint 4", focus: "Launch and tighten", output: "Public release, one channel and scope refinement." },
    ],
    launchChecklist: ["One homepage promise", "One primary workflow", "One activation moment", "One launch channel", "One feedback loop after first users"],
  };
}

function deriveProof(signal: Signal) {
  const ctr = signal.views > 0 ? Math.round((signal.clicks / signal.views) * 1000) / 10 : 0;
  const conversion = signal.views > 0 ? Math.round((signal.leads / signal.views) * 1000) / 10 : 0;
  const proof = clamp(signal.leads * 5 + signal.interviews * 8 + signal.payment * 15 + Math.min(ctr, 25) * 1.4 + Math.min(conversion, 20) * 2.3, 0, 100);
  return { ctr, conversion, proof };
}

function buildTrend(signal: Signal) {
  const points = [0.12, 0.24, 0.42, 0.63, 0.82, 1];
  return points.map((factor, index) => {
    const value = clamp(Math.round((signal.leads * 7 + signal.interviews * 9 + signal.payment * 18 + signal.clicks * 1.2) * factor), 0, 100);
    return { label: `S${index + 1}`, value };
  });
}

export default function StudioVisualPage() {
  const [form, setForm] = useState<Input>(examples[0]);
  const [signal, setSignal] = useState<Signal>({ views: 0, clicks: 0, leads: 0, interviews: 0, payment: 0 });
  const [tab, setTab] = useState<TabKey>("overview");
  const plan = useMemo(() => buildPlan(form), [form]);
  const proofState = useMemo(() => deriveProof(signal), [signal]);
  const trend = useMemo(() => buildTrend(signal), [signal]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,196,190,0.12),transparent_26%),radial-gradient(circle_at_top_right,rgba(121,103,255,0.12),transparent_28%),linear-gradient(180deg,#f8fbfd_0%,#f4f7fb_100%)] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="rounded-[32px] border border-slate-200 bg-white/88 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 text-lg font-bold text-white">B</div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Buildly AI CTO Studio Visual</div>
                <div className="text-xl font-bold tracking-tight text-slate-950">Unified studio with proof and diagrams</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <a href="/studio" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 font-semibold text-slate-700">Studio</a>
              <a href="/ai-cto" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 font-semibold text-slate-700">AI CTO home</a>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[360px_1fr]">
          <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Unified brief</div>
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
            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">This route is the next layer of the merged product: same AI CTO logic, but with clearer diagrams and proof visuals.</div>
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
                  <Metric label="Proof" value={`${proofState.proof}/100`} />
                  <Metric label="CTR" value={`${proofState.ctr}%`} small />
                  <Metric label="Conv." value={`${proofState.conversion}%`} small />
                </div>
              </div>
              <div className="mt-6 rounded-3xl border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(45,197,186,0.16),transparent_35%),linear-gradient(135deg,#0f172a,#111827_55%,#0b2230)] p-5 text-white">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Wedge</div>
                <p className="mt-3 text-sm leading-7 text-slate-200">{plan.wedge}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm">
              <TabButton active={tab === "overview"} onClick={() => setTab("overview")} label="Overview" />
              <TabButton active={tab === "proof"} onClick={() => setTab("proof")} label="Proof" />
              <TabButton active={tab === "architecture"} onClick={() => setTab("architecture")} label="Architecture" />
              <TabButton active={tab === "delivery"} onClick={() => setTab("delivery")} label="Delivery" />
            </div>

            {tab === "overview" ? <div className="grid gap-6 xl:grid-cols-[1fr_1fr]"><Card title="Score breakdown"><ScoreBarsChart items={plan.scorecard} /></Card><Card title="MVP scope"><div className="space-y-3">{plan.scopeNow.map((item)=><div key={item.title} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div><div className="font-semibold text-slate-900">{item.title}</div><p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityTone(item.priority)}`}>{item.priority}</span></div></div>)}</div></Card></div> : null}

            {tab === "proof" ? <div className="grid gap-6"><Card title="Signal controls"><div className="flex flex-wrap gap-3"><ActionButton label="+25 views" onClick={() => setSignal((s)=>({ ...s, views: s.views + 25 }))} /><ActionButton label="+5 clicks" onClick={() => setSignal((s)=>({ ...s, clicks: s.clicks + 5 }))} /><ActionButton label="+2 leads" onClick={() => setSignal((s)=>({ ...s, leads: s.leads + 2 }))} /><ActionButton label="+1 interview" onClick={() => setSignal((s)=>({ ...s, interviews: s.interviews + 1 }))} /><ActionButton label="+1 payment" onClick={() => setSignal((s)=>({ ...s, payment: s.payment + 1 }))} /><ActionButton label="Reset" subtle onClick={() => setSignal({ views: 0, clicks: 0, leads: 0, interviews: 0, payment: 0 })} /></div></Card><div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]"><Card title="Funnel diagram"><FunnelDiagram signal={signal} /></Card><Card title="Evidence trend"><TrendLineChart points={trend} /></Card></div></div> : null}

            {tab === "architecture" ? <Card title="Architecture map"><div className="grid gap-4 md:grid-cols-5">{plan.layers.map((layer,index)=><div key={layer.name} className="relative rounded-2xl border border-slate-200 p-4"><div className="text-sm font-semibold text-slate-900">{layer.name}</div><p className="mt-2 text-sm leading-6 text-slate-600">{layer.role}</p>{index < plan.layers.length - 1 ? <div className="absolute -right-2 top-1/2 hidden h-0.5 w-4 bg-slate-300 md:block" /> : null}</div>)}</div></Card> : null}

            {tab === "delivery" ? <div className="grid gap-6 xl:grid-cols-[1fr_1fr]"><Card title="Sprint roadmap"><LaunchRoadmap tasks={plan.sprints.map((item)=>({ week: item.sprint, title: item.focus, outcome: item.output }))} /></Card><Card title="Launch checklist"><ul className="space-y-2 text-sm leading-6 text-slate-600">{plan.launchChecklist.map((item)=><li key={item}>• {item}</li>)}</ul></Card></div> : null}
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
function Metric({ label, value, small }: { label: string; value: string; small?: boolean }) { return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-600">{label}</div><div className={`mt-2 font-semibold text-slate-950 ${small ? "text-sm leading-6" : "text-2xl"}`}>{value}</div></div>; }
function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) { return <button onClick={onClick} className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${active ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-700 hover:bg-slate-100"}`}>{label}</button>; }
function ActionButton({ label, onClick, subtle }: { label: string; onClick: () => void; subtle?: boolean }) { return <button onClick={onClick} className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${subtle ? "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100" : "bg-slate-950 text-white hover:bg-slate-900"}`}>{label}</button>; }
function ScoreBarsChart({ items }: { items: ScoreItem[] }) { return <div className="space-y-4">{items.map((item)=><div key={item.label}><div className="mb-2 flex items-center justify-between text-sm"><span className="font-semibold text-slate-800">{item.label}</span><span className="text-slate-500">{item.score}/100</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500" style={{width:`${item.score}%`}} /></div><p className="mt-2 text-sm leading-6 text-slate-500">{item.insight}</p></div>)}</div>; }
function FunnelDiagram({ signal }: { signal: Signal }) { const steps = [{ label: "Views", value: Math.max(signal.views, 1) }, { label: "Clicks", value: Math.max(signal.clicks, 0) }, { label: "Leads", value: Math.max(signal.leads, 0) }, { label: "Interviews", value: Math.max(signal.interviews, 0) }, { label: "Payment", value: Math.max(signal.payment, 0) }]; const max = Math.max(...steps.map((step)=>step.value),1); return <div className="space-y-3">{steps.map((step,index)=>{ const width = `${clamp((step.value / max) * (100 - index * 8), 12, 100)}%`; return <div key={step.label} className="flex flex-col items-center"><div className="rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-3 text-white" style={{width}}><div className="flex items-center justify-between gap-3 text-sm font-semibold"><span>{step.label}</span><span>{step.value}</span></div></div></div>; })}</div>; }
function TrendLineChart({ points }: { points: Array<{ label: string; value: number }> }) { const width = 560; const height = 220; const padding = 24; const max = Math.max(...points.map((point)=>point.value),100); const stepX = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0; const coords = points.map((point,index)=>({ ...point, x: padding + index * stepX, y: height - padding - (point.value / max) * (height - padding * 2) })); const path = coords.map((point,index)=>`${index===0?"M":"L"} ${point.x} ${point.y}`).join(" "); return <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4"><svg viewBox={`0 0 ${width} ${height}`} className="w-full">{[0,25,50,75,100].map((level)=>{ const y = height - padding - (level / 100) * (height - padding * 2); return <g key={level}><line x1={padding} x2={width-padding} y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1" /><text x={4} y={y+4} fontSize="10" fill="#64748b">{level}</text></g>; })}<path d={path} fill="none" stroke="#14b8a6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />{coords.map((point)=><g key={point.label}><circle cx={point.x} cy={point.y} r="4" fill="#06b6d4" /><text x={point.x} y={height-6} textAnchor="middle" fontSize="10" fill="#64748b">{point.label}</text></g>)}</svg></div>; }
function LaunchRoadmap({ tasks }: { tasks: Array<{ week: string; title: string; outcome: string }> }) { return <div className="grid gap-4 md:grid-cols-4">{tasks.map((task,index)=><div key={task.week} className="relative rounded-2xl border border-slate-200 p-4"><div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-600">{task.week}</div><div className="mt-3 font-semibold text-slate-900">{task.title}</div><p className="mt-2 text-sm leading-6 text-slate-600">{task.outcome}</p>{index < tasks.length - 1 ? <div className="absolute -right-2 top-1/2 hidden h-0.5 w-4 bg-slate-300 md:block" /> : null}</div>)}</div>; }
