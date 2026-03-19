import { demoIdeas, validateIdea } from "../../lib/buildly";

const cards = demoIdeas.map((idea) => ({ ...idea, result: validateIdea(idea) }));

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
          <a href="/" className="text-sm font-medium text-slate-500">← Back to validator</a>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Founder dashboard</h1>
          <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">A simple full-stack style control room for Buildly: active ideas, readiness, recommended next step, and experiments to run before generating the MVP.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Summary title="Ideas in validation" value="3" />
          <Summary title="Ready for MVP" value={String(cards.filter((card) => card.result.readiness === "High").length)} />
          <Summary title="Average score" value={String(Math.round(cards.reduce((sum, card) => sum + card.result.score, 0) / cards.length))} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {cards.map((card) => (
            <article key={card.idea} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">{card.icp}</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">{card.idea}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{card.value}</p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Score {card.result.score}</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">{card.result.channel}</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">{card.result.readiness}</span>
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-700">{card.result.nextStep}</p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
                {card.result.experiments.map((experiment) => (
                  <li key={experiment}>{experiment}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

function Summary({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft">
      <div className="text-3xl font-semibold tracking-tight">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{title}</div>
    </div>
  );
}
