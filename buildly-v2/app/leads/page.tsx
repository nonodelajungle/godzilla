"use client";

import { listProjectLeads, listProjects } from "../../lib/local-demo";
import { buildInterviewIntelligence } from "../../lib/validation-grade";

export default function LeadsInboxPage() {
  const projects = listProjects();
  const rows = projects.flatMap((project) =>
    listProjectLeads(project.id).map((lead) => ({
      lead,
      project,
      intelligence: buildInterviewIntelligence(project, listProjectLeads(project.id)),
    })),
  ).sort((a, b) => +new Date(b.lead.createdAt) - +new Date(a.lead.createdAt));

  const totalLeads = rows.length;
  const notedLeads = rows.filter((item) => Boolean(item.lead.note)).length;

  return (
    <main className="min-h-screen bg-[#f8fbfc] px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="inline-flex rounded-full bg-cyan-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Lead inbox</div>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-slate-950">Founder CRM for early validation</h1>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-600">Every lead across your Buildly projects in one place, with context, notes, and suggested next interview angles.</p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <SummaryCard label="Total leads" value={String(totalLeads)} sub="All captured across projects" />
          <SummaryCard label="Leads with notes" value={String(notedLeads)} sub="Qualitative signal available" />
          <SummaryCard label="Projects with leads" value={String(new Set(rows.map((item) => item.project.id)).size)} sub="Validation tracks in progress" />
        </section>

        {rows.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 shadow-sm">No leads yet. Publish a landing from the studio and capture the first responses.</div>
        ) : (
          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              {rows.map(({ lead, project }) => (
                <article key={lead.id} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-slate-900">{lead.name || lead.email}</div>
                      <div className="mt-1 text-sm text-slate-500">{lead.email}</div>
                      <div className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{project.input.idea}</div>
                    </div>
                    <div className="text-xs text-slate-400">{new Date(lead.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <InfoPill label="ICP" value={project.input.icp} />
                    <InfoPill label="Current promise" value={project.input.value} />
                  </div>
                  <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">{lead.note || "No note saved yet for this lead. Add qualitative context after the first call."}</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a href={`/investor/${project.id}`} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">Investor mode</a>
                    <a href={`/evidence/${project.id}`} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">Evidence room</a>
                    <a href={`/interviews/${project.id}`} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">Interview copilot</a>
                  </div>
                </article>
              ))}
            </div>

            <div className="space-y-6">
              {projects.slice(0, 4).map((project) => {
                const intelligence = buildInterviewIntelligence(project, listProjectLeads(project.id));
                return (
                  <section key={project.id} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="text-sm font-semibold text-slate-900">{project.input.idea}</div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{intelligence.summary}</p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <SmallList title="Objections" items={intelligence.objections.length ? intelligence.objections : ["No objections captured yet."]} />
                      <SmallList title="Buying signals" items={intelligence.buyingSignals.length ? intelligence.buyingSignals : ["No buying signals captured yet."]} />
                    </div>
                  </section>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function SummaryCard({ label, value, sub }: { label: string; value: string; sub: string }) { return <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"><div className="text-3xl font-bold tracking-tight text-slate-950">{value}</div><div className="mt-2 text-sm font-semibold text-slate-900">{label}</div><div className="mt-1 text-sm text-slate-500">{sub}</div></div>; }
function InfoPill({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-slate-200 bg-white p-3"><div className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</div><div className="mt-2 text-sm font-semibold text-slate-900">{value}</div></div>; }
function SmallList({ title, items }: { title: string; items: string[] }) { return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</div><ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">{items.map((item) => <li key={item}>• {item}</li>)}</ul></div>; }
