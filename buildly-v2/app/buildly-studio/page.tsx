"use client";

import { useMemo, useState } from "react";

type DomainKey = "travel" | "commerce" | "delivery" | "saas" | "jobs" | "real-estate" | "fintech";
type Priority = "P1" | "P2" | "P3";
type TabKey = "overview" | "features" | "architecture" | "launch";
type Verdict = "Go" | "Iterate" | "Drop";

type FormState = {
  idea: string;
  icp: string;
  value: string;
  domain: DomainKey;
};

type FeatureItem = { title: string; why: string; priority: Priority };
type BenchmarkPack = {
  label: string;
  inspirations: string[];
  core: FeatureItem[];
  trust: string[];
  conversion: string[];
  later: string[];
  avoid: string[];
  moat: string;
};

type ScoreItem = { label: string; score: number; insight: string };

const packs: Record<DomainKey, BenchmarkPack> = {
  travel: {
    label: "Travel / booking",
    inspirations: ["Airbnb", "Booking.com"],
    core: [
      { title: "Advanced filters", why: "Users need to narrow inventory fast by dates, guests, price and amenities.", priority: "P1" },
      { title: "Map-based discovery", why: "Location is part of the decision, not a secondary detail.", priority: "P1" },
      { title: "Saved listings / wishlist", why: "Travel decisions are compared over time before booking.", priority: "P1" },
      { title: "Verified reviews", why: "Trust is built through real guest proof and review clarity.", priority: "P1" },
    ],
    trust: ["Verified reviews", "Availability clarity", "Transparent fees", "Accessibility info"],
    conversion: ["Sticky dates + guests", "Map + list view", "Wishlists", "Loyalty perks"],
    later: ["Dynamic pricing intelligence", "Host tooling", "Split stays"],
    avoid: ["Too many property types at launch", "Complex loyalty tiers on day one"],
    moat: "Win with better search quality and trust density, not raw inventory breadth.",
  },
  commerce: {
    label: "Commerce / marketplace",
    inspirations: ["Shopify", "Shop Pay"],
    core: [
      { title: "Fast product discovery", why: "Category, filtering and quick comparison drive intent to cart.", priority: "P1" },
      { title: "Accelerated checkout", why: "Checkout friction kills conversion in commerce products.", priority: "P1" },
      { title: "Cart recovery cues", why: "Merchants need a fast path back to incomplete purchases.", priority: "P1" },
      { title: "Order tracking", why: "Post-purchase clarity increases trust and repeat behavior.", priority: "P2" },
    ],
    trust: ["Secure checkout", "Clear shipping promises", "Order tracking", "Consistent mobile checkout"],
    conversion: ["One-page or accelerated checkout", "Saved identity", "Express pay", "Buy now pay later"],
    later: ["Loyalty and upsells", "Post-purchase flows", "Subscriptions"],
    avoid: ["Marketplace complexity before product-market fit", "Too many payment edge cases early"],
    moat: "Win on checkout speed and purchase confidence before expanding catalog logic.",
  },
  delivery: {
    label: "Delivery / on-demand",
    inspirations: ["Uber", "DoorDash"],
    core: [
      { title: "Upfront pricing", why: "Price clarity drives immediate action and reduces hesitation.", priority: "P1" },
      { title: "Real-time tracking", why: "Live status is part of the product promise, not a bonus.", priority: "P1" },
      { title: "Status notifications", why: "Users expect proactive updates across the delivery lifecycle.", priority: "P1" },
      { title: "Bundle order", why: "Users often want one delivery flow across multiple needs.", priority: "P2" },
    ],
    trust: ["ETA accuracy", "Price transparency", "Live courier status", "Delivery notifications"],
    conversion: ["Fast reorder", "Saved destinations", "Bundled ordering", "Visible ETA"],
    later: ["Route optimization", "Promotions engine", "Courier ops suite"],
    avoid: ["Multi-city ops complexity too early", "Overbuilding courier tooling before demand"],
    moat: "Win on reliability and speed of the flow, not feature count.",
  },
  saas: {
    label: "SaaS / collaboration",
    inspirations: ["Notion"],
    core: [
      { title: "Templates", why: "Templates reduce empty-state friction and speed up onboarding.", priority: "P1" },
      { title: "Structured objects", why: "Reusable records create product depth without chaos.", priority: "P1" },
      { title: "Views and organization", why: "Teams need multiple ways to see the same data.", priority: "P1" },
      { title: "Basic collaboration", why: "Comments and sharing turn tools into team products.", priority: "P2" },
    ],
    trust: ["Good defaults", "No empty state anxiety", "Clear permissions", "Reusable workflows"],
    conversion: ["Template gallery", "Fast setup", "Shared workspace value", "Starter use cases"],
    later: ["Automation", "Advanced permissions", "Marketplace ecosystem"],
    avoid: ["Trying to be a full platform on day one", "Too much customization before adoption"],
    moat: "Win on opinionated workflows and faster time-to-value.",
  },
  jobs: {
    label: "Jobs / talent marketplace",
    inspirations: ["Upwork"],
    core: [
      { title: "Structured job post", why: "Supply quality improves when demand is framed clearly.", priority: "P1" },
      { title: "Matching and invite flow", why: "Clients need curated matches, not raw marketplace noise.", priority: "P1" },
      { title: "Talent filters and vetting", why: "Bad matching destroys trust on both sides.", priority: "P1" },
      { title: "Proposal inbox", why: "Hiring requires a clear place to compare responses.", priority: "P1" },
    ],
    trust: ["Profiles + history", "Ratings / badges", "Curated invites", "Clear proposal review"],
    conversion: ["Fast post creation", "Suggested matches", "Invite top talent", "Interview workflow"],
    later: ["Consultations", "Recruiter mode", "Team workspaces"],
    avoid: ["Too many talent categories at launch", "Enterprise procurement complexity"],
    moat: "Win by improving match quality and hiring speed.",
  },
  "real-estate": {
    label: "Real estate / listings",
    inspirations: ["Zillow"],
    core: [
      { title: "Map-led search", why: "Location is central to the decision.", priority: "P1" },
      { title: "Media-rich listing pages", why: "High-intent buyers need visuals before contact.", priority: "P1" },
      { title: "Saved searches / favorites", why: "Decisions unfold over time.", priority: "P1" },
      { title: "Lead capture on listings", why: "Every listing must convert attention into inquiry.", priority: "P1" },
    ],
    trust: ["Good media", "Map context", "Saved search alerts", "Listing freshness"],
    conversion: ["Immersive tours", "Favorites", "Contact CTA", "Alert flows"],
    later: ["Mortgage tools", "Agent CRM", "Comparative valuation"],
    avoid: ["Nationwide inventory fantasies on day one", "Heavy B2B tooling too soon"],
    moat: "Win with better listing quality and stronger lead conversion loops.",
  },
  fintech: {
    label: "Fintech / subscriptions",
    inspirations: ["Stripe", "Shopify Billing"],
    core: [
      { title: "Billing plans and trials", why: "Monetization logic is part of the product experience.", priority: "P1" },
      { title: "Webhook-driven status sync", why: "Subscription state is asynchronous by nature.", priority: "P1" },
      { title: "Lifecycle states", why: "Active, past_due and canceled states drive access control.", priority: "P1" },
      { title: "Failure recovery", why: "Payment failure handling protects retention and revenue.", priority: "P2" },
    ],
    trust: ["Billing transparency", "Webhook reliability", "Access control", "Failure handling"],
    conversion: ["Trial setup", "Clear pricing model", "Fast checkout", "Upgrade paths"],
    later: ["Dunning optimization", "Revenue analytics", "Complex pricing tiers"],
    avoid: ["Custom billing engine too early", "Edge-case tax complexity in v1"],
    moat: "Win with reliability and clean subscription logic, not financial feature sprawl.",
  },
};

const examples: FormState[] = [
  { idea: "Marketplace for short-term apartment stays", icp: "City travelers", value: "Help travelers find and book the right stay faster with more trust.", domain: "travel" },
  { idea: "Freelancer hiring platform for startup founders", icp: "Early-stage founders", value: "Help founders find, compare and hire the right freelance talent quickly.", domain: "jobs" },
  { idea: "Subscription CRM for independent coaches", icp: "Independent coaches", value: "Help coaches manage clients, billing and recurring offers in one place.", domain: "fintech" },
];

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function hashText(value: string) {
  let total = 0;
  for (let i = 0; i < value.length; i += 1) total += value.charCodeAt(i) * (i + 1);
  return total;
}

function verdictTone(verdict: Verdict) {
  if (verdict === "Go") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (verdict === "Iterate") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-rose-50 text-rose-700 border-rose-200";
}

function priorityTone(priority: Priority) {
  if (priority === "P1") return "bg-emerald-100 text-emerald-700";
  if (priority === "P2") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

function buildStudioPlan(form: FormState) {
  const benchmark = packs[form.domain];
  const text = `${form.idea} ${form.icp} ${form.value}`.toLowerCase();
  const seed = hashText(text);
  const urgency = clamp(45 + (seed % 36) + (/save|revenue|sales|manual|cost|faster|time|pipeline|clients|activation/.test(text) ? 10 : 0));
  const willingnessToPay = clamp(44 + (Math.floor(seed / 7) % 35) + (/b2b|agency|saas|sales|ops|finance|crm|onboarding/.test(text) ? 11 : 0));
  const channelAccess = clamp(41 + (Math.floor(seed / 11) % 32) + (/freelance|agency|designer|founder|creator|saas|boutique/.test(text) ? 10 : 0));
  const technicalSimplicity = clamp(48 + (Math.floor(seed / 13) % 28) + (/assistant|copilot|automation|qualify|proposal|onboarding/.test(text) ? 8 : 0));

  const scorecard: ScoreItem[] = [
    { label: "Urgency", score: urgency, insight: urgency >= 70 ? "Pain is strong enough to justify fast validation." : "The trigger moment still needs sharpening." },
    { label: "Willingness to pay", score: willingnessToPay, insight: willingnessToPay >= 70 ? "The promise maps to a monetizable pain." : "ROI needs to be more explicit." },
    { label: "Channel access", score: channelAccess, insight: channelAccess >= 70 ? "There is a believable route to early buyers." : "The first channel is not obvious enough yet." },
    { label: "Technical simplicity", score: technicalSimplicity, insight: technicalSimplicity >= 70 ? "The MVP can likely ship without heavy infrastructure." : "Keep the first version narrower." },
  ];

  const score = Math.round(scorecard.reduce((sum, item) => sum + item.score, 0) / scorecard.length);
  const verdict: Verdict = score >= 74 ? "Go" : score >= 58 ? "Iterate" : "Drop";

  return {
    benchmark,
    score,
    verdict,
    thesis: `Build a focused ${benchmark.label.toLowerCase()} product for ${form.icp.toLowerCase()} that helps them ${form.value.toLowerCase()}`,
    wedge: `Start with one narrow workflow only: ${form.idea.toLowerCase()} for ${form.icp.toLowerCase()}.`,
    architecture: [
      "Landing and onboarding layer",
      "Domain workflow engine",
      "Trust and conversion components",
      "Persistence and analytics",
      "Launch feedback loop",
    ],
    roadmap: [
      "Week 1: frame the wedge and entry UX",
      "Week 2: ship the core workflow and must-have features",
      "Week 3: add trust and conversion layer",
      "Week 4: launch with one acquisition channel",
    ],
    scorecard,
  };
}

export default function BuildlyStudioPage() {
  const [form, setForm] = useState<FormState>(examples[0]);
  const [tab, setTab] = useState<TabKey>("overview");
  const plan = useMemo(() => buildStudioPlan(form), [form]);

  return (
    <div className="min-h-screen bg-[#f7fbfb] text-slate-900">
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <span className="text-2xl font-bold tracking-tight text-cyan-600">Buildly</span>
          <div className="flex items-center gap-4">
            <a href="#how-it-works" className="hidden text-sm text-slate-500 transition hover:text-slate-900 sm:block">How it works</a>
            <a href="#generator" className="hidden text-sm text-slate-500 transition hover:text-slate-900 sm:block">Generate MVP</a>
            <a href="/studio-visual" className="hidden text-sm text-slate-500 transition hover:text-slate-900 sm:block">Studio visual</a>
            <a href="#generator" className="rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95">Get Started</a>
          </div>
        </div>
      </nav>

      <main>
        <section className="bg-[radial-gradient(circle_at_top_left,rgba(59,196,190,0.10),transparent_35%),radial-gradient(circle_at_top_right,rgba(121,103,255,0.12),transparent_35%),linear-gradient(180deg,#f8fcfc_0%,#f5f8fb_100%)] px-4 pb-24 pt-28">
          <div className="mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center rounded-full bg-emerald-50 px-5 py-2 text-sm font-medium text-emerald-600">✦ Benchmark-powered MVP Generator</div>
            <h1 className="mx-auto mt-8 max-w-4xl text-5xl font-bold tracking-[-0.05em] text-slate-950 md:text-7xl">
              Generate the right MVP
              <span className="block bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-500 bg-clip-text text-transparent">using the feature DNA of category leaders</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-xl leading-9 text-slate-500">
              You choose a domain. Buildly injects the patterns of leaders like Airbnb, Booking, Uber, DoorDash, Notion, Upwork, Zillow and Stripe into the MVP scope.
            </p>
          </div>
        </section>

        <section id="generator" className="relative -mt-10 px-4">
          <div className="mx-auto max-w-4xl rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Describe your startup</h2>
                <p className="mt-2 text-slate-500">Buildly generates must-have now, trust layer, conversion layer, later, avoid in v1 and category moat.</p>
              </div>
              <button type="button" onClick={() => setForm(examples[1])} className="text-sm font-semibold text-cyan-600 transition hover:text-cyan-700">Fill example</button>
            </div>

            <div className="space-y-5">
              <Field label="Startup Idea" placeholder="e.g. Marketplace for short-term apartment stays" value={form.idea} onChange={(value) => setForm({ ...form, idea: value })} />
              <Field label="Target Customer (ICP)" placeholder="e.g. City travelers" value={form.icp} onChange={(value) => setForm({ ...form, icp: value })} />
              <Field label="Value Proposition" placeholder="e.g. Help travelers find and book the right stay faster with more trust" value={form.value} onChange={(value) => setForm({ ...form, value })} />
              <label className="block text-left">
                <span className="mb-2 block text-lg font-semibold text-slate-900">Business domain</span>
                <select value={form.domain} onChange={(event) => setForm({ ...form, domain: event.target.value as DomainKey })} className="w-full rounded-2xl border border-slate-200 bg-[#fbfbfc] px-5 py-4 text-lg text-slate-900 outline-none transition focus:border-cyan-200 focus:bg-white">
                  {Object.entries(packs).map(([key, pack]) => (
                    <option key={key} value={key}>{pack.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
              <strong className="text-slate-900">Benchmark inspirations:</strong> {plan.benchmark.inspirations.join(" · ")}
            </div>
          </div>
        </section>

        <section className="px-4 pb-4 pt-10">
          <div className="mx-auto max-w-6xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <div className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${verdictTone(plan.verdict)}`}>{plan.verdict}</div>
                <h2 className="mt-5 text-4xl font-bold tracking-[-0.04em] text-slate-950 md:text-5xl">{form.idea}</h2>
                <p className="mt-4 text-lg leading-8 text-slate-500">{plan.thesis}</p>
              </div>
              <div className="grid gap-3 md:min-w-[260px] md:grid-cols-2">
                <MetricCard label="Score" value={`${plan.score}/100`} />
                <MetricCard label="Domain" value={plan.benchmark.label} />
                <MetricCard label="Mode" value="Generate MVP" />
                <MetricCard label="Focus" value="Category DNA" />
              </div>
            </div>
            <div className="mt-6 rounded-3xl border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(45,197,186,0.16),transparent_35%),linear-gradient(135deg,#0f172a,#111827_55%,#0b2230)] p-5 text-white">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Category moat</div>
              <p className="mt-3 text-sm leading-7 text-slate-200">{plan.benchmark.moat}</p>
            </div>
          </div>
        </section>

        <section className="px-4 pb-4 pt-4">
          <div className="mx-auto flex max-w-6xl flex-wrap gap-2 rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm">
            <TabButton active={tab === "overview"} onClick={() => setTab("overview")} label="Overview" />
            <TabButton active={tab === "features"} onClick={() => setTab("features")} label="Features" />
            <TabButton active={tab === "architecture"} onClick={() => setTab("architecture")} label="Architecture" />
            <TabButton active={tab === "launch"} onClick={() => setTab("launch")} label="Launch" />
          </div>
        </section>

        {tab === "overview" ? (
          <section className="px-4 pb-8 pt-6">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
              <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">Validation scorecard</div>
                <div className="mt-5 space-y-4">
                  {plan.scorecard.map((item) => (
                    <div key={item.label}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-800">{item.label}</span>
                        <span className="text-slate-500">{item.score}/100</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500" style={{ width: `${item.score}%` }} />
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{item.insight}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">Benchmark layer</div>
                <div className="mt-5 space-y-4">
                  <SimpleList title="Trust layer" items={plan.benchmark.trust} />
                  <SimpleList title="Conversion layer" items={plan.benchmark.conversion} />
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {tab === "features" ? (
          <section className="px-4 pb-8 pt-6">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
              <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">Must-have now</div>
                <div className="mt-5 space-y-3">
                  {plan.benchmark.core.map((item) => (
                    <div key={item.title} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-base font-semibold text-slate-900">{item.title}</div>
                          <p className="mt-2 text-sm leading-7 text-slate-600">{item.why}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityTone(item.priority)}`}>{item.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-8">
                <Panel title="Later" items={plan.benchmark.later} />
                <Panel title="Avoid in v1" items={plan.benchmark.avoid} />
              </div>
            </div>
          </section>
        ) : null}

        {tab === "architecture" ? (
          <section className="px-4 pb-8 pt-6">
            <div className="mx-auto max-w-6xl rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Recommended architecture</div>
              <p className="mt-2 text-sm leading-6 text-slate-500">The category benchmark shapes the product surface, then Buildly adds a practical shipping structure.</p>
              <div className="mt-6 grid gap-4 md:grid-cols-5">
                {plan.architecture.map((item, index) => (
                  <div key={item} className="relative rounded-2xl border border-slate-200 p-4">
                    <div className="text-sm font-semibold text-slate-900">{item}</div>
                    {index < plan.architecture.length - 1 ? <div className="absolute -right-2 top-1/2 hidden h-0.5 w-4 bg-slate-300 md:block" /> : null}
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-700"><strong className="text-slate-900">Wedge:</strong> {plan.wedge}</div>
            </div>
          </section>
        ) : null}

        {tab === "launch" ? (
          <section className="px-4 pb-12 pt-6">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
              <Panel title="Launch roadmap" items={plan.roadmap} />
              <Panel title="Launch checklist" items={[
                "One homepage promise",
                "One primary workflow",
                "One trust layer from the category benchmark",
                "One conversion layer from the category benchmark",
                "One feedback loop after first users",
              ]} />
            </div>
          </section>
        ) : null}

        <section id="how-it-works" className="bg-[#f4f8f8] px-4 py-24">
          <div className="mx-auto max-w-5xl">
            <SectionHeader title="What Buildly does" subtitle="You choose a domain. Buildly injects the feature DNA of the category leaders, then turns that into a practical MVP structure you can ship." />
            <div className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
              <StepCard step="Step 1" title="Choose a domain" text="Travel, commerce, delivery, SaaS, jobs, real estate or fintech." />
              <StepCard step="Step 2" title="Inject leader patterns" text="Buildly reuses what matters from the biggest products in that category." />
              <StepCard step="Step 3" title="Scope the MVP" text="You get must-have now, trust layer, conversion layer, later and avoid in v1." />
              <StepCard step="Step 4" title="Ship faster" text="Buildly adds wedge, score, architecture and launch structure on top." />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <span className="text-2xl font-bold tracking-tight text-cyan-600">Buildly</span>
          <p className="text-xs text-slate-500">© 2026 Buildly. Generate MVPs with category intelligence.</p>
        </div>
      </footer>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="block text-left">
      <span className="mb-2 block text-lg font-semibold text-slate-900">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-slate-200 bg-[#fbfbfc] px-5 py-4 text-lg text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-200 focus:bg-white" />
    </label>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center">
      <h2 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-slate-950 md:text-5xl">{title}</h2>
      <p className="mx-auto mt-4 max-w-3xl text-xl leading-8 text-slate-500">{subtitle}</p>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="text-2xl font-bold tracking-tight text-slate-950">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{label}</div>
    </div>
  );
}

function SimpleList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">{items.map((item) => <li key={item}>• {item}</li>)}</ul>
    </div>
  );
}

function Panel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <ul className="mt-5 space-y-2 text-sm leading-6 text-slate-600">{items.map((item) => <li key={item}>• {item}</li>)}</ul>
    </div>
  );
}

function StepCard({ step, title, text }: { step: string; title: string; text: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-2xl text-emerald-500">✦</div>
      <div className="mt-5 text-sm font-semibold text-cyan-600">{step}</div>
      <div className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{title}</div>
      <p className="mt-3 text-lg leading-8 text-slate-500">{text}</p>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${active ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-700 hover:bg-slate-100"}`}>
      {label}
    </button>
  );
}
