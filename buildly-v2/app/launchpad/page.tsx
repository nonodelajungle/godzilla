"use client";

import { analyzeMarket, decideFromSignal, getProjectSignal, listProjectLeads, listProjects } from "../../lib/local-demo";
import { buildValidationScorecard } from "../../lib/validation-grade";

export default function LaunchpadPage() {
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
    <main className="min-h-screen bg-[#07111a] text-white">
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5">
          <a href="/launchpad" className="text-2xl font-bold tracking-tight text-white">Buildly</a>
          <div className="hidden items-center gap-2 md:flex">
            <TopLink href="/studio" label="Studio" />
            <TopLink href="/leads" label="Leads" />
            <TopLink href="/capital" label="Capital" />
            <TopLink href="/founder-os" label="Workspace" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <section className="overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(26,214,190,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(82,120,255,0.20),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-10">
          <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Startup validation system</div>
              <h1 className="mt-6 max-w-4xl text-5xl font-bold tracking-[-0.06em] text-white md:text-7xl">Test the idea before the startup consumes you.</h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">Buildly gives creators a sharper way to validate: generate the first test, push a real signal, understand what people actually want, then decide whether the MVP deserves to exist.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="/studio" className="rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-slate-950">Start testing an idea</a>
                <a href="/workspace/${top?.project.id || ''}" className="rounded-2xl border border-white/15 px-6 py-4 text-sm font-semibold text-white">Open project workspace</a>
              </div>
              <div className="mt-10 grid gap-4 md:grid-cols-3">
                <SignalChip label="One founder loop" value="Idea → Test → Signal → Decision" />
                <SignalChip label="Built for creators" value="Clearer than a deck, faster than a PM stack" />
                <SignalChip label="Readable by funds" value="Scorecard, evidence, memo, and build readiness" />
              </div>
            </div>

            <div className="grid gap-4">
              <GlassPanel title="How you test an idea here">
                <Step title="1. Start in Studio" body="Describe the idea, the ICP, and the promise you want to test." />
                <Step title="2. Launch the first wedge" body="Use landing variants and traffic copy to get the first qualified visits." />
                <Step title="3. Read the signal" body="Views, leads, conversion, objections, interview notes, and scorecard." />
                <Step title="4. Make the call" body="Build, narrow, price test, iterate, or kill with more discipline." />
              </GlassPanel>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          <DarkCard title="For startup creators" body="You stop guessing what to build and start reading real market signal earlier." />
          <DarkCard title="For founder operators" body="One place to run validation, interviews, evidence, and MVP narrowing." />
          <DarkCard title="For early-stage funds" body="A more legible pre-product signal layer before real diligence starts." />
        </section>

        <section className="mt-8 grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-7 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-white">How Buildly feels when it works</div>
                <p className="mt-2 text-sm leading-6 text-slate-400">Less startup theatre. More proof, more signal, better decisions.</p>
              </div>
              <a href="/studio" className="text-sm font-semibold text-cyan-300">Open studio</a>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <FeatureBlock eyebrow="Sharper entry" title="You know where to begin" body="One obvious action: start testing an idea. No ambiguity, no product maze." />
              <FeatureBlock eyebrow="Real traction logic" title="You know what to measure" body="Buildly turns landing tests and founder notes into readable signal." />
              <FeatureBlock eyebrow="Decision discipline" title="You know what to do next" body="The product exists to help you decide, not just generate artifacts." />
              <FeatureBlock eyebrow="Investor legibility" title="You can show the proof" body="Memo, evidence room, scorecard and build-readiness live in the same system." />
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/5 p-7 backdrop-blur-xl">
            <div className="text-sm font-semibold text-white">Recent validations</div>
            <p className="mt-2 text-sm leading-6 text-slate-400">Open the project directly where the decision gets made.</p>
            <div className="mt-6 space-y-4">
              {rows.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-slate-400">No project yet. Start with one idea in the studio.</div>
              ) : rows.slice(0, 5).map(({ project, signal, decision, scorecard }) => (
                <div key={project.id} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-white">{project.input.idea}</div>
                      <div className="mt-1 text-sm text-slate-400">{project.input.icp}</div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-slate-200">{scorecard.overallScore}/100</span>
                      <span className={`rounded-full px-3 py-1 ${decision.code === "go" ? "bg-emerald-500/15 text-emerald-300" : decision.code === "kill" ? "bg-rose-500/15 text-rose-300" : "bg-amber-500/15 text-amber-300"}`}>{decision.label}</span>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <MiniMetric label="Views" value={String(signal.totalViews)} />
                    <MiniMetric label="Leads" value={String(signal.totalLeads)} />
                    <MiniMetric label="Conv" value={`${signal.conversion}%`} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a href={`/workspace/${project.id}`} className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-white">Workspace</a>
                    <a href={`/interviews/${project.id}`} className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-white">Interviews</a>
                    <a href={`/memo/${project.id}`} className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-white">Memo</a>
                  </div>
                </div>
              ))}
            </div>
            {top ? <p className="mt-5 text-sm leading-7 text-slate-300">Top project now: <span className="font-semibold text-white">{top.project.input.idea}</span>. Next move: {top.scorecard.nextMilestones[0] || "collect more proof"}.</p> : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function TopLink({ href, label }: { href: string; label: string }) { return <a href={href} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10">{label}</a>; }
function SignalChip({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div><div className="mt-3 text-sm font-semibold leading-6 text-white">{value}</div></div>; }
function GlassPanel({ title, children }: { title: string; children: React.ReactNode }) { return <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 backdrop-blur-2xl"><div className="text-sm font-semibold text-white">{title}</div><div className="mt-5 space-y-4">{children}</div></div>; }
function Step({ title, body }: { title: string; body: string }) { return <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-sm font-semibold text-white">{title}</div><p className="mt-2 text-sm leading-7 text-slate-300">{body}</p></div>; }
function DarkCard({ title, body }: { title: string; body: string }) { return <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.16)] backdrop-blur"><div className="text-xl font-semibold tracking-tight text-white">{title}</div><p className="mt-3 text-sm leading-7 text-slate-300">{body}</p></div>; }
function FeatureBlock({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) { return <div className="rounded-2xl border border-white/10 bg-black/20 p-5"><div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">{eyebrow}</div><div className="mt-3 text-lg font-semibold tracking-tight text-white">{title}</div><p className="mt-3 text-sm leading-7 text-slate-300">{body}</p></div>; }
function MiniMetric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-white/5 p-3"><div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{label}</div><div className="mt-2 text-sm font-semibold text-white">{value}</div></div>; }
