"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  analyzeMarket,
  buildInvestorMemo,
  buildMvpBrief,
  buildPivotPlan,
  decideFromSignal,
  getProject,
  getProjectSignal,
  listProjectLeads,
  type LocalProject,
} from "../../../lib/local-demo";
import { buildMarketStudy } from "../../../lib/market-study";
import { MarketStudyPanel } from "../../../components/market-study-panel";

export default function MvpBlueprintPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = typeof params?.projectId === "string" ? params.projectId : "";
  const [project, setProject] = useState<LocalProject | null>(null);

  useEffect(() => {
    if (!projectId) return;
    setProject(getProject(projectId));
  }, [projectId]);

  const signal = useMemo(() => (project ? getProjectSignal(project.id) : null), [project]);
  const decision = useMemo(() => (project && signal ? decideFromSignal(project, signal) : null), [project, signal]);
  const brief = useMemo(() => (project && signal ? buildMvpBrief(project, signal) : null), [project, signal]);
  const market = useMemo(() => (project ? analyzeMarket(project) : null), [project]);
  const study = useMemo(() => (project && market ? buildMarketStudy(project, market) : null), [project, market]);
  const pivotPlan = useMemo(() => (project && signal ? buildPivotPlan(project, signal) : []), [project, signal]);
  const investorMemo = useMemo(() => (project && signal ? buildInvestorMemo(project, signal) : null), [project, signal]);
  const leads = useMemo(() => (project ? listProjectLeads(project.id) : []), [project]);

  if (!project || !signal || !decision || !brief || !market || !study || !investorMemo) {
    return (
      <main className="min-h-screen bg-[#f8fbfc] px-4 py-20">
        <div className="mx-auto max-w-3xl rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">MVP blueprint not found</h1>
          <p className="mt-4 text-slate-500">This dedicated blueprint exists only for projects saved in the same browser in local autonomous mode.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="/" className="rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white">Open studio</a>
            <a href="/dashboard" className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700">Open dashboard</a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(45,197,186,0.10),transparent_30%),linear-gradient(180deg,#f8fcfc,#ffffff)] px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div>
            <div className="text-sm font-semibold text-cyan-600">Buildly MVP Blueprint</div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{brief.title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">{project.input.idea} · {project.input.icp} · {project.input.value}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Studio</a>
            <a href="/dashboard" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Dashboard</a>
          </div>
        </div>

        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(45,197,186,0.18),transparent_35%),linear-gradient(135deg,#0f172a,#111827_55%,#0b2230)] p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] md:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                Build from signal
              </div>
              <h2 className="mt-5 text-4xl font-bold tracking-[-0.04em] md:text-5xl">{decision.label}</h2>
              <p className="mt-4 text-lg leading-8 text-slate-200">{brief.summary}</p>
            </div>
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Readiness</div>
              <div className="mt-2 text-2xl font-bold">{decision.confidence}</div>
              <div className="mt-3 text-sm text-slate-200">{signal.totalLeads} leads · {signal.conversion}% conversion</div>
            </div>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <ListCard title="Build now" items={brief.features} theme="dark" />
            <ListCard title="Next backlog" items={brief.backlog} theme="dark" />
            <ListCard title="Do not build yet" items={brief.doNotBuild} theme="dark" />
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-8">
            <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Product scope</div>
              <p className="mt-3 text-sm leading-7 text-slate-600">{brief.summary}</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <MetricCard label="Views" value={String(signal.totalViews)} />
                <MetricCard label="Leads" value={String(signal.totalLeads)} />
                <MetricCard label="CTR" value={`${signal.ctr}%`} />
                <MetricCard label="Conversion" value={`${signal.conversion}%`} />
              </div>
            </section>

            <MarketStudyPanel study={study} />

            <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Decision rationale</div>
              <p className="mt-3 text-sm leading-7 text-slate-600">{decision.rationale}</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Card title="Best entry wedge" body={market.entryWedge} />
                <Card title="Best first channel" body={market.recommendedChannel} />
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Next founder moves</div>
              <div className="mt-4 space-y-4">
                {pivotPlan.map((item) => (
                  <div key={item.title} className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.reason}</p>
                    <p className="mt-2 text-sm leading-6 text-cyan-700">Next test: {item.nextTest}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Investor memo</div>
              <div className="mt-3 text-lg font-semibold tracking-tight text-slate-950">{investorMemo.title}</div>
              <p className="mt-3 text-sm leading-7 text-slate-600">{investorMemo.summary}</p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
                {investorMemo.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
              </ul>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Recent leads</div>
              <div className="mt-4 space-y-3">
                {leads.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">No leads collected yet. Publish a landing and capture the first responses.</div>
                ) : (
                  leads.slice(0, 6).map((lead) => (
                    <div key={lead.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="text-sm font-semibold text-slate-900">{lead.name || lead.email}</div>
                      <div className="mt-1 text-sm text-slate-500">{lead.email}</div>
                      {lead.note ? <p className="mt-2 text-sm leading-6 text-slate-600">{lead.note}</p> : null}
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="text-3xl font-bold tracking-tight text-slate-950">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{label}</div>
    </div>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</div>
      <p className="mt-3 text-sm leading-7 text-slate-700">{body}</p>
    </div>
  );
}

function ListCard({ title, items, theme = "light" }: { title: string; items: string[]; theme?: "light" | "dark" }) {
  const classes = theme === "dark"
    ? "rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur"
    : "rounded-[24px] border border-slate-200 bg-white p-5";
  const heading = theme === "dark"
    ? "text-cyan-200"
    : "text-slate-400";
  const body = theme === "dark"
    ? "text-slate-100"
    : "text-slate-700";

  return (
    <div className={classes}>
      <div className={`text-xs font-semibold uppercase tracking-[0.16em] ${heading}`}>{title}</div>
      <ul className={`mt-4 space-y-2 text-sm leading-6 ${body}`}>
        {items.map((item) => <li key={item}>• {item}</li>)}
      </ul>
    </div>
  );
}
