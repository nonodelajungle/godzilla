"use client";

import { useState } from "react";
import type { MvpPack, MvpThemeKey } from "../lib/mvp-pack";

type ThemeTokens = {
  shell: string;
  panel: string;
  panelSoft: string;
  accent: string;
  accentText: string;
  light: string;
};

const THEMES: Record<MvpThemeKey, ThemeTokens> = {
  cyan: { shell: "bg-slate-950 text-white", panel: "bg-cyan-400/10 border-cyan-400/20", panelSoft: "bg-slate-900 border-cyan-400/10", accent: "bg-cyan-400 text-slate-950", accentText: "text-cyan-300", light: "bg-cyan-50" },
  violet: { shell: "bg-slate-950 text-white", panel: "bg-violet-400/10 border-violet-400/20", panelSoft: "bg-slate-900 border-violet-400/10", accent: "bg-violet-400 text-slate-950", accentText: "text-violet-300", light: "bg-violet-50" },
  emerald: { shell: "bg-slate-950 text-white", panel: "bg-emerald-400/10 border-emerald-400/20", panelSoft: "bg-slate-900 border-emerald-400/10", accent: "bg-emerald-400 text-slate-950", accentText: "text-emerald-300", light: "bg-emerald-50" },
  amber: { shell: "bg-slate-950 text-white", panel: "bg-amber-300/10 border-amber-300/20", panelSoft: "bg-slate-900 border-amber-300/10", accent: "bg-amber-300 text-slate-950", accentText: "text-amber-200", light: "bg-amber-50" },
  indigo: { shell: "bg-slate-950 text-white", panel: "bg-indigo-400/10 border-indigo-400/20", panelSoft: "bg-slate-900 border-indigo-400/10", accent: "bg-indigo-400 text-slate-950", accentText: "text-indigo-300", light: "bg-indigo-50" },
  rose: { shell: "bg-slate-950 text-white", panel: "bg-rose-400/10 border-rose-400/20", panelSoft: "bg-slate-900 border-rose-400/10", accent: "bg-rose-400 text-slate-950", accentText: "text-rose-300", light: "bg-rose-50" },
};

export function MvpPreview({ pack }: { pack: MvpPack }) {
  const [tab, setTab] = useState<"desktop" | "mobile">("desktop");
  const theme = THEMES[pack.themeKey];

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">MVP preview</div>
          <p className="mt-2 text-sm leading-6 text-slate-500">Generated from a business-specific product family and feature matrix.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">{humanize(pack.productFamily)}</span>
          <div className="flex gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1">
            <button onClick={() => setTab("desktop")} className={`rounded-xl px-3 py-2 text-xs font-semibold ${tab === "desktop" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}>Desktop</button>
            <button onClick={() => setTab("mobile")} className={`rounded-xl px-3 py-2 text-xs font-semibold ${tab === "mobile" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}>Mobile</button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <ListPanel title="Pages" items={pack.screens} />
          <ListPanel title="UI primitives" items={pack.pagePrimitives} />
          <ListPanel title="Trust signals" items={pack.trustSignals} />
          <ListPanel title="Retention loop" items={pack.retentionLoop} />
          <ListPanel title="Ops / admin" items={pack.opsSurface} />
        </div>

        <div className={`rounded-[28px] border p-4 ${theme.shell}`}>
          {tab === "desktop" ? (
            <div className="grid min-h-[760px] grid-cols-[240px_1fr] gap-4">
              <aside className={`rounded-[24px] border p-4 ${theme.panel}`}>
                <div className="text-sm font-semibold">{humanize(pack.productFamily)}</div>
                <div className={`mt-2 text-xs ${theme.accentText}`}>{humanize(pack.designLanguage)}</div>
                <div className="mt-5 space-y-2">
                  {pack.appNavigation.map((item) => (
                    <div key={item} className={`rounded-2xl border px-4 py-3 text-sm ${theme.panelSoft}`}>{item}</div>
                  ))}
                </div>
              </aside>

              <main className="space-y-4">
                <div className={`rounded-[24px] border p-6 ${theme.panel}`}>
                  <div className={`inline-flex rounded-full px-3 py-2 text-xs font-semibold ${theme.accent}`}>{pack.branding.badge}</div>
                  <h3 className="mt-4 text-4xl font-bold tracking-tight">{pack.branding.headlineA}</h3>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{pack.branding.subtitle}</p>
                  <div className="mt-5 flex gap-3">
                    <button className={`rounded-2xl px-5 py-3 text-sm font-semibold ${theme.accent}`}>{pack.branding.primaryCta}</button>
                    <button className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold">{pack.branding.secondaryCta}</button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {pack.pagePrimitives.slice(0, 3).map((item) => (
                    <div key={item} className={`rounded-[24px] border p-5 ${theme.panel}`}>
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Primitive</div>
                      <div className="mt-3 text-sm leading-6">{humanize(item)}</div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className={`rounded-[24px] border p-5 ${theme.panel}`}>
                    <div className="text-sm font-semibold">Trust and conversion</div>
                    <div className="mt-4 space-y-2">{pack.trustSignals.slice(0, 5).map((item) => <Pill key={item} text={item} className={theme.panelSoft} />)}</div>
                  </div>
                  <div className={`rounded-[24px] border p-5 ${theme.panel}`}>
                    <div className="text-sm font-semibold">Retention and operations</div>
                    <div className="mt-4 space-y-2">{[...pack.retentionLoop.slice(0, 3), ...pack.opsSurface.slice(0, 2)].map((item) => <Pill key={item} text={item} className={theme.panelSoft} />)}</div>
                  </div>
                </div>
              </main>
            </div>
          ) : (
            <div className="min-h-[720px] space-y-4">
              <div className={`rounded-[24px] border p-5 ${theme.panel}`}>
                <div className={`inline-flex rounded-full px-3 py-2 text-[11px] font-semibold ${theme.accent}`}>{humanize(pack.productFamily)}</div>
                <div className="mt-4 text-3xl font-bold tracking-tight">{pack.branding.name}</div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{pack.productOneLiner}</p>
              </div>
              <div className="grid gap-3">
                {pack.appNavigation.slice(0, 5).map((item) => <Pill key={item} text={item} className={theme.panelSoft} />)}
              </div>
              <div className="grid gap-3">
                {pack.pagePrimitives.slice(0, 4).map((item) => <Pill key={item} text={item} className={theme.panelSoft} />)}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`mt-6 rounded-[24px] border p-6 ${theme.light}`}>
        <div className="text-sm font-semibold text-slate-900">Product family summary</div>
        <p className="mt-3 text-sm leading-7 text-slate-600">{pack.buildPrompt.split("\n").slice(0, 6).join(" ")}</p>
      </div>
    </section>
  );
}

function ListPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[24px] border border-slate-200 p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</div>
      <div className="mt-4 space-y-2">
        {items.map((item) => <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">{humanize(item)}</div>)}
      </div>
    </div>
  );
}

function Pill({ text, className }: { text: string; className: string }) {
  return <div className={`rounded-2xl border px-4 py-3 text-sm ${className}`}>{humanize(text)}</div>;
}

function humanize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}
