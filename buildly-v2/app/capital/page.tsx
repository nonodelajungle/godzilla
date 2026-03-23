"use client";

import { analyzeMarket, buildInvestorMemo, decideFromSignal, getProjectSignal, listProjectLeads, listProjects } from "../../lib/local-demo";
import { buildValidationScorecard } from "../../lib/validation-grade";

export default function CapitalPage() {
  const projects = listProjects();
  const rows = projects.map((project) => {
    const signal = getProjectSignal(project.id);
    const leads = listProjectLeads(project.id);
    const market = analyzeMarket(project);
    const decision = decideFromSignal(project, signal);
    const memo = buildInvestorMemo(project, signal);
    const scorecard = buildValidationScorecard(project, signal, leads, market);
    return { project, signal, leads, market, decision, memo, scorecard };
  });

  return (
    <main className="min-h-screen bg-[#f8fbfc] px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="inline-flex rounded-full bg-violet-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">VC hub</div>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-slate-950">Buildly validation standard</h1>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-600">A portfolio view of validated startup projects, with standardized scorecards, current decisions, and investor-readable memos.</p>
        </header>

        {rows.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 shadow-sm">No projects yet. Generate your first project from the main studio.</div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            {rows.map(({ project, signal, leads, decision, memo, scorecard }) => (
              <article key={project.id} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-600">{project.input.icp}</div>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{project.input.idea}</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{project.input.value}</p>
                  </div>
                  <div className="grid gap-2 text-right">
                    <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">Score · {scorecard.overallScore}/100</span>
                    <span className="rounded-full bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700">{scorecard.verdict}</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <Metric label="Views" value={String(signal.totalViews)} />
                  <Metric label="Leads" value={String(signal.totalLeads)} />
                  <Metric label="Conversion" value={`${signal.conversion}%`} />
                  <Metric label="Decision" value={decision.label} />
                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                  <div className="text-sm font-semibold text-slate-900">Investor summary</div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{memo.summary}</p>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a href={`/investor/${project.id}`} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">Open investor mode</a>
                  <a href={`/mvp/${project.id}`} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Open MVP brief</a>
                  <a href={`/p/${signal.bestVariant?.slug || ""}`} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Best landing</a>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <SmallList title="Strengths" items={scorecard.strengths.length ? scorecard.strengths : ["No strong dimension yet."]} />
                  <SmallList title="Risks" items={scorecard.risks.length ? scorecard.risks : ["No major risk flagged yet."]} />
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 p-4">
                  <div className="text-sm font-semibold text-slate-900">Next milestones</div>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">{scorecard.nextMilestones.map((item) => <li key={item}>• {item}</li>)}</ul>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-2xl font-semibold tracking-tight text-slate-950">{value}</div><div className="mt-1 text-sm text-slate-500">{label}</div></div>; }
function SmallList({ title, items }: { title: string; items: string[] }) { return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</div><ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">{items.map((item) => <li key={item}>• {item}</li>)}</ul></div>; }
