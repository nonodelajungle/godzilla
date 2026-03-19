import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(900px_420px_at_0%_0%,rgba(78,197,255,.14),transparent_55%),radial-gradient(900px_420px_at_100%_0%,rgba(255,79,179,.10),transparent_52%),#f6f8fc] px-6 py-8 text-slate-950 md:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-[28px] border border-white/60 bg-white/80 p-6 shadow-soft backdrop-blur">
          <div className="mb-3 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
            Buildly
          </div>
          <h1 className="max-w-5xl text-4xl font-semibold tracking-tight md:text-6xl">
            Validate startup ideas before you build anything
          </h1>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-600">
            Buildly turns your idea into a landing page, tests it on real users through social channels,
            and tells you exactly what to build next.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/studio" className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-6 font-semibold text-white">
              Launch studio
            </Link>
            <Link href="/dashboard" className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-6 font-semibold text-slate-800">
              Open dashboard
            </Link>
          </div>
        </header>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">What Buildly does</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Validate, test, decide, then build</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <FeatureCard title="Validate" text="Turn a raw idea into a landing-page angle and a clear hypothesis." />
            <FeatureCard title="Test" text="Run experiments through social and paid channels where attention already exists." />
            <FeatureCard title="Generate MVP" text="Once the signal is real, move from validation into the first product version." />
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">From idea to first product direction</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StepCard title="1. Validate">Buildly generates the landing-page angle, value proposition, and first hypothesis.</StepCard>
            <StepCard title="2. Test">You push the concept through social or paid channels to see if real users react.</StepCard>
            <StepCard title="3. Decide">Buildly reads the signal, scores the opportunity, and tells you what matters next.</StepCard>
            <StepCard title="4. Build">When the signal is strong enough, you move into a focused MVP instead of guessing.</StepCard>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Pricing</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Simple pricing for founder progress</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <PriceCard title="Starter" price="$29" description="Validate your first ideas and generate early landing concepts." items={["Idea validation", "Landing-page generation", "Basic recommendations"]} />
            <PriceCard title="Growth" price="$99" description="Run more experiments, test better angles, and tighten your positioning." items={["Channel recommendations", "Smarter validation loops", "Stronger decision support"]} featured />
            <PriceCard title="Pro" price="$299" description="Move from validated demand into a first product scope." items={["MVP generation path", "Advanced agent guidance", "Priority support"]} />
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[22px] border border-slate-200 p-5">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function StepCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[22px] border border-slate-200 p-5">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{children}</p>
    </div>
  );
}

function PriceCard({
  title,
  price,
  description,
  items,
  featured = false,
}: {
  title: string;
  price: string;
  description: string;
  items: string[];
  featured?: boolean;
}) {
  return (
    <div className={`rounded-[24px] border p-5 ${featured ? "border-violet-300 bg-violet-50/50" : "border-slate-200 bg-white"}`}>
      <h3 className="text-xl font-semibold">{title}</h3>
      <div className="mt-3 text-4xl font-semibold tracking-tight">
        {price}
        <span className="ml-1 text-base font-medium text-slate-500">/ month</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
