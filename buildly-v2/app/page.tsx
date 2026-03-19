"use client";

import { useState } from "react";
import { demoIdeas, type ValidationInput, validateIdea } from "../lib/buildly";

const initial = demoIdeas[0];

export default function Page() {
  const [form, setForm] = useState<ValidationInput>(initial);
  const result = validateIdea(form);

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-[28px] border border-white/60 bg-white/80 p-6 shadow-soft">
          <div className="mb-3 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Buildly V2</div>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">Validate startup ideas before building the MVP.</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">A real app shell for Buildly: idea input, validation signal, landing-page angle, and a clear recommendation toward MVP generation.</p>
          <a href="/dashboard" className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-6 font-semibold text-white">Open dashboard</a>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-2xl font-semibold tracking-tight">Idea input</h2>
            <div className="mt-6 grid gap-4">
              <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" value={form.idea} onChange={(e) => setForm({ ...form, idea: e.target.value })} placeholder="Startup idea" />
              <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" value={form.icp} onChange={(e) => setForm({ ...form, icp: e.target.value })} placeholder="ICP / target audience" />
              <textarea className="min-h-32 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="Value proposition" />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {demoIdeas.map((example) => (
                <button key={example.idea} type="button" onClick={() => setForm(example)} className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700">
                  {example.idea}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-tight">Validation result</h2>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold">MVP readiness · {result.readiness}</span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <Card label="Score" value={String(result.score)} />
              <Card label="Best channel" value={result.channel} />
              <Card label="Visitors" value={String(result.visitors)} />
              <Card label="Conversion" value={result.conversion} />
            </div>

            <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Generated hero</p>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight">{result.headline}</h3>
              <p className="mt-3 text-base leading-7 text-slate-600">{result.subheadline}</p>
            </div>

            <div className="mt-6 rounded-[24px] border border-slate-200 bg-gradient-to-br from-sky-50 to-violet-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Recommendation</p>
              <p className="mt-3 text-base leading-7 text-slate-700">{result.insight}</p>
              <p className="mt-3 font-medium text-slate-900">{result.nextStep}</p>
              <p className="mt-3 text-base leading-7 text-slate-700">{result.mvpRecommendation}</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[22px] border border-slate-200 p-4"><div className="text-3xl font-semibold tracking-tight">{value}</div><div className="mt-2 text-sm text-slate-500">{label}</div></div>;
}
