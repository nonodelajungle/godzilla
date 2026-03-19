"use client";

import { buildMvpBrief, decideFromSignal, getProjectSignal, listProjectLeads, listProjects } from "../../lib/local-demo";

export default function DashboardPage() {
  const projects = listProjects();

  const enriched = projects.map((project) => {
    const signal = getProjectSignal(project.id);
    const decision = decideFromSignal(project, signal);
    const leads = listProjectLeads(project.id);
    const brief = buildMvpBrief(project, signal);
    return { project, signal, decision, leads, brief };
  });

  const totalProjects = enriched.length;
  const readyForMvp = enriched.filter((item) => item.decision.code === "go").length;
  const totalLeads = enriched.reduce((sum, item) => sum + item.signal.totalLeads, 0);

  return (
    <main className="min-h-screen bg-[#f8fbfc] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <a href="/" className="text-sm font-medium text-slate-500">← Back to Buildly</a>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Founder dashboard</h1>
          <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">
            Local autonomous mode: published variants, leads, signal, decision, and MVP scope without extra setup.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Summary title="Projects" value={String(totalProjects)} />
          <Summary title="Ready for MVP" value={String(readyForMvp)} />
          <Summary title="Leads collected" value={String(totalLeads)} />
        </div>

        {enriched.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 shadow-sm">
            No projects yet. Go back to the studio and generate your first validation flow.
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            {enriched.map(({ project, signal, decision, leads, brief }) => (
              <article key={project.id} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-600">{project.input.icp}</p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{project.input.idea}</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{project.input.value}</p>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                    {decision.label}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <Metric label="Views" value={String(signal.totalViews)} />
                  <Metric label="Leads" value={String(signal.totalLeads)} />
                  <Metric label="CTR" value={`${signal.ctr}%`} />
                  <Metric label="Conv." value={`${signal.conversion}%`} />
                </div>

                <div className="mt-6 rounded-[22px] bg-slate-50 p-5">
                  <div className="text-sm font-semibold text-slate-900">Decision rationale</div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{decision.rationale}</p>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Published variants</div>
                    <div className="mt-3 space-y-3">
                      {signal.variants.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">No variant published yet.</div>
                      ) : (
                        signal.variants.map((variant) => (
                          <div key={variant.slug} className="rounded-2xl border border-slate-200 p-4">
                            <div className="text-sm font-semibold text-slate-900">{variant.variantType}</div>
                            <p className="mt-2 text-sm text-slate-500">{variant.headline}</p>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                              <span className="rounded-full bg-slate-100 px-3 py-1">{variant.views} views</span>
                              <span className="rounded-full bg-slate-100 px-3 py-1">{variant.leads} leads</span>
                              <span className="rounded-full bg-slate-100 px-3 py-1">{variant.conversion}% conv</span>
                            </div>
                            <a href={`/p/${variant.slug}`} className="mt-3 inline-flex text-sm font-semibold text-cyan-600">Open landing →</a>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-slate-900">Leads</div>
                    <div className="mt-3 space-y-3">
                      {leads.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">No leads collected yet.</div>
                      ) : (
                        leads.slice(0, 5).map((lead) => (
                          <div key={lead.id} className="rounded-2xl border border-slate-200 p-4">
                            <div className="text-sm font-semibold text-slate-900">{lead.name || lead.email}</div>
                            <div className="mt-1 text-sm text-slate-500">{lead.email}</div>
                            {lead.note ? <p className="mt-2 text-sm leading-6 text-slate-600">{lead.note}</p> : null}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[22px] border border-slate-200 p-5">
                  <div className="text-sm font-semibold text-slate-900">MVP brief</div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{brief.summary}</p>
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
                    {brief.features.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Summary({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-3xl font-semibold tracking-tight text-slate-950">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{title}</div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
      <div className="text-2xl font-semibold tracking-tight text-slate-950">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  );
}
