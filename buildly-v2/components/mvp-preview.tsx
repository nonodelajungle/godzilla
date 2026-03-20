"use client";

import { useMemo, useState } from "react";

type MvpPreviewProps = {
  idea: string;
  oneLiner: string;
  targetUser: string;
  coreOutcome: string;
  screens: string[];
};

export function MvpPreview({ idea, oneLiner, targetUser, coreOutcome, screens }: MvpPreviewProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [activeScreen, setActiveScreen] = useState(0);

  const visibleScreens = useMemo(() => screens.slice(0, 5), [screens]);
  const current = visibleScreens[activeScreen] || visibleScreens[0] || "Core workflow";

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">MVP preview</div>
          <p className="mt-2 text-sm leading-6 text-slate-500">Visual preview generated from the MVP pack, inspired by builder-style previews.</p>
        </div>
        <div className="flex gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1">
          <button onClick={() => setDevice("desktop")} className={`rounded-xl px-3 py-2 text-xs font-semibold ${device === "desktop" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}>Desktop</button>
          <button onClick={() => setDevice("mobile")} className={`rounded-xl px-3 py-2 text-xs font-semibold ${device === "mobile" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}>Mobile</button>
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
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Screen {index + 1}</div>
              <div className="mt-2 text-sm font-semibold text-slate-900">{screen}</div>
            </button>
          ))}
        </div>

        <div className="rounded-[28px] bg-[linear-gradient(180deg,#0f172a,#111827)] p-4">
          <div className={`mx-auto overflow-hidden rounded-[26px] border border-white/10 bg-white ${device === "desktop" ? "max-w-4xl" : "max-w-[390px]"}`}>
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-300" />
                <span className="h-3 w-3 rounded-full bg-amber-300" />
                <span className="h-3 w-3 rounded-full bg-emerald-300" />
              </div>
              <div className="text-xs font-medium text-slate-500">{idea}</div>
            </div>

            {device === "desktop" ? (
              <div className="grid min-h-[560px] grid-cols-[220px_1fr]">
                <aside className="border-r border-slate-200 bg-slate-50 p-4">
                  <div className="rounded-2xl bg-slate-950 px-4 py-4 text-white">
                    <div className="text-xs uppercase tracking-[0.16em] text-cyan-200">Buildly preview</div>
                    <div className="mt-2 text-base font-semibold">{idea}</div>
                    <div className="mt-2 text-xs leading-5 text-slate-300">For {targetUser.toLowerCase()}</div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {visibleScreens.map((screen, index) => (
                      <div key={screen} className={`rounded-xl px-3 py-3 text-sm ${index === activeScreen ? "bg-white font-semibold text-slate-950 shadow-sm" : "text-slate-500"}`}>
                        {screen}
                      </div>
                    ))}
                  </div>
                </aside>

                <main className="p-6">
                  <div className="rounded-[24px] bg-[radial-gradient(circle_at_top_left,rgba(45,197,186,0.14),transparent_35%),linear-gradient(180deg,#f8fcfc,#ffffff)] p-6">
                    <div className="inline-flex rounded-full bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-700">Generated MVP</div>
                    <h3 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{current}</h3>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{oneLiner}</p>
                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      <PreviewMetric label="Target user" value={targetUser} />
                      <PreviewMetric label="Outcome" value={coreOutcome} />
                      <PreviewMetric label="Current view" value={current} />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <PreviewCard title="Primary action" body={`This screen helps ${targetUser.toLowerCase()} move toward: ${coreOutcome.toLowerCase()}.`} />
                    <PreviewCard title="Suggested CTA" body={`Continue to ${current.toLowerCase()} and complete the first useful workflow.`} />
                    <PreviewCard title="Founder insight" body="Track activation, time-to-value, and completion rate on this step." />
                    <PreviewCard title="Validation link" body="Keep the winning angle from your landing page visible in the interface copy." />
                  </div>
                </main>
              </div>
            ) : (
              <div className="min-h-[640px] bg-slate-50 p-3">
                <div className="rounded-[28px] bg-white p-4 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-600">Mobile MVP</div>
                  <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{current}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{oneLiner}</p>
                  <div className="mt-5 space-y-3">
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{targetUser}</div>
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{coreOutcome}</div>
                    <button className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">Continue</button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  {visibleScreens.map((screen, index) => (
                    <div key={screen} className={`rounded-2xl border px-4 py-4 text-sm ${index === activeScreen ? "border-cyan-200 bg-cyan-50 text-slate-950" : "border-slate-200 bg-white text-slate-500"}`}>
                      {screen}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className="mt-2 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function PreviewCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}
