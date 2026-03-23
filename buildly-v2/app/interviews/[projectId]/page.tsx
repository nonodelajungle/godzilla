"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getProject, listProjectLeads, type LocalProject } from "../../../lib/local-demo";
import { buildInterviewIntelligence } from "../../../lib/validation-grade";

export default function InterviewCopilotPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = typeof params?.projectId === "string" ? params.projectId : "";
  const [project, setProject] = useState<LocalProject | null>(null);

  useEffect(() => {
    if (projectId) setProject(getProject(projectId));
  }, [projectId]);

  const leads = useMemo(() => (project ? listProjectLeads(project.id) : []), [project]);
  const intelligence = useMemo(() => (project ? buildInterviewIntelligence(project, leads) : null), [project, leads]);

  if (!project || !intelligence) {
    return <main className="min-h-screen bg-[#f8fbfc] px-4 py-20"><div className="mx-auto max-w-3xl rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm"><h1 className="text-3xl font-bold tracking-tight text-slate-950">Interview copilot unavailable</h1><p className="mt-4 text-slate-500">Open a saved project in this browser, then relaunch the interview copilot.</p></div></main>;
  }

  return (
    <main className="min-h-screen bg-[#f8fbfc] px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Interview copilot</div>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-slate-950">{project.input.idea}</h1>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-600">Turn scattered founder notes into patterns: pains, objections, buying signals, and better next interview questions.</p>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8">
            <Panel title="Dominant themes">
              <p className="text-sm leading-7 text-slate-600">{intelligence.summary}</p>
              <div className="mt-5 space-y-4">
                {intelligence.themes.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">No themes yet. Add richer lead notes after calls.</div> : intelligence.themes.map((theme) => (
                  <div key={theme.theme} className="rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between gap-3"><div className="text-base font-semibold text-slate-900">{theme.theme}</div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{theme.count}</span></div>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">{theme.evidence.map((item) => <li key={item}>• {item}</li>)}</ul>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Conversation notes">
              <div className="space-y-3">
                {leads.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">No lead notes saved yet.</div> : leads.map((lead) => (
                  <div key={lead.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="text-sm font-semibold text-slate-900">{lead.name || lead.email}</div>
                    <div className="mt-1 text-sm text-slate-500">{lead.email}</div>
                    <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">{lead.note || "No note saved for this lead."}</div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="space-y-8">
            <Panel title="Objections and buying signals">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                <SmallList title="Objections" items={intelligence.objections.length ? intelligence.objections : ["No objections captured yet."]} />
                <SmallList title="Buying signals" items={intelligence.buyingSignals.length ? intelligence.buyingSignals : ["No buying signals captured yet."]} />
              </div>
            </Panel>

            <Panel title="Next best questions">
              <SmallList title="Interview guide" items={intelligence.nextQuestions} />
            </Panel>

            <Panel title="How to use this with founders and funds">
              <div className="space-y-3 text-sm leading-7 text-slate-600">
                <p>Use this page after every 3 to 5 calls to rewrite the problem statement in the customer’s own words.</p>
                <p>Push repeated objections into pricing tests, ICP narrowing, or promise changes.</p>
                <p>When buying signals become frequent and concrete, connect this page to the investor memo and MVP brief.</p>
              </div>
            </Panel>
          </div>
        </section>
      </div>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm"><div className="mb-4 text-sm font-semibold text-slate-900">{title}</div>{children}</section>; }
function SmallList({ title, items }: { title: string; items: string[] }) { return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</div><ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">{items.map((item) => <li key={item}>• {item}</li>)}</ul></div>; }
