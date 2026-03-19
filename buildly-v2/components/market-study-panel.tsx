import type { MarketStudy } from "../lib/market-study";

export function MarketStudyPanel({ study }: { study: MarketStudy }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">Market Study</div>
          <p className="mt-2 text-sm leading-6 text-slate-500">Structured market read with demand, size proxy, spending power, saturation, and go-to-market guidance.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <Badge tone="emerald" label={`Demand · ${study.demandSignal}`} />
          <Badge tone="sky" label={`Size · ${study.marketSizeProxy}`} />
          <Badge tone="amber" label={`Spend · ${study.spendingPower}`} />
          <Badge tone="rose" label={`Saturation · ${study.saturation}`} />
          <Badge tone="slate" label={`Search · ${study.searchIntent}`} />
        </div>
      </div>

      <p className="mt-5 text-sm leading-7 text-slate-600">{study.summary}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Buying motion" body={study.buyingMotion} />
        <ListCard title="Demand evidence" items={study.demandEvidence} />
        <ListCard title="Competitor patterns" items={study.competitorPatterns} />
      </div>

      <div className="mt-6 rounded-2xl bg-slate-50 p-5">
        <div className="text-sm font-semibold text-slate-900">Recommended moves</div>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
          {study.recommendedMoves.map((item) => <li key={item}>• {item}</li>)}
        </ul>
      </div>
    </div>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</div>
      <p className="mt-3 text-sm leading-7 text-slate-700">{body}</p>
    </div>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</div>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
        {items.map((item) => <li key={item}>• {item}</li>)}
      </ul>
    </div>
  );
}

function Badge({ tone, label }: { tone: "emerald" | "sky" | "amber" | "rose" | "slate"; label: string }) {
  const styles = {
    emerald: "bg-emerald-50 text-emerald-700",
    sky: "bg-sky-50 text-sky-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    slate: "bg-slate-100 text-slate-700",
  } as const;
  return <span className={`rounded-full px-3 py-2 ${styles[tone]}`}>{label}</span>;
}
