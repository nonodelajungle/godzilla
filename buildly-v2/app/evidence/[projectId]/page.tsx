"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { analyzeMarket, decideFromSignal, getProject, getProjectSignal, listProjectLeads, type LocalProject } from "../../../lib/local-demo";
import { buildEvidenceBlocks, buildInterviewIntelligence } from "../../../lib/validation-grade";

export default function EvidenceRoomPage() {
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
  const evidence = useMemo(() => (project && signal && market ? buildEvidenceBlocks(project, signal, leads, market) : []), [project, signal, leads, market]);
  const intelligence = useMemo(() => (project ? buildInterviewIntelligence(project, leads) : null), [project, leads]);

  if (!project || !signal || !market || !decision || !intelligence) {
    return (
      <main className="min-h-screen bg-[#f8fbfc] px-4 py-20">
        <div className="mx-auto max-w-3xl rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Evidence room unavailable</h1>
          <p className="mt-4 text-slate-500">Open a saved Buildly project in this browser, then relaunch the evidence room.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="/" className="rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white">Open studio</a>
            <a href="/capital" className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700">Open VC hub</a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fbfc] px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">Evidence room</div>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-slate-950">{project.input.idea}</h1>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-600">A clean record of proof: what was tested, what signal exists, what buyers said, and why the current build decision exists.</p>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-8">
            <Panel title="Proof blocks">
              <div className="space-y-4">
                {evidence.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-base font-semibold text-slate-900">{item.title}</div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === "strong" ? "bg-emerald-100 text-emerald-700" : item.status === "partial" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>{item.status}</span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{item.summary}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Decision trail">
              <div className="grid gap-4 md:grid-cols-2">
                <MetricCard label="Views" value={String(signal.totalViews)} />
                <MetricCard label="Leads" value={String(signal.totalLeads)} />
                <MetricCard label="Conversion" value={`${signal.conversion}%`} />
                <MetricCard label="Decision" value={decision.label} />
              </div>
              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">{decision.rationale}</div>
            </Panel>
          </div>

          <div className="space-y-8">
            <Panel title="Interview intelligence">
              <p className="text-sm leading-7 text-slate-600">{intelligence.summary}</p>
              <div className="mt-5 space-y-4">
                {intelligence.themes.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">No qualitative themes yet.</div>
                ) : (
                  intelligence.themes.map((theme) => (
                    <div key={theme.theme} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-slate-900">{theme.theme}</div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{theme.count}</span>
                      </div>
                      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">{theme.evidence.map((item) => <li key={item}>• {item}</li>)}</ul>
                    </div>
                  ))
                )}
              </div>
            </Panel>

            <Panel title="Signals from conversations">
              <div className="grid gap-4 md:grid-cols-2">
                <SmallList title="Objections" items={intelligence.objections.length ? intelligence.objections : ["No objections captured yet."]} />
                <SmallList title="Buying signals" items={intelligence.buyingSignals.length ? intelligence.buyingSignals : ["No buying signals captured yet."]} />
              </div>
            </Panel>

            <Panel title="Next interviews">
              <SmallList title="Recommended questions" items={intelligence.nextQuestions} />
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
