"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { analyzeMarket, buildInvestorMemo, buildMvpBrief, decideFromSignal, getProject, getProjectSignal, listProjectLeads, type LocalProject } from "../../../lib/local-demo";
import { buildValidationScorecard } from "../../../lib/validation-grade";

export default function MemoPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = typeof params?.projectId === "string" ? params.projectId : "";
  const [project, setProject] = useState<LocalProject | null>(null);

  useEffect(() => {
    if (projectId) setProject(getProject(projectId));
  }, [projectId]);

  const signal = useMemo(() => (project ? getProjectSignal(project.id) : null), [project]);
  const leads = useMemo(() => (project ? listProjectLeads(project.id) : []), [project]);
  const market = useMemo(() => (project ? analyzeMarket(project) : null), [project]);
  const decision = useMemo(() => (project && signal ? decideFromSignal(project, signal) : null), [project, signal]);
  const brief = useMemo(() => (project && signal ? buildMvpBrief(project, signal) : null), [project, signal]);
  const investorMemo = useMemo(() => (project && signal ? buildInvestorMemo(project, signal) : null), [project, signal]);
  const scorecard = useMemo(() => (project && signal && market ? buildValidationScorecard(project, signal, leads, market) : null), [project, signal, leads, market]);

  if (!project || !signal || !market || !decision || !brief || !investorMemo || !scorecard) {
    return <main className="min-h-screen bg-[#f8fbfc] px-4 py-20"><div className="mx-auto max-w-3xl rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm"><h1 className="text-3xl font-bold tracking-tight text-slate-950">Memo unavailable</h1><p className="mt-4 text-slate-500">Open a saved Buildly project in this browser, then relaunch the memo page.</p></div></main>;
  }

  const memoText = [
    `# ${project.input.idea} — Buildly Investor Memo`,
    `ICP: ${project.input.icp}`,
    `Value proposition: ${project.input.value}`,
    ``,
    `Validation score: ${scorecard.overallScore}/100`,
    `Verdict: ${scorecard.verdict}`,
    `Build readiness: ${scorecard.buildReadiness}`,
    ``,
    `Signal: ${signal.totalViews} views, ${signal.totalLeads} leads, ${signal.conversion}% conversion`,
    `Decision: ${decision.label}`,
    `Rationale: ${decision.rationale}`,
    ``,
    `Investor summary: ${investorMemo.summary}`,
    ``,
    `Build now:`,
    ...brief.features.map((item) => `- ${item}`),
    ``,
    `Risks:`,
    ...scorecard.risks.map((item) => `- ${item}`),
    ``,
    `Next milestones:`,
    ...scorecard.nextMilestones.map((item) => `- ${item}`),
  ].join("\n");

  return (
    <main className="min-h-screen bg-[#f8fbfc] px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="inline-flex rounded-full bg-violet-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Exportable memo</div>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-slate-950">{project.input.idea}</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">A clean investor-readable memo generated from Buildly validation signal and MVP recommendation.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => copyText(memoText)} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Copy memo</button>
            <button onClick={() => downloadText(`${slugify(project.input.idea)}-investor-memo.md`, memoText)} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">Download markdown</button>
          </div>
        </header>

        <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
          <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{memoText}</pre>
        </section>
      </div>
    </main>
  );
}

function copyText(text: string) { if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) navigator.clipboard.writeText(text); }
function downloadText(filename: string, content: string) { const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = filename; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); }
function slugify(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "buildly"; }
