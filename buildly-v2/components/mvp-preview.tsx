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

export function MvpPreview({ idea, oneLiner, targetUser, coreOutcome, screens }: MvpPreviewProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [activeScreen, setActiveScreen] = useState(0);

  const visibleScreens = useMemo(() => screens.slice(0, 5), [screens]);
  const current = visibleScreens[activeScreen] || visibleScreens[0] || "Core workflow";
  const currentKind = inferScreenKind(current, activeScreen);

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">MVP preview</div>
          <p className="mt-2 text-sm leading-6 text-slate-500">Interactive builder-style preview generated from the MVP pack.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:block">Preview only</div>
          <div className="flex gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1">
            <button onClick={() => setDevice("desktop")} className={`rounded-xl px-3 py-2 text-xs font-semibold ${device === "desktop" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}>Desktop</button>
            <button onClick={() => setDevice("mobile")} className={`rounded-xl px-3 py-2 text-xs font-semibold ${device === "mobile" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}>Mobile</button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <div className="space-y-3">
          {visibleScreens.map((screen, index) => (
            <button
              key={screen}
              onClick={() => setActiveScreen(index)}
              className={`w-full rounded-2xl border px-4 py-4 text-left transition ${activeScreen === index ? "border-cyan-200 bg-cyan-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Screen {index + 1}</div>
                <div className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {inferScreenKind(screen, index)}
                </div>
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-900">{screen}</div>
              <div className="mt-2 text-xs leading-5 text-slate-500">{describeScreen(screen, targetUser, coreOutcome)}</div>
            </button>
          ))}
        </div>

        <div className="rounded-[28px] bg-[linear-gradient(180deg,#0f172a,#111827)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className={`mx-auto overflow-hidden rounded-[26px] border border-white/10 bg-white ${device === "desktop" ? "max-w-5xl" : "max-w-[390px]"}`}>
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-300" />
                <span className="h-3 w-3 rounded-full bg-amber-300" />
                <span className="h-3 w-3 rounded-full bg-emerald-300" />
              </div>
              <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">{idea}</div>
            </div>

            {device === "desktop" ? (
              <DesktopPreview
                idea={idea}
                targetUser={targetUser}
                oneLiner={oneLiner}
                coreOutcome={coreOutcome}
                screens={visibleScreens}
                activeScreen={activeScreen}
                current={current}
                kind={currentKind}
              />
            ) : (
              <MobilePreview
                idea={idea}
                oneLiner={oneLiner}
                targetUser={targetUser}
                coreOutcome={coreOutcome}
                screens={visibleScreens}
                activeScreen={activeScreen}
                current={current}
                kind={currentKind}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function DesktopPreview({
  idea,
  targetUser,
  oneLiner,
  coreOutcome,
  screens,
  activeScreen,
  current,
  kind,
}: {
  idea: string;
  targetUser: string;
  oneLiner: string;
  coreOutcome: string;
  screens: string[];
  activeScreen: number;
  current: string;
  kind: ScreenKind;
}) {
  return (
    <div className="grid min-h-[640px] grid-cols-[240px_1fr]">
      <aside className="border-r border-slate-200 bg-slate-50 p-4">
        <div className="rounded-2xl bg-slate-950 px-4 py-4 text-white shadow-sm">
          <div className="text-xs uppercase tracking-[0.16em] text-cyan-200">Buildly app</div>
          <div className="mt-2 text-base font-semibold">{idea}</div>
          <div className="mt-2 text-xs leading-5 text-slate-300">For {targetUser.toLowerCase()}</div>
        </div>
        <div className="mt-5 space-y-2">
          {screens.map((screen, index) => (
            <div key={screen} className={`rounded-xl px-3 py-3 text-sm transition ${index === activeScreen ? "bg-white font-semibold text-slate-950 shadow-sm" : "text-slate-500"}`}>
              {screen}
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Live signal</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <MiniStat label="Leads" value="24" />
            <MiniStat label="Conv" value="7.2%" />
          </div>
        </div>
      </aside>

      <main className="bg-white p-6">
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Current screen</div>
            <div className="mt-1 text-lg font-semibold text-slate-950">{current}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-700">Generated MVP</span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">{kind}</span>
          </div>
        </div>

        <div className="mt-6">
          <DesktopScreen kind={kind} idea={idea} oneLiner={oneLiner} targetUser={targetUser} coreOutcome={coreOutcome} current={current} />
        </div>
      </main>
    </div>
  );
}

function MobilePreview({
  idea,
  oneLiner,
  targetUser,
  coreOutcome,
  screens,
  activeScreen,
  current,
  kind,
}: {
  idea: string;
  oneLiner: string;
  targetUser: string;
  coreOutcome: string;
  screens: string[];
  activeScreen: number;
  current: string;
  kind: ScreenKind;
}) {
  return (
    <div className="min-h-[720px] bg-slate-100 p-3">
      <div className="mx-auto overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 pb-2 pt-3 text-xs font-semibold text-slate-400">
          <span>9:41</span>
          <span>{idea}</span>
        </div>
        <div className="px-4 pb-4">
          <div className="rounded-[24px] bg-[radial-gradient(circle_at_top_left,rgba(45,197,186,0.16),transparent_35%),linear-gradient(180deg,#f8fcfc,#ffffff)] p-4">
            <div className="inline-flex rounded-full bg-cyan-50 px-3 py-2 text-[11px] font-semibold text-cyan-700">{kind}</div>
            <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{current}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{oneLiner}</p>
          </div>

          <div className="mt-4">
            <MobileScreen kind={kind} targetUser={targetUser} coreOutcome={coreOutcome} current={current} />
          </div>

          <div className="mt-4 grid gap-3">
            {screens.map((screen, index) => (
              <div key={screen} className={`rounded-2xl border px-4 py-4 text-sm ${index === activeScreen ? "border-cyan-200 bg-cyan-50 text-slate-950" : "border-slate-200 bg-white text-slate-500"}`}>
                {screen}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopScreen({ kind, idea, oneLiner, targetUser, coreOutcome, current }: { kind: ScreenKind; idea: string; oneLiner: string; targetUser: string; coreOutcome: string; current: string }) {
  if (kind === "landing") {
    return (
      <div className="space-y-6">
        <div className="rounded-[28px] bg-[radial-gradient(circle_at_top_left,rgba(45,197,186,0.12),transparent_35%),linear-gradient(180deg,#f8fcfc,#ffffff)] p-7">
          <div className="inline-flex rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">Validated angle</div>
          <h3 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-950">{oneLiner}</h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">Built for {targetUser.toLowerCase()}, this MVP focuses on the narrowest outcome that can create activation fast.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Start free</button>
            <button className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700">Book demo</button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Target user" value={targetUser} />
          <MetricCard label="Core outcome" value={coreOutcome} />
          <MetricCard label="Primary screen" value={current} />
        </div>
      </div>
    );
  }

  if (kind === "onboarding") {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="rounded-[28px] border border-slate-200 p-6">
          <div className="text-sm font-semibold text-slate-900">Create your first workspace</div>
          <div className="mt-5 space-y-4">
            <FieldRow label="Company name" value={idea} />
            <FieldRow label="Role" value={targetUser} />
            <FieldRow label="Primary goal" value={coreOutcome} />
            <FieldRow label="Success metric" value="Activation within 7 days" />
          </div>
          <div className="mt-6 flex justify-end">
            <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Continue setup</button>
          </div>
        </div>
        <div className="rounded-[28px] bg-slate-50 p-5">
          <div className="text-sm font-semibold text-slate-900">Why we ask this</div>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <li>• Personalize the workflow for the ICP.</li>
            <li>• Keep the first-run experience focused.</li>
            <li>• Prepare activation analytics from day one.</li>
          </ul>
        </div>
      </div>
    );
  }

  if (kind === "workflow") {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-[28px] border border-slate-200 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Core workflow</div>
              <p className="mt-2 text-sm text-slate-500">Move the user to the first useful outcome as fast as possible.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">Step 2 of 3</span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <StepCard number="01" title="Input" text="Capture just enough data to personalize the result." />
            <StepCard number="02" title="Generate" text="Run the narrow workflow that creates instant value." />
            <StepCard number="03" title="Deliver" text="Show a clear result and next action." />
          </div>
          <div className="mt-6 rounded-2xl bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">Live workspace</div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Input queue</div>
                <div className="mt-3 space-y-2 text-sm text-slate-700">
                  <div className="rounded-xl bg-slate-50 px-3 py-3">Ideal customer profile</div>
                  <div className="rounded-xl bg-slate-50 px-3 py-3">Desired result</div>
                  <div className="rounded-xl bg-slate-50 px-3 py-3">Current workflow pain</div>
                </div>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Generated result</div>
                <div className="mt-3 rounded-xl bg-slate-950 p-4 text-sm leading-6 text-slate-200">First useful result aligned with {coreOutcome.toLowerCase()}.</div>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-[28px] bg-slate-50 p-5">
          <div className="text-sm font-semibold text-slate-900">Side panel</div>
          <div className="mt-4 space-y-4">
            <SidePanelBox title="Activation score" body="78 / 100" />
            <SidePanelBox title="Time to value" body="Under 5 minutes" />
            <SidePanelBox title="Next action" body="Invite first users and track completion." />
          </div>
        </div>
      </div>
    );
  }

  if (kind === "results") {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Completed" value="18" />
          <MetricCard label="Activated" value="11" />
          <MetricCard label="Saved time" value="4.6h" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-[28px] border border-slate-200 p-6">
            <div className="text-sm font-semibold text-slate-900">Result summary</div>
            <div className="mt-4 rounded-2xl bg-slate-50 p-5">
              <div className="text-2xl font-bold tracking-tight text-slate-950">Your first success state is live</div>
              <p className="mt-3 text-sm leading-7 text-slate-600">Users can now reach the core outcome without extra setup friction, which is the strongest possible v1 proof.</p>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <PreviewCard title="What worked" body="Clear messaging and a single focused workflow increased first-run completion." />
              <PreviewCard title="What to improve" body="Reduce optional fields and tighten the feedback loop after the first result." />
            </div>
          </div>
          <div className="rounded-[28px] bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">Checklist</div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              <li>✓ Core flow finished</li>
              <li>✓ Result screen delivered</li>
              <li>✓ Activation tracked</li>
              <li>○ Invite next cohort</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (kind === "analytics") {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Visitors" value="1,240" />
          <MetricCard label="Signups" value="89" />
          <MetricCard label="Activation" value="31%" />
          <MetricCard label="Paid intent" value="12" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-[28px] border border-slate-200 p-6">
            <div className="text-sm font-semibold text-slate-900">Funnel</div>
            <div className="mt-5 space-y-4">
              <FunnelBar label="Landing views" value="1240" width="100%" />
              <FunnelBar label="Started onboarding" value="242" width="72%" />
              <FunnelBar label="Completed workflow" value="89" width="48%" />
              <FunnelBar label="Reached outcome" value="39" width="28%" />
            </div>
          </div>
          <div className="rounded-[28px] bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">Insights</div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              <li>• Best conversion came from the workflow screen.</li>
              <li>• Drop-off is highest during onboarding.</li>
              <li>• The strongest wedge remains the result state.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-slate-200 p-6">
      <div className="text-sm font-semibold text-slate-900">{current}</div>
      <p className="mt-3 text-sm leading-7 text-slate-600">{oneLiner}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <PreviewCard title="Target user" body={targetUser} />
        <PreviewCard title="Core outcome" body={coreOutcome} />
      </div>
    </div>
  );
}

function MobileScreen({ kind, targetUser, coreOutcome, current }: { kind: ScreenKind; targetUser: string; coreOutcome: string; current: string }) {
  if (kind === "onboarding") {
    return (
      <div className="rounded-[24px] bg-white p-4 shadow-sm">
        <div className="space-y-3">
          <MobileField label="Role" value={targetUser} />
          <MobileField label="Goal" value={coreOutcome} />
          <MobileField label="Success metric" value="First useful outcome" />
          <button className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">Continue setup</button>
        </div>
      </div>
    );
  }

  if (kind === "workflow") {
    return (
      <div className="space-y-3">
        <div className="rounded-[24px] bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Workflow</div>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <div className="rounded-2xl bg-slate-50 p-4">Input</div>
            <div className="rounded-2xl bg-slate-950 p-4 text-white">Generate</div>
            <div className="rounded-2xl bg-slate-50 p-4">Deliver</div>
          </div>
        </div>
        <div className="rounded-[24px] bg-white p-4 shadow-sm text-sm leading-6 text-slate-600">This flow is optimized for {coreOutcome.toLowerCase()}.</div>
      </div>
    );
  }

  if (kind === "results") {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <MobileKpi label="Activated" value="11" />
          <MobileKpi label="Saved" value="4.6h" />
        </div>
        <div className="rounded-[24px] bg-white p-4 shadow-sm text-sm leading-6 text-slate-600">Users reached the first success state from {current.toLowerCase()}.</div>
      </div>
    );
  }

  if (kind === "analytics") {
    return (
      <div className="rounded-[24px] bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">Weekly signal</div>
        <div className="mt-4 space-y-3">
          <MiniBar label="Visitors" width="100%" />
          <MiniBar label="Signups" width="68%" />
          <MiniBar label="Activated" width="42%" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">Built for</div>
      <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{targetUser}</div>
      <button className="mt-4 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">Continue</button>
    </div>
  );
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
  if (kind === "onboarding") return `Collect just enough setup data to unlock ${coreOutcome.toLowerCase()}.`;
  if (kind === "workflow") return "Main in-product experience with the first useful outcome.";
  if (kind === "results") return "Success state, summary, and next best action.";
  if (kind === "analytics") return "Signal, activation, and funnel metrics for the founder.";
  return `Product screen for ${targetUser.toLowerCase()}.`;
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className="mt-2 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function PreviewCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{value}</div>
    </div>
  );
}

function StepCard({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-600">{number}</div>
      <div className="mt-2 text-sm font-semibold text-slate-900">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function SidePanelBox({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</div>
      <div className="mt-2 text-sm font-semibold text-slate-900">{body}</div>
    </div>
  );
}

function FunnelBar({ label, value, width }: { label: string; value: string; width: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm text-slate-600">
        <span>{label}</span>
        <span className="font-semibold text-slate-900">{value}</span>
      </div>
      <div className="h-3 rounded-full bg-slate-100">
        <div className="h-3 rounded-full bg-slate-950" style={{ width }} />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function MobileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</div>
      <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">{value}</div>
    </div>
  );
}

function MobileKpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] bg-white p-4 shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</div>
      <div className="mt-2 text-lg font-bold text-slate-950">{value}</div>
    </div>
  );
}

function MiniBar({ label, width }: { label: string; width: string }) {
  return (
    <div>
      <div className="mb-2 text-sm text-slate-600">{label}</div>
      <div className="h-3 rounded-full bg-slate-100">
        <div className="h-3 rounded-full bg-slate-950" style={{ width }} />
      </div>
    </div>
  );
}
