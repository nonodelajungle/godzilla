"use client";

import { useMemo, useState } from "react";

type StudioInput = {
  idea: string;
  icp: string;
  outcome: string;
};

type ScopeItem = {
  title: string;
  description: string;
  priority: "P1" | "P2" | "P3";
};

type StackItem = {
  area: string;
  recommendation: string;
  why: string;
};

type StudioPlan = {
  thesis: string;
  wedge: string;
  architecture: string[];
  userFlow: string[];
  scopeNow: ScopeItem[];
  scopeLater: string[];
  avoid: string[];
  stack: StackItem[];
  roadmap: Array<{ phase: string; outcome: string }>;
  launchPlan: string[];
};

const examples: StudioInput[] = [
  {
    idea: "AI assistant for freelance designers",
    icp: "Freelance designers",
    outcome: "Help freelance designers find clients faster and automate proposal follow-up.",
  },
  {
    idea: "Lead qualification copilot for boutique agencies",
    icp: "Boutique agencies with inconsistent inbound lead quality",
    outcome: "Help agency owners score inbound leads instantly and follow up faster with the right offer.",
  },
  {
    idea: "Onboarding copilot for early-stage SaaS",
    icp: "Seed to Series A SaaS teams with weak activation rates",
    outcome: "Help SaaS teams shorten time-to-value and improve activation without redesigning the whole product.",
  },
];

function buildPlan(input: StudioInput): StudioPlan {
  const idea = input.idea.trim();
  const icp = input.icp.trim();
  const outcome = input.outcome.trim();

  return {
    thesis: `If ${icp.toLowerCase()} can ${outcome.toLowerCase()} through one shorter workflow, they will prefer a focused product over a generic stack.`,
    wedge: `Start with one narrow workflow only: ${idea.toLowerCase()} for ${icp.toLowerCase()}.`,
    architecture: [
      "Input and onboarding layer",
      "Core workflow engine",
      "Result / output layer",
      "Light persistence and analytics",
      "Launch and feedback loop",
    ],
    userFlow: [
      "User understands the promise immediately",
      "User enters the core workflow with minimal setup",
      "User gets a first result quickly",
      "User sees a clear reason to return or pay",
    ],
    scopeNow: [
      {
        title: "Core workflow",
        description: "The smallest product path that proves the main value proposition.",
        priority: "P1",
      },
      {
        title: "Onboarding and framing",
        description: "A clean entry point that aligns user expectations and reduces confusion.",
        priority: "P1",
      },
      {
        title: "Result state",
        description: "A clear success state that shows value and points to the next action.",
        priority: "P1",
      },
      {
        title: "Light analytics",
        description: "Enough instrumentation to understand activation and drop-off.",
        priority: "P2",
      },
      {
        title: "Admin polish",
        description: "Only minimal controls needed to operate the MVP.",
        priority: "P3",
      },
    ],
    scopeLater: [
      "Advanced collaboration",
      "Deep customization",
      "Broad reporting surfaces",
      "Secondary workflows outside the core wedge",
    ],
    avoid: [
      "Overbuilding before the wedge is proven",
      "Horizontal feature breadth",
      "Complex settings and admin panels",
      "Fancy infrastructure without product proof",
    ],
    stack: [
      {
        area: "Frontend",
        recommendation: "Next.js + React + Tailwind",
        why: "Fast iteration speed, flexible routing, premium UI quality.",
      },
      {
        area: "Backend",
        recommendation: "Next.js server routes or Supabase / Firebase style backend",
        why: "Enough power for MVP speed without heavy platform overhead.",
      },
      {
        area: "Database",
        recommendation: "Postgres or Supabase",
        why: "Structured enough for product data and launch analytics.",
      },
      {
        area: "Auth",
        recommendation: "Clerk or Supabase Auth later, not first",
        why: "Do not let auth complexity slow the first release.",
      },
      {
        area: "Analytics",
        recommendation: "PostHog or lightweight event tracking",
        why: "Need activation and proof signals quickly.",
      },
    ],
    roadmap: [
      { phase: "Week 1", outcome: "Frame the thesis, scope the wedge, and ship the entry UX." },
      { phase: "Week 2", outcome: "Build the core workflow and first success state." },
      { phase: "Week 3", outcome: "Instrument activation, collect feedback, tighten the wedge." },
      { phase: "Week 4", outcome: "Launch publicly with one strong use case and one channel." },
    ],
    launchPlan: [
      "One homepage promise",
      "One primary workflow",
      "One activation moment",
      "One launch channel",
      "One feedback loop after first users",
    ],
  };
}

export default function CtoStudioPage() {
  const [form, setForm] = useState<StudioInput>(examples[0]);
  const plan = useMemo(() => buildPlan(form), [form]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,196,190,0.12),transparent_26%),radial-gradient(circle_at_top_right,rgba(121,103,255,0.12),transparent_28%),linear-gradient(180deg,#f8fbfd_0%,#f4f7fb_100%)] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="rounded-[32px] border border-slate-200 bg-white/88 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 text-lg font-bold text-white">B</div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Buildly CTO Studio</div>
                <div className="text-xl font-bold tracking-tight text-slate-950">AI CTO workflow for planning the right MVP</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <a href="/ai-cto" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 font-semibold text-slate-700">AI CTO home</a>
              <a href="/founder-os-visual" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 font-semibold text-slate-700">Visual workspace</a>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[360px_1fr]">
          <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Project brief</div>
            <p className="mt-2 text-sm leading-6 text-slate-500">The AI CTO should turn this brief into a scoped MVP plan.</p>
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
              <div className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">AI CTO output</div>
              <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-slate-950 md:text-5xl">{form.idea}</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-500 md:text-lg">{plan.thesis}</p>
              <div className="mt-6 rounded-3xl border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(45,197,186,0.16),transparent_35%),linear-gradient(135deg,#0f172a,#111827_55%,#0b2230)] p-5 text-white">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Wedge</div>
                <p className="mt-3 text-sm leading-7 text-slate-200">{plan.wedge}</p>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <Card title="Architecture">
                <ul className="space-y-2 text-sm leading-6 text-slate-600">
                  {plan.architecture.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </Card>
              <Card title="User flow">
                <ul className="space-y-2 text-sm leading-6 text-slate-600">
                  {plan.userFlow.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <Card title="Scope now">
                <div className="space-y-3">
                  {plan.scopeNow.map((item) => (
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
              </Card>
              <div className="space-y-6">
                <Card title="Scope later">
                  <ul className="space-y-2 text-sm leading-6 text-slate-600">
                    {plan.scopeLater.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </Card>
                <Card title="Avoid">
                  <ul className="space-y-2 text-sm leading-6 text-slate-600">
                    {plan.avoid.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </Card>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <Card title="Recommended stack">
                <div className="space-y-3">
                  {plan.stack.map((item) => (
                    <div key={item.area} className="rounded-2xl border border-slate-200 p-4">
                      <div className="font-semibold text-slate-900">{item.area}</div>
                      <div className="mt-2 text-sm font-medium text-cyan-700">{item.recommendation}</div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.why}</p>
                    </div>
                  ))}
                </div>
              </Card>
              <Card title="Roadmap and launch plan">
                <div className="space-y-3">
                  {plan.roadmap.map((item) => (
                    <div key={item.phase} className="rounded-2xl border border-slate-200 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-600">{item.phase}</div>
                      <p className="mt-2 text-sm leading-6 text-slate-700">{item.outcome}</p>
                    </div>
                  ))}
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm font-semibold text-slate-900">Launch checklist</div>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                      {plan.launchPlan.map((item) => <li key={item}>• {item}</li>)}
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange: (value: string) => void; textarea?: boolean }) {
  return (
    <label className="block text-left">
      <span className="mb-2 block text-sm font-semibold text-slate-900">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-[#fbfbfc] px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-200 focus:bg-white" />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-[#fbfbfc] px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-200 focus:bg-white" />
      )}
    </label>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function priorityTone(priority: "P1" | "P2" | "P3") {
  if (priority === "P1") return "bg-emerald-100 text-emerald-700";
  if (priority === "P2") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}
