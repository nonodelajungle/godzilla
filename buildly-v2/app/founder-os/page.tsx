"use client";

import { analyzeMarket, decideFromSignal, getProjectSignal, listProjectLeads, listProjects } from "../../lib/local-demo";
import { buildValidationScorecard } from "../../lib/validation-grade";

export default function FounderOsPage() {
  const projects = listProjects();
  const rows = projects.map((project) => {
    const signal = getProjectSignal(project.id);
    const leads = listProjectLeads(project.id);
    const market = analyzeMarket(project);
    const decision = decideFromSignal(project, signal);
    const scorecard = buildValidationScorecard(project, signal, leads, market);
    return { project, signal, leads, market, decision, scorecard };
  }).sort((a, b) => b.scorecard.overallScore - a.scorecard.overallScore);

  const totalProjects = rows.length;
  const totalLeads = rows.reduce((sum, item) => sum + item.signal.totalLeads, 0);
  const readyToBuild = rows.filter((item) => item.decision.code === "go").length;
  const topProject = rows[0] || null;

  return (
    <main className="min-h-screen bg-[#f7fbfb] px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(59,196,190,0.10),transparent_35%),radial-gradient(circle_at_top_right,rgba(121,103,255,0.10),transparent_35%),linear-gradient(180deg,#ffffff_0%,#f8fbfc_100%)] p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-4xl">
              <div className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Founder OS</div>
              <h1 className="mt-5 text-5xl font-bold tracking-[-0.05em] text-slate-950 md:text-6xl">The operating system for startup validation</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">Run the full founder loop in one place: shape the idea, validate the market, collect real signal, decide what to build, and prepare an investor-readable proof layer.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <a href="/studio" className="rounded-2xl bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white">Open studio</a>
              <a href="/dashboard" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700">Founder dashboard</a>
              <a href="/capital" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700">VC hub</a>
              <a href="/capital/compare" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700">Compare projects</a>
            </div>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-4">
          <SummaryCard label="Projects" value={String(totalProjects)} sub="Active startup tracks" />
          <SummaryCard label="Leads" value={String(totalLeads)} sub="Captured validation demand" />
          <SummaryCard label="Build now" value={String(readyToBuild)} sub="Projects ready for MVP" />
          <SummaryCard label="Top score" value={topProject ? `${topProject.scorecard.overallScore}/100` : "—"} sub={topProject ? topProject.project.input.idea : "No project yet"} />
        </section>

        <section className="grid gap-6 lg:grid-cols-5">
          <NavCard title="Idea" text="Shape the startup into a testable wedge, ICP and promise." href="/studio" cta="Open studio" />
          <NavCard title="Validate" text="Launch variants, traffic, interviews and feedback loops." href="/dashboard" cta="Open validate" />
          <NavCard title="Signal" text="Read performance, traction, and benchmark fit clearly." href="/dashboard" cta="Open signal" />
          <NavCard title="Decide" text="Get a clear call: go, iterate, narrow, price test, or kill." href="/dashboard" cta="Open decisions" />
          <NavCard title="Capital" text="Review the project through an investor-readable validation lens." href="/capital" cta="Open VC hub" />
        </section>

        <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Today in Buildly</div>
                <p className="mt-2 text-sm leading-6 text-slate-500">What matters right now across your startup validation system.</p>
              </div>
              <a href="/dashboard" className="text-sm font-semibold text-cyan-600">Open dashboard</a>
            </div>
            <div className="mt-6 space-y-4">
              {rows.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">No project yet. Start in the studio and generate your first validation flow.</div>
              ) : rows.slice(0, 5).map(({ project, signal, decision, scorecard }) => (
                <div key={project.id} className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-slate-900">{project.input.idea}</div>
                      <div className="mt-1 text-sm text-slate-500">{project.input.icp}</div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">Score {scorecard.overallScore}</span>
                      <span className={`rounded-full px-3 py-1 ${decision.code === "go" ? "bg-emerald-100 text-emerald-700" : decision.code === "kill" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>{decision.label}</span>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-4">
                    <MiniMetric label="Views" value={String(signal.totalViews)} />
                    <MiniMetric label="Leads" value={String(signal.totalLeads)} />
                    <MiniMetric label="Conv" value={`${signal.conversion}%`} />
                    <MiniMetric label="Next" value={scorecard.nextMilestones[0] || "—"} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a href={`/investor/${project.id}`} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">Investor mode</a>
                    <a href={`/evidence/${project.id}`} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">Evidence room</a>
                    <a href={`/memo/${project.id}`} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">Memo</a>
                    <a href={`/mvp/${project.id}`} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">MVP brief</a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <CalloutCard title="Why this can become a standard" body="Buildly is no longer only a founder tool. It is becoming a structured validation layer: scorecard, evidence, investor reading, build recommendation, and portfolio comparison." />
            <CalloutCard title="What funds could ask for" body="A Buildly project with at least 50 qualified visits, 5–10 real leads, qualitative notes, a score above 70, a clear decision trail, and a narrow MVP brief." />
            <CalloutCard title="What to do next" body={topProject ? `Push ${topProject.project.input.idea} through investor mode and memo export. Then sharpen the next milestone: ${topProject.scorecard.nextMilestones[0] || "collect more proof"}.` : "Create the first project in the studio, publish one landing, and collect the first three lead notes."} />
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"><div className="text-3xl font-bold tracking-tight text-slate-950">{value}</div><div className="mt-2 text-sm font-semibold text-slate-900">{label}</div><div className="mt-1 text-sm text-slate-500">{sub}</div></div>;
}

function NavCard({ title, text, href, cta }: { title: string; text: string; href: string; cta: string }) {
  return <a href={href} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-600">{title}</div><div className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{cta}</div><p className="mt-3 text-sm leading-7 text-slate-600">{text}</p></a>;
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-slate-50 p-3"><div className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</div><div className="mt-2 text-sm font-semibold text-slate-900">{value}</div></div>;
}

function CalloutCard({ title, body }: { title: string; body: string }) {
  return <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"><div className="text-lg font-semibold tracking-tight text-slate-950">{title}</div><p className="mt-3 text-sm leading-7 text-slate-600">{body}</p></div>;
}
