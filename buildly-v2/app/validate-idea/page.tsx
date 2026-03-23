"use client";

import { analyzeMarket, decideFromSignal, getProjectSignal, listProjectLeads, listProjects } from "../../lib/local-demo";
import { buildValidationScorecard } from "../../lib/validation-grade";

export default function ValidateIdeaPage() {
  const projects = listProjects();
  const rows = projects.map((project) => {
    const signal = getProjectSignal(project.id);
    const leads = listProjectLeads(project.id);
    const market = analyzeMarket(project);
    const decision = decideFromSignal(project, signal);
    const scorecard = buildValidationScorecard(project, signal, leads, market);
    return { project, signal, leads, market, decision, scorecard };
  }).sort((a, b) => b.scorecard.overallScore - a.scorecard.overallScore);

  const top = rows[0] || null;

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-slate-950">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5">
          <a href="/validate-idea" className="text-2xl font-bold tracking-tight">Buildly</a>
          <div className="hidden items-center gap-2 md:flex">
            <NavLink href="/studio" label="Start a validation" />
            <NavLink href="/leads" label="Leads" />
            <NavLink href="/capital" label="Investor view" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_70px_rgba(15,23,42,0.06)] md:p-10">
          <div className="max-w-4xl">
            <div className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">Validation before product</div>
            <h1 className="mt-5 text-5xl font-bold tracking-[-0.05em] md:text-6xl">Test a startup idea before you build anything.</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">Buildly helps creators validate an idea like a serious founder: define the angle, launch a first test, collect real signal, then decide whether the MVP deserves to exist.</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/studio" className="rounded-2xl bg-slate-950 px-6 py-4 text-sm font-semibold text-white">Start testing an idea</a>
            <a href="/founder-os" className="rounded-2xl border border-slate-200 px-6 py-4 text-sm font-semibold text-slate-800">Open founder workspace</a>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-4">
            <StepCard number="01" title="Describe the idea" text="Who it is for, what pain exists, and what promise you want to test." />
            <StepCard number="02" title="Launch the test" text="Generate landing variants, traffic copy, and a first wedge." />
            <StepCard number="03" title="Read the signal" text="Views, leads, conversion, objections, and qualitative notes." />
            <StepCard number="04" title="Make the decision" text="Go build, narrow the ICP, test pricing, iterate, or kill." />
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          <PromiseCard title="For creators" text="Understand clearly how to test an idea, even if you are not yet a seasoned founder." />
          <PromiseCard title="For operators" text="Run a tighter validation loop without losing time across tools and docs." />
          <PromiseCard title="For investors" text="Read startup validation through a more standardized signal and proof layer." />
        </section>

        <section className="mt-8 grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">How Buildly works</div>
                <p className="mt-2 text-sm leading-6 text-slate-500">A clearer path for a creator who wants to know what to do next.</p>
              </div>
              <a href="/studio" className="text-sm font-semibold text-slate-900">Open studio</a>
            </div>
            <div className="mt-6 space-y-4">
              <HowRow title="Start in the studio" body="Write the idea, the ICP, and the value proposition. Buildly generates a first validation setup." />
              <HowRow title="Publish and collect signal" body="Use the generated variants and traffic kit to get the first qualified visits and leads." />
              <HowRow title="Open the workspace" body="Read score, evidence, interviews, investor memo, and MVP scope in one place." />
              <HowRow title="Decide with discipline" body="If the signal is strong enough, build. If not, narrow, reframe, price test, or stop." />
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Your projects</div>
            <p className="mt-2 text-sm leading-6 text-slate-500">Recent validations and where to open them.</p>
            <div className="mt-6 space-y-4">
              {rows.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">No project yet. Start with one idea in the studio.</div>
              ) : rows.slice(0, 5).map(({ project, signal, decision, scorecard }) => (
                <div key={project.id} className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-slate-900">{project.input.idea}</div>
                      <div className="mt-1 text-sm text-slate-500">{project.input.icp}</div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{scorecard.overallScore}/100</span>
                      <span className={`rounded-full px-3 py-1 ${decision.code === "go" ? "bg-emerald-100 text-emerald-700" : decision.code === "kill" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>{decision.label}</span>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <Metric label="Views" value={String(signal.totalViews)} />
                    <Metric label="Leads" value={String(signal.totalLeads)} />
                    <Metric label="Conv" value={`${signal.conversion}%`} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a href={`/workspace/${project.id}`} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">Workspace</a>
                    <a href={`/interviews/${project.id}`} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">Interviews</a>
                    <a href={`/memo/${project.id}`} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">Memo</a>
                  </div>
                </div>
              ))}
            </div>
            {top ? <p className="mt-5 text-sm leading-7 text-slate-600">Top project right now: <span className="font-semibold text-slate-900">{top.project.input.idea}</span>. Best next move: {top.scorecard.nextMilestones[0] || "collect more proof"}.</p> : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return <a href={href} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:shadow-sm">{label}</a>;
}

function StepCard({ number, title, text }: { number: string; title: string; text: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{number}</div><div className="mt-3 text-xl font-semibold tracking-tight text-slate-950">{title}</div><p className="mt-3 text-sm leading-7 text-slate-600">{text}</p></div>;
}

function PromiseCard({ title, text }: { title: string; text: string }) {
  return <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"><div className="text-lg font-semibold tracking-tight text-slate-950">{title}</div><p className="mt-3 text-sm leading-7 text-slate-600">{text}</p></div>;
}

function HowRow({ title, body }: { title: string; body: string }) {
  return <div className="rounded-2xl border border-slate-200 p-4"><div className="text-sm font-semibold text-slate-900">{title}</div><p className="mt-2 text-sm leading-7 text-slate-600">{body}</p></div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-slate-50 p-3"><div className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</div><div className="mt-2 text-sm font-semibold text-slate-900">{value}</div></div>;
}
