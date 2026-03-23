import { PremiumShell } from "../../components/premium-shell";

export default function BrandPage() {
  return (
    <PremiumShell
      section="brand"
      title="Buildly is becoming the standard for startup validation"
      subtitle="A premium product experience for founders, operators, and investors who want structured proof before product and capital commitment."
      accent="emerald"
    >
      <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-8">
          <Panel title="Brand promise">
            <p className="text-lg leading-8 text-slate-700">Buildly helps startup creators test ideas, validate demand, and decide what to build through one integrated validation system.</p>
          </Panel>

          <Panel title="Positioning">
            <div className="grid gap-4 md:grid-cols-2">
              <ValueCard title="For founders" body="A daily operating system to test, learn, decide, and narrow the MVP without wasting runway." />
              <ValueCard title="For funds" body="A structured validation layer that makes early startup projects more legible, comparable, and investable." />
            </div>
          </Panel>

          <Panel title="Design principles">
            <div className="grid gap-4 md:grid-cols-2">
              <ValueCard title="Clarity over noise" body="Every screen should answer one high-value question, not show ten weak ones." />
              <ValueCard title="Proof over decoration" body="Signal, evidence, and decision quality matter more than visual gimmicks." />
              <ValueCard title="Premium calm" body="Whitespace, contrast, editorial rhythm, and confidence should dominate the product tone." />
              <ValueCard title="System over feature pile" body="The product should feel like one coherent operating layer, not a collection of tools." />
            </div>
          </Panel>
        </section>

        <aside className="space-y-8">
          <Panel title="Core routes">
            <RouteList />
          </Panel>
          <Panel title="Brand language">
            <ul className="space-y-3 text-sm leading-7 text-slate-600">
              <li>• Founder OS</li>
              <li>• Validation standard</li>
              <li>• Evidence room</li>
              <li>• Build readiness</li>
              <li>• Investor-readable proof</li>
            </ul>
          </Panel>
        </aside>
      </div>
    </PremiumShell>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm"><div className="mb-4 text-sm font-semibold text-slate-900">{title}</div>{children}</section>;
}
function ValueCard({ title, body }: { title: string; body: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><div className="text-base font-semibold text-slate-900">{title}</div><p className="mt-3 text-sm leading-7 text-slate-600">{body}</p></div>;
}
function RouteList() {
  const items = [
    ["/founder-os", "Main premium entry"],
    ["/studio", "Validation studio"],
    ["/dashboard", "Validation and traction dashboard"],
    ["/leads", "Lead inbox"],
    ["/workspace/[projectId]", "Unified project workspace"],
    ["/capital", "VC hub"],
  ];
  return <div className="space-y-3">{items.map(([path, body]) => <div key={path} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-sm font-semibold text-slate-900">{path}</div><div className="mt-2 text-sm text-slate-600">{body}</div></div>)}</div>;
}
