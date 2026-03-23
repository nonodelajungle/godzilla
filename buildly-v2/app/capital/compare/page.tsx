"use client";

import { analyzeMarket, decideFromSignal, getProjectSignal, listProjectLeads, listProjects } from "../../../lib/local-demo";
import { buildValidationScorecard } from "../../../lib/validation-grade";

export default function CapitalComparePage() {
  const projects = listProjects();
  const rows = projects.map((project) => {
    const signal = getProjectSignal(project.id);
    const leads = listProjectLeads(project.id);
    const market = analyzeMarket(project);
    const decision = decideFromSignal(project, signal);
    const scorecard = buildValidationScorecard(project, signal, leads, market);
    return { project, signal, leads, market, decision, scorecard };
  }).sort((a, b) => b.scorecard.overallScore - a.scorecard.overallScore);

  return (
    <main className="min-h-screen bg-[#f8fbfc] px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="inline-flex rounded-full bg-violet-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Portfolio compare</div>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-slate-950">Compare validated projects side by side</h1>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-600">This view makes Buildly feel less like a startup toy and more like a standardized investment reading layer.</p>
        </header>

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  <th className="px-4 py-4">Project</th>
                  <th className="px-4 py-4">Score</th>
                  <th className="px-4 py-4">Verdict</th>
                  <th className="px-4 py-4">Build readiness</th>
                  <th className="px-4 py-4">Views</th>
                  <th className="px-4 py-4">Leads</th>
                  <th className="px-4 py-4">Conversion</th>
                  <th className="px-4 py-4">Segment</th>
                  <th className="px-4 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length === 0 ? (
                  <tr><td className="px-4 py-8 text-slate-500" colSpan={9}>No projects yet.</td></tr>
                ) : rows.map(({ project, signal, market, decision, scorecard }) => (
                  <tr key={project.id}>
                    <td className="px-4 py-4 align-top"><div className="font-semibold text-slate-900">{project.input.idea}</div><div className="mt-1 text-xs text-slate-500">{project.input.icp}</div></td>
                    <td className="px-4 py-4 align-top font-semibold text-slate-900">{scorecard.overallScore}/100</td>
                    <td className="px-4 py-4 align-top">{scorecard.verdict}</td>
                    <td className="px-4 py-4 align-top">{scorecard.buildReadiness}</td>
                    <td className="px-4 py-4 align-top">{signal.totalViews}</td>
                    <td className="px-4 py-4 align-top">{signal.totalLeads}</td>
                    <td className="px-4 py-4 align-top">{signal.conversion}%</td>
                    <td className="px-4 py-4 align-top">{market.segment}</td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        <a href={`/investor/${project.id}`} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">Investor</a>
                        <a href={`/evidence/${project.id}`} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">Evidence</a>
                        <a href={`/mvp/${project.id}`} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">MVP</a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
