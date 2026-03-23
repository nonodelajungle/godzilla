"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { analyzeMarket, buildInvestorMemo, buildMvpBrief, decideFromSignal, getProject, getProjectSignal, listProjectLeads, type LocalProject } from "../../../lib/local-demo";
import { buildEvidenceBlocks, buildInterviewIntelligence, buildValidationScorecard } from "../../../lib/validation-grade";

export default function InvestorModePage() {
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
  const evidence = useMemo(() => (project && signal && market ? buildEvidenceBlocks(project, signal, leads, market) : []), [project, signal, leads, market]);
  const interviewIntel = useMemo(() => (project ? buildInterviewIntelligence(project, leads) : null), [project, leads]);

  if (!project || !signal || !market || !decision || !brief || !investorMemo || !scorecard || !interviewIntel) {
    return <main className="min-h-screen bg-[#f8fbfc] px-4 py-20"><div className="mx-auto max-w-3xl rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm"><h1 className="text-3xl font-bold tracking-tight text-slate-950">Investor mode unavailable</h1><p className="mt-4 text-slate-500">Open a saved Buildly project from this browser, then launch investor mode again.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><a href="/" className="rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white">Open studio</a><a href="/dashboard" className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700">Open dashboard</a></div></div></main>;
  }

  return (
    <main className="min-h-screen bg-[#f7fbfb] px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-4xl">
              <div className="inline-flex rounded-full bg-violet-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Investor mode</div>
              <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-slate-950">{project.input.idea}</h1>
              <p className="mt-4 text-lg leading-8 text-slate-600">VC-grade reading of the project: validation score, evidence quality, founder learning loop, and MVP readiness.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <MetricCard label="Validation score" value={`${scorecard.overallScore}/100`} />
              <MetricCard label="Verdict" value={scorecard.verdict} />
              <MetricCard label="Investment" value={scorecard.investmentReadiness} />
              <MetricCard label="Build readiness" value={scorecard.buildReadiness} />
            </div>
          </div>
        </header>

        <section className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8">
            <Panel title="One-page memo">
              <div className="text-xl font-semibold tracking-tight text-slate-950">{investorMemo.title}</div>
              <p className="mt-4 text-sm leading-7 text-slate-600">{investorMemo.summary}</p>
              <ul className="mt-5 space-y-2 text-sm leading-6 text-slate-700">{investorMemo.bullets.map((item) => <li key={item}>• {item}</li>)}</ul>
            </Panel>

            <Panel title="Validation scorecard">
              <div className="space-y-4">
                {scorecard.dimensions.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 p-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-900">{item.label}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === "strong" ? "bg-emerald-100 text-emerald-700" : item.status === "average" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>{item.score}/100</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500" style={{ width: `${item.score}%` }} /></div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{item.rationale}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Evidence room">
              <div className="grid gap-4 md:grid-cols-2">
                {evidence.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === "strong" ? "bg-emerald-100 text-emerald-700" : item.status === "partial" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>{item.status}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{item.summary}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="space-y-8">
            <Panel title="Current signal">
              <div className="grid grid-cols-2 gap-4">
                <MetricCard label="Views" value={String(signal.totalViews)} />
                <MetricCard label="Leads" value={String(signal.totalLeads)} />
                <MetricCard label="CTR" value={`${signal.ctr}%`} />
                <MetricCard label="Conversion" value={`${signal.conversion}%`} />
              </div>
              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">{decision.rationale}</div>
            </Panel>

            <Panel title="Interview intelligence">
              <p className="text-sm leading-7 text-slate-600">{interviewIntel.summary}</p>
              <div className="mt-5 space-y-4">
                {interviewIntel.themes.map((theme) => (
                  <div key={theme.theme} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3"><div className="text-sm font-semibold text-slate-900">{theme.theme}</div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{theme.count}</span></div>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">{theme.evidence.map((item) => <li key={item}>• {item}</li>)}</ul>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Key objections and buying signals">
              <div className="grid gap-4 md:grid-cols-2">
                <SmallList title="Objections" items={interviewIntel.objections.length ? interviewIntel.objections : ["No objections captured yet."]} />
                <SmallList title="Buying signals" items={interviewIntel.buyingSignals.length ? interviewIntel.buyingSignals : ["No buying signals captured yet."]} />
              </div>
            </Panel>

            <Panel title="Build recommendation">
              <div className="text-lg font-semibold tracking-tight text-slate-950">{brief.title}</div>
              <p className="mt-3 text-sm leading-7 text-slate-600">{brief.summary}</p>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <SmallList title="Build now" items={brief.features} />
                <SmallList title="Backlog" items={brief.backlog} />
                <SmallList title="Avoid in v1" items={brief.doNotBuild} />
              </div>
            </Panel>
          </div>
        </section>
      </div>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm"><div className="mb-4 text-sm font-semibold text-slate-900">{title}</div>{children}</section>;
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><div className="text-2xl font-bold tracking-tight text-slate-950">{value}</div><div className="mt-2 text-sm text-slate-500">{label}</div></div>;
}

function SmallList({ title, items }: { title: string; items: string[] }) {
  return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</div><ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">{items.map((item) => <li key={item}>• {item}</li>)}</ul></div>;
}
