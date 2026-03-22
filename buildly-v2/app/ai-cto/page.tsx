export default function AiCtoPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,196,190,0.10),transparent_28%),radial-gradient(circle_at_top_right,rgba(121,103,255,0.12),transparent_30%),linear-gradient(180deg,#f8fbfd_0%,#f4f7fb_100%)] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 text-sm font-bold text-white">B</div>
            <div>
              <div className="text-sm font-semibold text-slate-950">Buildly</div>
              <div className="text-xs text-slate-500">AI CTO for MVPs</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <a href="/cto-studio" className="rounded-2xl bg-slate-950 px-4 py-2 font-semibold text-white">Open CTO Studio</a>
            <a href="/founder-os-visual" className="rounded-2xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700">Visual workspace</a>
          </div>
        </div>
      </header>

      <section className="px-4 pb-20 pt-16 md:px-6 md:pb-24 md:pt-24">
        <div className="mx-auto grid max-w-7xl items-center gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              Buildly becomes the Lovable of MVPs
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-bold tracking-[-0.06em] text-slate-950 md:text-7xl">
              Your AI CTO for turning startup ideas into
              <span className="block bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-500 bg-clip-text text-transparent">
                build-ready MVPs
              </span>
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-500 md:text-xl">
              Buildly helps founders go from idea to validation, scope, architecture, roadmap, and launch plan.
              Not just copy. Not just landing pages. A real AI CTO workflow for shipping the right MVP faster.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/cto-studio" className="rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-sm">Launch CTO Studio</a>
              <a href="/workspace" className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700">Open workspace</a>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <StatCard label="Product thesis" value="Sharper framing" />
              <StatCard label="MVP scope" value="Build less" />
              <StatCard label="Launch plan" value="Ship faster" />
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:p-7">
            <div className="text-sm font-semibold text-slate-900">What an AI CTO run should produce</div>
            <div className="mt-5 space-y-3">
              {[
                "Product thesis and wedge",
                "Scope now / later / never",
                "Recommended architecture",
                "Suggested stack",
                "Roadmap and launch sequence",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 p-4 text-sm leading-6 text-slate-700">{item}</div>
              ))}
            </div>
            <div className="mt-6 rounded-3xl border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(45,197,186,0.12),transparent_35%),linear-gradient(135deg,#0f172a,#111827_55%,#0b2230)] p-5 text-white">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Positioning</div>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                Buildly should feel like the founder is talking to an exceptional AI CTO: opinionated, fast, structured, and focused on what to build next.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-600">How it works</div>
            <h2 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-slate-950 md:text-5xl">A founder workflow that behaves like an AI product leader</h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-500">
              Input the idea once, then let Buildly move from concept to product plan with the right level of structure.
            </p>
          </div>
          <div className="mt-12 grid gap-6 xl:grid-cols-4">
            <StepCard step="01" title="Frame the opportunity" text="Capture the problem, ICP, and outcome with a strong product lens." />
            <StepCard step="02" title="Validate demand" text="Turn uncertainty into a verdict with visible signal and focus." />
            <StepCard step="03" title="Design the MVP" text="Generate a clear v1 scope, architecture blocks, and recommended stack." />
            <StepCard step="04" title="Launch with intent" text="Get roadmap, priorities and launch sequence instead of guessing." />
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-lg font-semibold text-slate-950">{value}</div>
    </div>
  );
}

function StepCard({ step, title, text }: { step: string; title: string; text: string }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 text-left">
      <div className="text-sm font-semibold text-cyan-600">{step}</div>
      <div className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{title}</div>
      <p className="mt-3 text-sm leading-7 text-slate-500">{text}</p>
    </div>
  );
}
