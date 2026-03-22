"use client";

import { useMemo, useState } from "react";

type Input = { idea: string; icp: string; outcome: string };

type SectionCardProps = { title: string; children: React.ReactNode };

const examples: Input[] = [
  { idea: "AI assistant for freelance designers", icp: "Freelance designers", outcome: "Help freelance designers find clients faster and automate proposal follow-up." },
  { idea: "Lead qualification copilot for boutique agencies", icp: "Boutique agencies with inconsistent inbound lead quality", outcome: "Help agency owners score inbound leads instantly and follow up faster with the right offer." },
  { idea: "Onboarding copilot for early-stage SaaS", icp: "Seed to Series A SaaS teams with weak activation rates", outcome: "Help SaaS teams shorten time-to-value and improve activation without redesigning the whole product." },
];

function buildSpec(input: Input) {
  const idea = input.idea.trim() || "New startup idea";
  const icp = input.icp.trim() || "Early users";
  const outcome = input.outcome.trim() || "Help users solve one painful workflow faster.";

  return {
    productName: idea,
    summary: `${idea} is a focused MVP for ${icp.toLowerCase()} designed to ${outcome.toLowerCase()}.`,
    problem: `${icp} currently rely on fragmented workflows and lose time, clarity or revenue because the process is still too manual or too generic.`,
    users: [icp, `Operators adjacent to ${icp.toLowerCase()}`, "Founders or managers reviewing outcomes"],
    goals: [
      "Ship one clear workflow that proves the wedge",
      "Reach a visible activation moment in the first session",
      "Instrument enough evidence to decide what to build next",
    ],
    nonGoals: [
      "Broad horizontal functionality",
      "Complex collaboration before the wedge is proven",
      "Heavy admin or settings surfaces",
    ],
    requirements: [
      "A fast onboarding entry point",
      "A core action that produces a meaningful result",
      "A result page with a next action",
      "Basic evidence capture and activation events",
    ],
    architecture: [
      "Frontend workspace",
      "Workflow orchestration layer",
      "AI or rules engine",
      "Persistence and analytics",
    ],
    roadmap: [
      "Week 1: frame product thesis and entry UX",
      "Week 2: build core workflow",
      "Week 3: instrument activation and evidence",
      "Week 4: launch and tighten scope",
    ],
    risks: [
      "The wedge may still be too broad",
      "ROI may not feel explicit enough",
      "The first activation moment may not be strong enough",
    ],
  };
}

export default function SpecPackPage() {
  const [input, setInput] = useState<Input>(examples[0]);
  const spec = useMemo(() => buildSpec(input), [input]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,196,190,0.12),transparent_26%),radial-gradient(circle_at_top_right,rgba(121,103,255,0.12),transparent_28%),linear-gradient(180deg,#f8fbfd_0%,#f4f7fb_100%)] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="rounded-[32px] border border-slate-200 bg-white/88 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 text-lg font-bold text-white">B</div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Buildly AI CTO Spec Pack</div>
                <div className="text-xl font-bold tracking-tight text-slate-950">A product, roadmap and tech document in one place</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <a href="/studio-visual" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 font-semibold text-slate-700">Studio visual</a>
              <a href="/studio" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 font-semibold text-slate-700">Studio</a>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[360px_1fr]">
          <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Spec input</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {examples.map((_, index) => (
                <button key={index} onClick={() => setInput(examples[index])} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">Example {index + 1}</button>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              <Field label="Idea" value={input.idea} onChange={(value) => setInput({ ...input, idea: value })} />
              <Field label="ICP" value={input.icp} onChange={(value) => setInput({ ...input, icp: value })} />
              <Field label="Outcome" value={input.outcome} onChange={(value) => setInput({ ...input, outcome: value })} textarea />
            </div>
          </aside>

          <section className="space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <div className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">Spec Pack</div>
              <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-slate-950 md:text-5xl">{spec.productName}</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-500 md:text-lg">{spec.summary}</p>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <SectionCard title="Problem statement">
                <p className="text-sm leading-7 text-slate-600">{spec.problem}</p>
              </SectionCard>
              <SectionCard title="Target users">
                <ul className="space-y-2 text-sm leading-6 text-slate-600">
                  {spec.users.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </SectionCard>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <SectionCard title="Goals">
                <ul className="space-y-2 text-sm leading-6 text-slate-600">
                  {spec.goals.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </SectionCard>
              <SectionCard title="Non-goals">
                <ul className="space-y-2 text-sm leading-6 text-slate-600">
                  {spec.nonGoals.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </SectionCard>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <SectionCard title="Functional requirements">
                <ul className="space-y-2 text-sm leading-6 text-slate-600">
                  {spec.requirements.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </SectionCard>
              <SectionCard title="Architecture blocks">
                <ul className="space-y-2 text-sm leading-6 text-slate-600">
                  {spec.architecture.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </SectionCard>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <SectionCard title="Delivery roadmap">
                <ul className="space-y-2 text-sm leading-6 text-slate-600">
                  {spec.roadmap.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </SectionCard>
              <SectionCard title="Key risks">
                <ul className="space-y-2 text-sm leading-6 text-slate-600">
                  {spec.risks.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </SectionCard>
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

function SectionCard({ title, children }: SectionCardProps) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
