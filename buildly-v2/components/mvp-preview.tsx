"use client";

import { useMemo, useState } from "react";

type MvpPreviewProps = {
  idea: string;
  oneLiner: string;
  targetUser: string;
  coreOutcome: string;
  screens: string[];
};

type ScreenKind = "landing" | "onboarding" | "workflow" | "results" | "analytics" | "generic";

type PreviewBranding = {
  name: string;
  badge: string;
  headlineA: string;
  accentB: string;
  accentC: string;
  closing: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
};

export function MvpPreview({ idea, oneLiner, targetUser, coreOutcome, screens }: MvpPreviewProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [activeScreen, setActiveScreen] = useState(0);

  const visibleScreens = useMemo(() => screens.slice(0, 5), [screens]);
  const current = visibleScreens[activeScreen] || visibleScreens[0] || "Core workflow";
  const currentKind = inferScreenKind(current, activeScreen);
  const branding = useMemo(() => buildBranding(idea, targetUser, coreOutcome, oneLiner), [idea, targetUser, coreOutcome, oneLiner]);

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">MVP preview</div>
          <p className="mt-2 text-sm leading-6 text-slate-500">Builder-style visual result generated from the MVP pack.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:block">Preview only</div>
          <div className="flex gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1">
            <button onClick={() => setDevice("desktop")} className={`rounded-xl px-3 py-2 text-xs font-semibold ${device === "desktop" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}>Desktop</button>
            <button onClick={() => setDevice("mobile")} className={`rounded-xl px-3 py-2 text-xs font-semibold ${device === "mobile" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}>Mobile</button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-3">
          {visibleScreens.map((screen, index) => (
            <button
              key={screen}
              onClick={() => setActiveScreen(index)}
              className={`w-full rounded-2xl border px-4 py-4 text-left transition ${activeScreen === index ? "border-cyan-200 bg-cyan-50 shadow-sm" : "border-slate-200 bg-white hover:bg-slate-50"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Screen {index + 1}</div>
                <div className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{inferScreenKind(screen, index)}</div>
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-900">{screen}</div>
              <div className="mt-2 text-xs leading-5 text-slate-500">{describeScreen(screen, targetUser, coreOutcome)}</div>
            </button>
          ))}
        </div>

        <div className="rounded-[30px] bg-[linear-gradient(180deg,#060b14,#0b1220)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className={`mx-auto overflow-hidden rounded-[28px] border border-white/10 bg-[#070c15] ${device === "desktop" ? "max-w-6xl" : "max-w-[390px]"}`}>
            <div className="flex items-center justify-between border-b border-white/10 bg-[#050912] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-400/80" />
                <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">{branding.name}</div>
            </div>

            {device === "desktop" ? (
              <DesktopPreview branding={branding} targetUser={targetUser} coreOutcome={coreOutcome} screens={visibleScreens} activeScreen={activeScreen} current={current} kind={currentKind} />
            ) : (
              <MobilePreview branding={branding} targetUser={targetUser} coreOutcome={coreOutcome} screens={visibleScreens} activeScreen={activeScreen} current={current} kind={currentKind} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function DesktopPreview({ branding, targetUser, coreOutcome, screens, activeScreen, current, kind }: { branding: PreviewBranding; targetUser: string; coreOutcome: string; screens: string[]; activeScreen: number; current: string; kind: ScreenKind }) {
  if (kind === "landing") {
    return (
      <div className="min-h-[760px] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_30%),linear-gradient(180deg,#030712,#081120_65%,#0a1324)] text-white">
        <div className="flex items-center justify-between border-b border-white/10 px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400 text-base font-bold text-slate-950">⚡</div>
            <div className="text-3xl font-semibold tracking-tight">{branding.name}</div>
          </div>
          <div className="flex items-center gap-8 text-sm text-slate-300">
            <span>Dashboard</span>
            <button className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950">Get started</button>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-8 pb-20 pt-14 text-center">
          <div className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-sm font-medium text-cyan-300">
            ✦ {branding.badge}
          </div>
          <h2 className="mx-auto mt-10 max-w-4xl text-7xl font-bold tracking-[-0.06em] leading-[0.95]">
            <span className="text-slate-100">{branding.headlineA} </span>
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">{branding.accentB}</span>
            <span className="text-slate-100"> </span>
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">{branding.accentC}</span>
            <span className="text-slate-100"> {branding.closing}</span>
          </h2>
          <p className="mx-auto mt-8 max-w-3xl text-2xl leading-10 text-slate-400">{branding.subtitle}</p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <button className="rounded-2xl bg-cyan-400 px-8 py-4 text-xl font-semibold text-slate-950">{branding.primaryCta} →</button>
            <button className="rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-xl font-semibold text-slate-100">{branding.secondaryCta}</button>
          </div>
          <div className="mt-10 flex items-center justify-center gap-10 text-xl text-slate-500">
            <span>✓ Free to start</span>
            <span>✓ No credit card</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-[760px] grid-cols-[250px_1fr] bg-[#081120] text-white">
      <aside className="border-r border-white/10 bg-[#050912] p-5">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400 font-bold text-slate-950">⚡</div>
          <div>
            <div className="text-base font-semibold">{branding.name}</div>
            <div className="text-xs text-slate-400">For {targetUser.toLowerCase()}</div>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          {screens.map((screen, index) => (
            <div key={screen} className={`rounded-2xl px-4 py-3 text-sm transition ${index === activeScreen ? "bg-cyan-400 text-slate-950 font-semibold" : "bg-white/5 text-slate-300"}`}>
              {screen}
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Pipeline</div>
          <div className="mt-4 space-y-3">
            <DarkKpi label="Leads" value="142" />
            <DarkKpi label="Replies" value="31" />
            <DarkKpi label="Won" value="9" />
          </div>
        </div>
      </aside>

      <main className="p-6">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Current screen</div>
            <div className="mt-1 text-xl font-semibold text-white">{current}</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-cyan-300">Generated MVP</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300">{kind}</span>
          </div>
        </div>

        <div className="mt-6">
          <DesktopAppScreen branding={branding} targetUser={targetUser} coreOutcome={coreOutcome} current={current} kind={kind} />
        </div>
      </main>
    </div>
  );
}

function DesktopAppScreen({ branding, targetUser, coreOutcome, current, kind }: { branding: PreviewBranding; targetUser: string; coreOutcome: string; current: string; kind: ScreenKind }) {
  if (kind === "onboarding") {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <div className="text-sm font-semibold text-white">Set up your workspace</div>
          <div className="mt-6 space-y-4">
            <DarkField label="Business name" value={branding.name} />
            <DarkField label="Ideal client" value={targetUser} />
            <DarkField label="Primary outcome" value={coreOutcome} />
            <DarkField label="Offer type" value="AI-assisted service workflow" />
          </div>
          <div className="mt-6 flex justify-end">
            <button className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">Continue</button>
          </div>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-semibold text-white">Why this setup matters</div>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
            <li>• Personalize the outbound engine for your niche.</li>
            <li>• Generate more credible first proposals.</li>
            <li>• Track activation and close-rate from the start.</li>
          </ul>
        </div>
      </div>
    );
  }

  if (kind === "workflow") {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-white">Core workflow</div>
                <p className="mt-2 text-sm text-slate-400">From lead research to proposal draft and follow-up.</p>
              </div>
              <span className="rounded-full bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950">Automated</span>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <DarkStep title="Find leads" text="Score high-quality prospects automatically." />
              <DarkStep title="Write proposals" text="Generate personalized proposals from fit signals." />
              <DarkStep title="Close deals" text="Trigger follow-ups and move opportunities forward." />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-semibold text-white">Lead feed</div>
              <div className="mt-4 space-y-3">
                {['Studio North — website redesign','Acme Interiors — proposal requested','Pixel Foundry — warm inbound lead'].map((item) => <DarkListItem key={item} text={item} />)}
              </div>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-semibold text-white">Generated proposal</div>
              <div className="mt-4 rounded-2xl bg-[#0b1220] p-4 text-sm leading-6 text-slate-300">
                Tailored pitch focused on {coreOutcome.toLowerCase()}, with timeline, scope, and follow-up sequence already prepared.
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-semibold text-white">Weekly snapshot</div>
          <div className="mt-4 space-y-4">
            <DarkKpi label="Qualified leads" value="48" />
            <DarkKpi label="Proposal drafts" value="19" />
            <DarkKpi label="Reply rate" value="24%" />
            <DarkKpi label="Win rate" value="8.9%" />
          </div>
        </div>
      </div>
    );
  }

  if (kind === "results") {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <div className="text-sm font-semibold text-white">Outcome summary</div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <DarkKpi label="Leads found" value="142" />
            <DarkKpi label="Proposals sent" value="56" />
            <DarkKpi label="Deals won" value="9" />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <DarkPanel title="What worked" body="Clear value proposition and fast proposal turnaround increased response quality." />
            <DarkPanel title="What to improve" body="Enrich personalization on mid-fit leads and tighten follow-up timing." />
          </div>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-semibold text-white">Next actions</div>
          <div className="mt-4 space-y-3">
            {['Invite another lead cohort','Refine proposal template','Test new follow-up cadence'].map((item) => <DarkListItem key={item} text={item} />)}
          </div>
        </div>
      </div>
    );
  }

  if (kind === "analytics") {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <DarkKpi label="Visitors" value="3,281" />
          <DarkKpi label="Signups" value="214" />
          <DarkKpi label="Activation" value="34%" />
          <DarkKpi label="Close rate" value="9%" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold text-white">Pipeline funnel</div>
            <div className="mt-5 space-y-4">
              <DarkBar label="Landing visits" value="3281" width="100%" />
              <DarkBar label="Qualified leads" value="214" width="72%" />
              <DarkBar label="Proposal opened" value="98" width="49%" />
              <DarkBar label="Closed won" value="19" width="21%" />
            </div>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-semibold text-white">Insights</div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
              <li>• The hero message drives the highest-quality traffic.</li>
              <li>• Proposal opens are strongest on warm referral leads.</li>
              <li>• Follow-up automation lifts reply rate after day 3.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
      <div className="text-sm font-semibold text-white">{current}</div>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">{branding.subtitle}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <DarkPanel title="Target user" body={targetUser} />
        <DarkPanel title="Core outcome" body={coreOutcome} />
      </div>
    </div>
  );
}

function MobilePreview({ branding, targetUser, coreOutcome, screens, activeScreen, current, kind }: { branding: PreviewBranding; targetUser: string; coreOutcome: string; screens: string[]; activeScreen: number; current: string; kind: ScreenKind }) {
  return (
    <div className="min-h-[760px] bg-[#070c15] p-3">
      <div className="mx-auto overflow-hidden rounded-[30px] border border-white/10 bg-[#081120] shadow-sm">
        <div className="flex items-center justify-between px-4 pb-2 pt-3 text-xs font-semibold text-slate-500">
          <span>9:41</span>
          <span>{branding.name}</span>
        </div>
        <div className="px-4 pb-4">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
            <div className="inline-flex rounded-full bg-cyan-400/10 px-3 py-2 text-[11px] font-semibold text-cyan-300">{kind}</div>
            <h3 className="mt-3 text-3xl font-bold tracking-tight text-white">{current}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">{branding.subtitle}</p>
          </div>

          <div className="mt-4">
            <MobileScreen kind={kind} branding={branding} targetUser={targetUser} coreOutcome={coreOutcome} />
          </div>

          <div className="mt-4 grid gap-3">
            {screens.map((screen, index) => (
              <div key={screen} className={`rounded-2xl border px-4 py-4 text-sm ${index === activeScreen ? "border-cyan-400/30 bg-cyan-400/10 text-white" : "border-white/10 bg-white/5 text-slate-400"}`}>
                {screen}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileScreen({ kind, branding, targetUser, coreOutcome }: { kind: ScreenKind; branding: PreviewBranding; targetUser: string; coreOutcome: string }) {
  if (kind === "landing") {
    return (
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
        <div className="text-4xl font-bold leading-tight tracking-[-0.04em] text-white">
          <span>{branding.headlineA} </span>
          <span className="text-cyan-300">{branding.accentB}</span>
          <span> </span>
          <span className="text-cyan-300">{branding.accentC}</span>
          <span> {branding.closing}</span>
        </div>
        <button className="mt-5 w-full rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950">{branding.primaryCta}</button>
      </div>
    );
  }

  if (kind === "workflow") {
    return (
      <div className="space-y-3">
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold text-white">Workflow</div>
          <div className="mt-3 space-y-2 text-sm">
            <div className="rounded-2xl bg-white/5 p-4 text-slate-300">Lead research</div>
            <div className="rounded-2xl bg-cyan-400 p-4 font-semibold text-slate-950">Proposal generation</div>
            <div className="rounded-2xl bg-white/5 p-4 text-slate-300">Follow-up automation</div>
          </div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-400">Built for {targetUser.toLowerCase()} to {coreOutcome.toLowerCase()}.</div>
      </div>
    );
  }

  if (kind === "analytics") {
    return (
      <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold text-white">Weekly signal</div>
        <div className="mt-4 space-y-3">
          <MiniBarDark label="Visitors" width="100%" />
          <MiniBarDark label="Leads" width="74%" />
          <MiniBarDark label="Won" width="26%" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
      <div className="text-sm font-semibold text-white">Target user</div>
      <div className="mt-3 rounded-2xl bg-white/5 p-4 text-sm text-slate-300">{targetUser}</div>
      <div className="mt-3 rounded-2xl bg-white/5 p-4 text-sm text-slate-300">{coreOutcome}</div>
      <button className="mt-4 w-full rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950">Continue</button>
    </div>
  );
}

function buildBranding(idea: string, targetUser: string, coreOutcome: string, oneLiner: string): PreviewBranding {
  const text = `${idea} ${targetUser} ${coreOutcome} ${oneLiner}`.toLowerCase();
  if (/(proposal|client|lead|agency|designer|freelance|freelancer)/.test(text)) {
    return {
      name: "ProposalPilot",
      badge: "AI-Powered Client Acquisition",
      headlineA: "Find clients.",
      accentB: "Send",
      accentC: "proposals.",
      closing: "Close deals.",
      subtitle: "The AI assistant that finds high-quality leads, writes personalized proposals, and automates follow-ups — so you can focus on designing.",
      primaryCta: "Start finding clients",
      secondaryCta: "See how it works",
    };
  }

  const brand = toBrandName(idea);
  return {
    name: brand,
    badge: "AI-Powered MVP",
    headlineA: firstSentence(oneLiner) || `Launch ${brand}.`,
    accentB: "Generate",
    accentC: "results.",
    closing: "Move faster.",
    subtitle: `${brand} helps ${targetUser.toLowerCase()} ${coreOutcome.toLowerCase()} with a sharper workflow, better activation, and a clearer path to revenue.`,
    primaryCta: "Get started",
    secondaryCta: "See how it works",
  };
}

function toBrandName(idea: string) {
  const words = idea.replace(/[^a-zA-Z0-9 ]/g, " ").split(/\s+/).filter(Boolean).slice(0, 2);
  if (words.length === 0) return "BuildlyPilot";
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join("");
}

function firstSentence(value: string) {
  return value.split(/[.!?]/).map((part) => part.trim()).filter(Boolean)[0] || value;
}

function inferScreenKind(screen: string, index: number): ScreenKind {
  const text = screen.toLowerCase();
  if (text.includes("landing") || text.includes("home")) return "landing";
  if (text.includes("onboarding") || text.includes("signup") || text.includes("qualification")) return "onboarding";
  if (text.includes("workflow") || text.includes("builder") || text.includes("editor") || text.includes("generator")) return "workflow";
  if (text.includes("result") || text.includes("confirmation") || text.includes("summary")) return "results";
  if (text.includes("analytics") || text.includes("dashboard") || text.includes("metrics")) return "analytics";
  if (index === 0) return "landing";
  if (index === 1) return "onboarding";
  if (index === 2) return "workflow";
  if (index === 3) return "results";
  if (index === 4) return "analytics";
  return "generic";
}

function describeScreen(screen: string, targetUser: string, coreOutcome: string) {
  const kind = inferScreenKind(screen, 0);
  if (kind === "landing") return `Hero, proof, and CTA for ${targetUser.toLowerCase()}.`;
  if (kind === "onboarding") return `Collect setup data to unlock ${coreOutcome.toLowerCase()}.`;
  if (kind === "workflow") return "Main in-product experience with clear value delivery.";
  if (kind === "results") return "Success state, summary, and next action.";
  if (kind === "analytics") return "Signal, funnel, and conversion metrics for the founder.";
  return `Product screen for ${targetUser.toLowerCase()}.`;
}

function DarkKpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-2 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}

function DarkPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm font-semibold text-white">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
    </div>
  );
}

function DarkField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">{value}</div>
    </div>
  );
}

function DarkStep({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm font-semibold text-white">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
    </div>
  );
}

function DarkListItem({ text }: { text: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">{text}</div>;
}

function DarkBar({ label, value, width }: { label: string; value: string; width: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm text-slate-400">
        <span>{label}</span>
        <span className="font-semibold text-white">{value}</span>
      </div>
      <div className="h-3 rounded-full bg-white/10">
        <div className="h-3 rounded-full bg-cyan-400" style={{ width }} />
      </div>
    </div>
  );
}

function MiniBarDark({ label, width }: { label: string; width: string }) {
  return (
    <div>
      <div className="mb-2 text-sm text-slate-400">{label}</div>
      <div className="h-3 rounded-full bg-white/10">
        <div className="h-3 rounded-full bg-cyan-400" style={{ width }} />
      </div>
    </div>
  );
}
