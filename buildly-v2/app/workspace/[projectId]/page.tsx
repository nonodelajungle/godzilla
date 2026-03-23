"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { PremiumShell } from "../../../components/premium-shell";
import {
  analyzeMarket,
  buildInvestorMemo,
  buildMvpBrief,
  decideFromSignal,
  getProject,
  getProjectSignal,
  listProjectLeads,
  type LocalProject,
} from "../../../lib/local-demo";
import { buildEvidenceBlocks, buildInterviewIntelligence, buildValidationScorecard } from "../../../lib/validation-grade";

export default function WorkspacePage() {
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
  const memo = useMemo(() => (project && signal ? buildInvestorMemo(project, signal) : null), [project, signal]);
  const scorecard = useMemo(() => (project && signal && market ? buildValidationScorecard(project, signal, leads, market) : null), [project, signal, leads, market]);
  const evidence = useMemo(() => (project && signal && market ? buildEvidenceBlocks(project, signal, leads, market) : []), [project, signal, leads, market]);
  const intel = useMemo(() => (project ? buildInterviewIntelligence(project, leads) : null), [project, leads]);

  if (!project || !signal || !decision || !brief || !memo || !scorecard || !intel) {
    return (
      <PremiumShell section="workspace" title="Project workspace unavailable" subtitle="Open a saved Buildly project in this browser, then relaunch the premium workspace." accent="violet">
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 shadow-sm">
          No local project found for this workspace.
        </div>
      </PremiumShell>
    );
  }

  return (
    <PremiumShell
      section="workspace"
      title={project.input.idea}
      subtitle="A unified product-grade workspace to read the startup from founder angle and investor angle in one place."
      accent="violet"
    >
      <div className="grid gap-6 md:grid-cols-4">
        <Stat label="Validation score" value={`${scorecard.overallScore}/100`} />
        <Stat label="Decision" value={decision.label} />
        <Stat label="Build readiness" value={scorecard.buildReadiness} />
        <Stat label="Signal" value={`${signal.totalLeads} leads`} />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="space-y-8">
          <Panel title="Founder summary">
            <p className="text-sm leading-7 text-slate-600">{decision.rationale}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <ListCard title="Build now" items={brief.features} />
              <ListCard title="Backlog" items={brief.backlog} />
              <ListCard title="Avoid in v1" items={brief.doNotBuild} />
            </div>
          </Panel>

          <Panel title="Proof and signal">
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

          <Panel title="Interview intelligence">
            <p className="text-sm leading-7 text-slate-600">{intel.summary}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <ListCard title="Objections" items={intel.objections.length ? intel.objections : ["No objections captured yet."]} />
              <ListCard title="Buying signals" items={intel.buyingSignals.length ? intel.buyingSignals : ["No buying signals captured yet."]} />
            </div>
          </Panel>
        </section>

        <aside className="space-y-8">
          <Panel title="Investor summary">
            <div className="text-lg font-semibold tracking-tight text-slate-950">{memo.title}</div>
            <p className="mt-3 text-sm leading-7 text-slate-600">{memo.summary}</p>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
              {memo.bullets.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </Panel>

          <Panel title="Market read">
            <div className="grid gap-3">
              <TagLine label="Segment" value={market.segment} />
              <TagLine label="Urgency" value={market.buyerUrgency} />
              <TagLine label="Attractiveness" value={market.marketAttractiveness} />
              <TagLine label="Entry wedge" value={market.entryWedge} />
            </div>
          </Panel>

          <Panel title="Actions">
            <div className="grid gap-3">
              <ActionLink href={`/mvp/${project.id}`} label="Open MVP brief" />
              <ActionLink href={`/investor/${project.id}`} label="Open investor mode" />
              <ActionLink href={`/evidence/${project.id}`} label="Open evidence room" />
              <ActionLink href={`/interviews/${project.id}`} label="Open interview copilot" />
              <ActionLink href={`/memo/${project.id}`} label="Open exportable memo" />
            </div>
          </Panel>
        </aside>
      </div>
    </PremiumShell>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm"><div className="mb-4 text-sm font-semibold text-slate-900">{title}</div>{children}</section>;
}
function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"><div className="text-2xl font-bold tracking-tight text-slate-950">{value}</div><div className="mt-2 text-sm text-slate-500">{label}</div></div>;
}
function ListCard({ title, items }: { title: string; items: string[] }) {
  return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</div><ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">{items.map((item) => <li key={item}>• {item}</li>)}</ul></div>;
}
function TagLine({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</div><div className="mt-2 text-sm font-semibold text-slate-900">{value}</div></div>;
}
function ActionLink({ href, label }: { href: string; label: string }) {
  return <a href={href} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-800 transition hover:bg-white">{label}</a>;
}
