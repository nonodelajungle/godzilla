"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { analyzeMarket, buildInvestorMemo, buildMvpBrief, decideFromSignal, getProject, getProjectSignal, listProjectLeads, type LocalProject } from "../../../lib/local-demo";
import { buildMarketStudy } from "../../../lib/market-study";
import { buildMvpPack } from "../../../lib/mvp-pack";
import { MarketStudyPanel } from "../../../components/market-study-panel";
import { MvpPreview } from "../../../components/mvp-preview";

export default function MvpBlueprintPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = typeof params?.projectId === "string" ? params.projectId : "";
  const [project, setProject] = useState<LocalProject | null>(null);

  useEffect(() => {
    if (projectId) setProject(getProject(projectId));
  }, [projectId]);

  const signal = useMemo(() => (project ? getProjectSignal(project.id) : null), [project]);
  const decision = useMemo(() => (project && signal ? decideFromSignal(project, signal) : null), [project, signal]);
  const brief = useMemo(() => (project && signal ? buildMvpBrief(project, signal) : null), [project, signal]);
  const market = useMemo(() => (project ? analyzeMarket(project) : null), [project]);
  const study = useMemo(() => (project && market ? buildMarketStudy(project, market) : null), [project, market]);
  const investorMemo = useMemo(() => (project && signal ? buildInvestorMemo(project, signal) : null), [project, signal]);
  const leads = useMemo(() => (project ? listProjectLeads(project.id) : []), [project]);
  const pack = useMemo(() => (project && signal && decision && brief ? buildMvpPack({ project, signal, decision, brief }) : null), [project, signal, decision, brief]);

  if (!project || !signal || !decision || !brief || !market || !study || !investorMemo || !pack) {
    return <main className="min-h-screen bg-[#f8fbfc] px-4 py-20"><div className="mx-auto max-w-3xl rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm"><h1 className="text-3xl font-bold tracking-tight text-slate-950">MVP generator not found</h1><p className="mt-4 text-slate-500">Open a saved Buildly project from this browser, then launch the MVP page again.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><a href="/" className="rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white">Open studio</a><a href="/dashboard" className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700">Open dashboard</a></div></div></main>;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(45,197,186,0.10),transparent_30%),linear-gradient(180deg,#f8fcfc,#ffffff)] px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div>
            <div className="text-sm font-semibold text-cyan-600">Buildly MVP Generator</div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{brief.title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">{project.input.idea} · {project.input.icp} · {project.input.value}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => downloadText(`${slugify(project.input.idea)}-mvp.md`, pack.prdMarkdown)} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">Download spec</button>
            <a href="/" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Studio</a>
            <a href="/dashboard" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Dashboard</a>
          </div>
        </header>

        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(45,197,186,0.18),transparent_35%),linear-gradient(135deg,#0f172a,#111827_55%,#0b2230)] p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] md:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Generate from signal</div>
              <h2 className="mt-5 text-4xl font-bold tracking-[-0.04em] md:text-5xl">{pack.productOneLiner}</h2>
              <p className="mt-4 text-lg leading-8 text-slate-200">{brief.summary}</p>
            </div>
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Readiness</div>
              <div className="mt-2 text-2xl font-bold">{decision.confidence}</div>
              <div className="mt-3 text-sm text-slate-200">{signal.totalLeads} leads · {signal.conversion}% conversion</div>
              <div className="mt-3 text-xs uppercase tracking-[0.16em] text-cyan-200">Archetype · {pack.archetype.replace(/_/g, " ")}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.16em] text-cyan-200">Theme · {pack.themeKey}</div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => copyText(pack.buildPrompt)} className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950">Copy builder prompt</button>
            <button onClick={() => copyText(pack.prdMarkdown)} className="rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white">Copy PRD markdown</button>
          </div>
        </section>

        <MvpPreview pack={pack} />

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <CardSection title="Builder prompt"><pre className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{pack.buildPrompt}</pre></CardSection>
            <CardSection title="Execution pack"><div className="grid gap-6 lg:grid-cols-2"><ListCard title="User stories" items={pack.userStories} /><ListCard title="Screens" items={pack.screens} /><ListCard title="Navigation" items={pack.appNavigation} /><ListCard title="Data model" items={pack.dataModel} /><ListCard title="Recommended stack" items={pack.stack} /><ListCard title="Integrations" items={pack.integrations} /></div></CardSection>
            <CardSection title="14-day roadmap"><div className="space-y-3">{pack.roadmap14Days.map((item) => <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{item}</div>)}</div></CardSection>
            <MarketStudyPanel study={study} />
          </div>
          <div className="space-y-8">
            <CardSection title="Adaptive product definition"><div className="space-y-4"><InfoCard title="Brand" body={pack.branding.name} /><InfoCard title="Target user" body={pack.targetUser} /><InfoCard title="Core outcome" body={pack.coreOutcome} /><InfoCard title="Archetype" body={pack.archetype.replace(/_/g, " ")} /><InfoCard title="Theme" body={pack.themeKey} /></div></CardSection>
            <CardSection title="Adaptive feature cards"><div className="space-y-3">{pack.branding.features.map((feature) => <div key={feature.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-sm font-semibold text-slate-900">{feature.title}</div><p className="mt-2 text-sm leading-6 text-slate-600">{feature.body}</p></div>)}</div></CardSection>
            <CardSection title="Build now"><ListCard title="Must-have features" items={brief.features} /></CardSection>
            <CardSection title="Do not build yet"><ListCard title="Keep out of v1" items={brief.doNotBuild} /></CardSection>
            <CardSection title="Investor memo"><div className="text-lg font-semibold tracking-tight text-slate-950">{investorMemo.title}</div><p className="mt-3 text-sm leading-7 text-slate-600">{investorMemo.summary}</p><ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">{investorMemo.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul></CardSection>
            <CardSection title="Recent leads"><div className="space-y-3">{leads.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">No leads collected yet.</div> : leads.slice(0, 6).map((lead) => <div key={lead.id} className="rounded-2xl border border-slate-200 p-4"><div className="text-sm font-semibold text-slate-900">{lead.name || lead.email}</div><div className="mt-1 text-sm text-slate-500">{lead.email}</div>{lead.note ? <p className="mt-2 text-sm leading-6 text-slate-600">{lead.note}</p> : null}</div>)}</div></CardSection>
          </div>
        </div>
      </div>
    </main>
  );
}

function copyText(text: string) { if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) navigator.clipboard.writeText(text); }
function downloadText(filename: string, content: string) { const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = filename; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); }
function slugify(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "buildly"; }
function CardSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm"><div className="mb-4 text-sm font-semibold text-slate-900">{title}</div>{children}</section>; }
function InfoCard({ title, body }: { title: string; body: string }) { return <div className="rounded-2xl bg-slate-50 p-5"><div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</div><p className="mt-3 text-sm leading-7 text-slate-700">{body}</p></div>; }
function ListCard({ title, items }: { title: string; items: string[] }) { return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</div><ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">{items.map((item) => <li key={item}>• {item}</li>)}</ul></div>; }
