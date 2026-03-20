"use client";

import { useMemo, useState } from "react";
import type { MvpArchetype, MvpPack, MvpThemeKey } from "../lib/mvp-pack";

type MvpPreviewProps = {
  pack: MvpPack;
};

type ScreenKind = "landing" | "onboarding" | "workflow" | "results" | "analytics" | "generic";

type ThemeTokens = {
  accentText: string;
  accentGradient: string;
  accentSoft: string;
  accentButton: string;
  accentButtonText: string;
  accentBorder: string;
  lightIconBg: string;
  frameBg: string;
  frameInnerBg: string;
  browserBarBg: string;
  browserChipBg: string;
  shellBg: string;
  sidebarBg: string;
  panelBg: string;
  panelMutedBg: string;
  lightSectionBg: string;
  footerBg: string;
  mobileShellBg: string;
  lightFeatureBorder: string;
};

const THEMES: Record<MvpThemeKey, ThemeTokens> = {
  cyan: {
    accentText: "text-cyan-300",
    accentGradient: "bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent",
    accentSoft: "bg-cyan-400/12 text-cyan-300",
    accentButton: "bg-cyan-400 hover:bg-cyan-300",
    accentButtonText: "text-slate-950",
    accentBorder: "border-cyan-400/25",
    lightIconBg: "bg-cyan-50 text-cyan-500",
    frameBg: "bg-[linear-gradient(180deg,#06131a,#0a2630)]",
    frameInnerBg: "bg-[#071821]",
    browserBarBg: "bg-[#07131c]",
    browserChipBg: "bg-cyan-400/8 text-cyan-200 border-cyan-400/15",
    shellBg: "bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_28%),linear-gradient(180deg,#071821,#0a2230_62%,#0d3040)]",
    sidebarBg: "bg-[#06131b]",
    panelBg: "bg-cyan-400/7 border-cyan-400/14",
    panelMutedBg: "bg-[#0a1a22] border-cyan-400/10",
    lightSectionBg: "bg-[#f2fbfb]",
    footerBg: "bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.10),transparent_24%),linear-gradient(180deg,#041018,#08202a_68%,#0b2a36)]",
    mobileShellBg: "bg-[linear-gradient(180deg,#071821,#0b2a36)]",
    lightFeatureBorder: "border-cyan-100",
  },
  violet: {
    accentText: "text-violet-300",
    accentGradient: "bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent",
    accentSoft: "bg-violet-400/12 text-violet-300",
    accentButton: "bg-violet-400 hover:bg-violet-300",
    accentButtonText: "text-slate-950",
    accentBorder: "border-violet-400/25",
    lightIconBg: "bg-violet-50 text-violet-500",
    frameBg: "bg-[linear-gradient(180deg,#12081c,#221234)]",
    frameInnerBg: "bg-[#11081b]",
    browserBarBg: "bg-[#0f0718]",
    browserChipBg: "bg-violet-400/8 text-violet-200 border-violet-400/15",
    shellBg: "bg-[radial-gradient(circle_at_top_left,rgba(167,139,250,0.14),transparent_28%),linear-gradient(180deg,#11081b,#1d1230_62%,#291746)]",
    sidebarBg: "bg-[#0f0718]",
    panelBg: "bg-violet-400/7 border-violet-400/14",
    panelMutedBg: "bg-[#180d26] border-violet-400/10",
    lightSectionBg: "bg-[#faf5ff]",
    footerBg: "bg-[radial-gradient(circle_at_center,rgba(167,139,250,0.10),transparent_24%),linear-gradient(180deg,#12081c,#1e1230_68%,#2d1848)]",
    mobileShellBg: "bg-[linear-gradient(180deg,#11081b,#26143a)]",
    lightFeatureBorder: "border-violet-100",
  },
  emerald: {
    accentText: "text-emerald-300",
    accentGradient: "bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent",
    accentSoft: "bg-emerald-400/12 text-emerald-300",
    accentButton: "bg-emerald-400 hover:bg-emerald-300",
    accentButtonText: "text-slate-950",
    accentBorder: "border-emerald-400/25",
    lightIconBg: "bg-emerald-50 text-emerald-500",
    frameBg: "bg-[linear-gradient(180deg,#06160f,#0d281d)]",
    frameInnerBg: "bg-[#071510]",
    browserBarBg: "bg-[#07120d]",
    browserChipBg: "bg-emerald-400/8 text-emerald-200 border-emerald-400/15",
    shellBg: "bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.14),transparent_28%),linear-gradient(180deg,#071510,#0f241b_62%,#143227)]",
    sidebarBg: "bg-[#06120d]",
    panelBg: "bg-emerald-400/7 border-emerald-400/14",
    panelMutedBg: "bg-[#0c1a14] border-emerald-400/10",
    lightSectionBg: "bg-[#f2fbf6]",
    footerBg: "bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.10),transparent_24%),linear-gradient(180deg,#071510,#0f241b_68%,#163328)]",
    mobileShellBg: "bg-[linear-gradient(180deg,#071510,#143227)]",
    lightFeatureBorder: "border-emerald-100",
  },
  amber: {
    accentText: "text-amber-300",
    accentGradient: "bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent",
    accentSoft: "bg-amber-400/12 text-amber-300",
    accentButton: "bg-amber-300 hover:bg-amber-200",
    accentButtonText: "text-slate-950",
    accentBorder: "border-amber-400/25",
    lightIconBg: "bg-amber-50 text-amber-500",
    frameBg: "bg-[linear-gradient(180deg,#1a1106,#2f1d0c)]",
    frameInnerBg: "bg-[#1a1006]",
    browserBarBg: "bg-[#140b03]",
    browserChipBg: "bg-amber-400/8 text-amber-200 border-amber-400/15",
    shellBg: "bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_28%),linear-gradient(180deg,#1a1006,#2b1908_62%,#3b210b)]",
    sidebarBg: "bg-[#140b03]",
    panelBg: "bg-amber-400/7 border-amber-400/14",
    panelMutedBg: "bg-[#201307] border-amber-400/10",
    lightSectionBg: "bg-[#fffbf2]",
    footerBg: "bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.10),transparent_24%),linear-gradient(180deg,#1a1006,#2a1808_68%,#3d230d)]",
    mobileShellBg: "bg-[linear-gradient(180deg,#1a1006,#3a220d)]",
    lightFeatureBorder: "border-amber-100",
  },
  indigo: {
    accentText: "text-indigo-300",
    accentGradient: "bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent",
    accentSoft: "bg-indigo-400/12 text-indigo-300",
    accentButton: "bg-indigo-400 hover:bg-indigo-300",
    accentButtonText: "text-slate-950",
    accentBorder: "border-indigo-400/25",
    lightIconBg: "bg-indigo-50 text-indigo-500",
    frameBg: "bg-[linear-gradient(180deg,#08111d,#13233d)]",
    frameInnerBg: "bg-[#08101a]",
    browserBarBg: "bg-[#070d16]",
    browserChipBg: "bg-indigo-400/8 text-indigo-200 border-indigo-400/15",
    shellBg: "bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.14),transparent_28%),linear-gradient(180deg,#08101a,#11203a_62%,#182b4d)]",
    sidebarBg: "bg-[#070d16]",
    panelBg: "bg-indigo-400/7 border-indigo-400/14",
    panelMutedBg: "bg-[#0d1727] border-indigo-400/10",
    lightSectionBg: "bg-[#f5f7ff]",
    footerBg: "bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.10),transparent_24%),linear-gradient(180deg,#08101a,#11203a_68%,#1a2e51)]",
    mobileShellBg: "bg-[linear-gradient(180deg,#08101a,#1a2e51)]",
    lightFeatureBorder: "border-indigo-100",
  },
  rose: {
    accentText: "text-rose-300",
    accentGradient: "bg-gradient-to-r from-rose-400 to-fuchsia-400 bg-clip-text text-transparent",
    accentSoft: "bg-rose-400/12 text-rose-300",
    accentButton: "bg-rose-400 hover:bg-rose-300",
    accentButtonText: "text-slate-950",
    accentBorder: "border-rose-400/25",
    lightIconBg: "bg-rose-50 text-rose-500",
    frameBg: "bg-[linear-gradient(180deg,#190810,#2e1022)]",
    frameInnerBg: "bg-[#16070e]",
    browserBarBg: "bg-[#12050b]",
    browserChipBg: "bg-rose-400/8 text-rose-200 border-rose-400/15",
    shellBg: "bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.14),transparent_28%),linear-gradient(180deg,#16070e,#260d1d_62%,#37152a)]",
    sidebarBg: "bg-[#12050b]",
    panelBg: "bg-rose-400/7 border-rose-400/14",
    panelMutedBg: "bg-[#1c0b14] border-rose-400/10",
    lightSectionBg: "bg-[#fff4f7]",
    footerBg: "bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.10),transparent_24%),linear-gradient(180deg,#16070e,#260d1d_68%,#38142a)]",
    mobileShellBg: "bg-[linear-gradient(180deg,#16070e,#38142a)]",
    lightFeatureBorder: "border-rose-100",
  },
};

export function MvpPreview({ pack }: MvpPreviewProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [activeScreen, setActiveScreen] = useState(0);

  const theme = THEMES[pack.themeKey];
  const visibleScreens = useMemo(() => pack.screens.slice(0, 5), [pack.screens]);
  const current = visibleScreens[activeScreen] || visibleScreens[0] || "Main workflow";
  const currentKind = inferScreenKind(current, activeScreen);

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">MVP preview</div>
          <p className="mt-2 text-sm leading-6 text-slate-500">Adaptive visual result generated from the detected project archetype.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:block">{pack.archetype.replace(/_/g, " ")}</div>
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
              className={`w-full rounded-2xl border px-4 py-4 text-left transition ${activeScreen === index ? "border-slate-300 bg-slate-50 shadow-sm" : "border-slate-200 bg-white hover:bg-slate-50"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Screen {index + 1}</div>
                <div className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{inferScreenKind(screen, index)}</div>
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-900">{screen}</div>
              <div className="mt-2 text-xs leading-5 text-slate-500">{describeScreen(screen, pack.targetUser, pack.coreOutcome)}</div>
            </button>
          ))}
        </div>

        <div className={`rounded-[30px] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] ${theme.frameBg}`}>
          <div className={`mx-auto overflow-hidden rounded-[28px] border border-white/10 ${theme.frameInnerBg} ${device === "desktop" ? "max-w-6xl" : "max-w-[390px]"}`}>
            <div className={`flex items-center justify-between border-b border-white/10 px-4 py-3 ${theme.browserBarBg}`}>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-400/80" />
                <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
              </div>
              <div className={`rounded-full border px-3 py-1 text-xs font-medium ${theme.browserChipBg}`}>{pack.branding.name}</div>
            </div>

            {device === "desktop" ? (
              <DesktopPreview pack={pack} theme={theme} current={current} currentKind={currentKind} activeScreen={activeScreen} />
            ) : (
              <MobilePreview pack={pack} theme={theme} current={current} currentKind={currentKind} activeScreen={activeScreen} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function DesktopPreview({ pack, theme, current, currentKind, activeScreen }: { pack: MvpPack; theme: ThemeTokens; current: string; currentKind: ScreenKind; activeScreen: number }) {
  if (currentKind === "landing") {
    return <AdaptiveLanding pack={pack} theme={theme} />;
  }

  const stats = getSidebarStats(pack.archetype);

  return (
    <div className={`grid min-h-[820px] grid-cols-[250px_1fr] text-white ${theme.shellBg}`}>
      <aside className={`border-r border-white/10 p-5 ${theme.sidebarBg}`}>
        <div className={`flex items-center gap-3 rounded-2xl border p-4 ${theme.panelBg}`}>
          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${theme.accentButton} font-bold ${theme.accentButtonText}`}>✦</div>
          <div>
            <div className="text-base font-semibold">{pack.branding.name}</div>
            <div className="text-xs text-slate-400">{pack.archetype.replace(/_/g, " ")}</div>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          {pack.appNavigation.slice(0, 5).map((item, index) => (
            <div key={item} className={`rounded-2xl px-4 py-3 text-sm transition ${index === activeScreen ? `${theme.accentButton} ${theme.accentButtonText} font-semibold` : `${theme.panelMutedBg} text-slate-300 border`} border-white/10`}>
              {item}
            </div>
          ))}
        </div>

        <div className={`mt-6 rounded-2xl border p-4 ${theme.panelBg}`}>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Live signal</div>
          <div className="mt-4 space-y-3">
            {stats.map((stat) => <DarkKpi key={stat.label} label={stat.label} value={stat.value} panelClass={theme.panelMutedBg} />)}
          </div>
        </div>
      </aside>

      <main className="p-6">
        <div className={`flex items-center justify-between rounded-2xl border px-5 py-4 ${theme.panelBg}`}>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Current screen</div>
            <div className="mt-1 text-xl font-semibold text-white">{current}</div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`rounded-full border px-3 py-2 text-xs font-semibold ${theme.accentSoft} ${theme.accentBorder}`}>Theme · {pack.themeKey}</span>
            <span className={`rounded-full border px-3 py-2 text-xs font-semibold text-slate-300 ${theme.panelMutedBg}`}>{pack.archetype}</span>
          </div>
        </div>

        <div className="mt-6">
          {currentKind === "onboarding" ? (
            <OnboardingScreen pack={pack} theme={theme} />
          ) : currentKind === "workflow" ? (
            <WorkflowScreen pack={pack} theme={theme} />
          ) : currentKind === "results" ? (
            <ResultsScreen pack={pack} theme={theme} />
          ) : currentKind === "analytics" ? (
            <AnalyticsScreen pack={pack} theme={theme} />
          ) : (
            <GenericScreen pack={pack} theme={theme} />
          )}
        </div>
      </main>
    </div>
  );
}

function AdaptiveLanding({ pack, theme }: { pack: MvpPack; theme: ThemeTokens }) {
  return (
    <div className="min-h-[1450px] overflow-hidden bg-white">
      <section className={`text-white ${theme.shellBg}`}>
        <div className="flex items-center justify-between border-b border-white/10 px-8 py-5">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${theme.accentButton} text-base font-bold ${theme.accentButtonText}`}>✦</div>
            <div className="text-3xl font-semibold tracking-tight">{pack.branding.name}</div>
          </div>
          <div className="flex items-center gap-8 text-sm text-slate-300">
            <span>{pack.appNavigation[0] || "Overview"}</span>
            <button className={`rounded-2xl px-5 py-3 font-semibold ${theme.accentButton} ${theme.accentButtonText}`}>{pack.branding.primaryCta}</button>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-8 pb-24 pt-16 text-center">
          <div className={`inline-flex items-center rounded-full border px-5 py-2 text-sm font-medium ${theme.accentSoft} ${theme.accentBorder}`}>
            ✦ {pack.branding.badge}
          </div>
          <h2 className="mx-auto mt-10 max-w-4xl text-7xl font-bold tracking-[-0.06em] leading-[0.95]">
            <span className="text-slate-100">{pack.branding.headlineA} </span>
            <span className={theme.accentGradient}>{pack.branding.accentB}</span>
            <span className="text-slate-100"> </span>
            <span className={theme.accentGradient}>{pack.branding.accentC}</span>
            <span className="text-slate-100"> {pack.branding.closing}</span>
          </h2>
          <p className="mx-auto mt-8 max-w-3xl text-2xl leading-10 text-slate-300">{pack.branding.subtitle}</p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <button className={`rounded-2xl px-8 py-4 text-xl font-semibold ${theme.accentButton} ${theme.accentButtonText}`}>{pack.branding.primaryCta} →</button>
            <button className="rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-xl font-semibold text-slate-100">{pack.branding.secondaryCta}</button>
          </div>
          <div className="mt-10 flex items-center justify-center gap-10 text-xl text-slate-400">
            <span>✓ Archetype aware</span>
            <span>✓ Distinct theme</span>
            <span>✓ MVP-ready</span>
          </div>
        </div>
      </section>

      <section className={`px-8 py-20 text-slate-900 ${theme.lightSectionBg}`}>
        <div className="mx-auto max-w-6xl text-center">
          <h3 className="text-6xl font-bold tracking-[-0.05em]">
            <span>{pack.branding.featuresTitle} </span>
            <span className={theme.accentGradient}>{pack.branding.featuresAccent}</span>
          </h3>
          <p className="mx-auto mt-6 max-w-3xl text-2xl leading-10 text-slate-500">{pack.branding.featuresSubtitle}</p>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {pack.branding.features.map((feature) => (
              <div key={feature.title} className={`rounded-[28px] border bg-white p-8 text-left shadow-sm ${theme.lightFeatureBorder}`}>
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${theme.lightIconBg}`}>{feature.icon}</div>
                <div className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">{feature.title}</div>
                <p className="mt-4 text-xl leading-9 text-slate-500">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`px-8 py-24 text-white ${theme.footerBg}`}>
        <div className="mx-auto max-w-5xl text-center">
          <h3 className="text-6xl font-bold tracking-[-0.05em]">{pack.branding.footerTitle}</h3>
          <p className="mx-auto mt-8 max-w-3xl text-2xl leading-10 text-slate-300">{pack.branding.footerSubtitle}</p>
          <button className={`mt-10 rounded-2xl px-8 py-4 text-2xl font-semibold ${theme.accentButton} ${theme.accentButtonText}`}>{pack.branding.footerCta} →</button>
          <div className="mt-16 text-lg text-slate-400">{pack.branding.footerNote}</div>
        </div>
      </section>
    </div>
  );
}

function OnboardingScreen({ pack, theme }: { pack: MvpPack; theme: ThemeTokens }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className={`rounded-[28px] border p-6 ${theme.panelBg}`}>
        <div className="text-sm font-semibold text-white">Set up your workspace</div>
        <div className="mt-6 space-y-4">
          <DarkField label="Brand" value={pack.branding.name} panelClass={theme.panelMutedBg} />
          <DarkField label="Target user" value={pack.targetUser} panelClass={theme.panelMutedBg} />
          <DarkField label="Core outcome" value={pack.coreOutcome} panelClass={theme.panelMutedBg} />
          <DarkField label="Primary workflow" value={pack.screens[2] || "Main workflow"} panelClass={theme.panelMutedBg} />
        </div>
        <div className="mt-6 flex justify-end">
          <button className={`rounded-2xl px-5 py-3 text-sm font-semibold ${theme.accentButton} ${theme.accentButtonText}`}>Continue</button>
        </div>
      </div>
      <div className={`rounded-[28px] border p-5 ${theme.panelBg}`}>
        <div className="text-sm font-semibold text-white">Why this setup matters</div>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
          <li>• Adapts the product language to the ICP.</li>
          <li>• Keeps the first-run flow focused on activation.</li>
          <li>• Shapes analytics around the right success state.</li>
        </ul>
      </div>
    </div>
  );
}

function WorkflowScreen({ pack, theme }: { pack: MvpPack; theme: ThemeTokens }) {
  const workflow = getWorkflowBlocks(pack.archetype, pack.coreOutcome);
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div className={`rounded-[28px] border p-6 ${theme.panelBg}`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-white">Core workflow</div>
              <p className="mt-2 text-sm text-slate-300">Generated specifically for the {pack.archetype.replace(/_/g, " ")} archetype.</p>
            </div>
            <span className={`rounded-full px-3 py-2 text-xs font-semibold ${theme.accentButton} ${theme.accentButtonText}`}>Adaptive</span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {pack.branding.features.slice(0, 3).map((feature) => (
              <DarkStep key={feature.title} title={feature.title} text={feature.body} panelClass={theme.panelMutedBg} />
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className={`rounded-[28px] border p-5 ${theme.panelBg}`}>
            <div className="text-sm font-semibold text-white">{workflow.leftTitle}</div>
            <div className="mt-4 space-y-3">
              {workflow.items.map((item) => <DarkListItem key={item} text={item} panelClass={theme.panelMutedBg} />)}
            </div>
          </div>
          <div className={`rounded-[28px] border p-5 ${theme.panelBg}`}>
            <div className="text-sm font-semibold text-white">{workflow.rightTitle}</div>
            <div className={`mt-4 rounded-2xl border p-4 text-sm leading-6 text-slate-200 ${theme.panelMutedBg}`}>{workflow.result}</div>
          </div>
        </div>
      </div>
      <div className={`rounded-[28px] border p-5 ${theme.panelBg}`}>
        <div className="text-sm font-semibold text-white">Navigation</div>
        <div className="mt-4 space-y-3">
          {pack.appNavigation.map((item) => <DarkListItem key={item} text={item} panelClass={theme.panelMutedBg} />)}
        </div>
      </div>
    </div>
  );
}

function ResultsScreen({ pack, theme }: { pack: MvpPack; theme: ThemeTokens }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className={`rounded-[28px] border p-6 ${theme.panelBg}`}>
        <div className="text-sm font-semibold text-white">Outcome summary</div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {getSidebarStats(pack.archetype).map((stat) => <DarkKpi key={stat.label} label={stat.label} value={stat.value} panelClass={theme.panelMutedBg} />)}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <DarkPanel title="What works" body={`The ${pack.branding.name} flow is aligned with the ${pack.archetype.replace(/_/g, " ")} archetype and keeps the core outcome visible.`} panelClass={theme.panelMutedBg} />
          <DarkPanel title="What to improve" body="Tighten copy, reduce optional friction, and reinforce the strongest success signal after the first result." panelClass={theme.panelMutedBg} />
        </div>
      </div>
      <div className={`rounded-[28px] border p-5 ${theme.panelBg}`}>
        <div className="text-sm font-semibold text-white">Next actions</div>
        <div className="mt-4 space-y-3">
          <DarkListItem text={`Ship ${pack.screens[2] || "the main workflow"}`} panelClass={theme.panelMutedBg} />
          <DarkListItem text={`Track ${pack.appNavigation[3] || "analytics"}`} panelClass={theme.panelMutedBg} />
          <DarkListItem text={`Refine ${pack.branding.primaryCta.toLowerCase()}`} panelClass={theme.panelMutedBg} />
        </div>
      </div>
    </div>
  );
}

function AnalyticsScreen({ pack, theme }: { pack: MvpPack; theme: ThemeTokens }) {
  const labels = getAnalyticsLabels(pack.archetype);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {labels.map((item) => <DarkKpi key={item.label} label={item.label} value={item.value} panelClass={theme.panelMutedBg} />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className={`rounded-[28px] border p-6 ${theme.panelBg}`}>
          <div className="text-sm font-semibold text-white">Funnel</div>
          <div className="mt-5 space-y-4">
            <DarkBar label={labels[0].label} value={labels[0].value} width="100%" colorClass={theme.accentButton} />
            <DarkBar label={labels[1].label} value={labels[1].value} width="72%" colorClass={theme.accentButton} />
            <DarkBar label={labels[2].label} value={labels[2].value} width="49%" colorClass={theme.accentButton} />
            <DarkBar label={labels[3].label} value={labels[3].value} width="24%" colorClass={theme.accentButton} />
          </div>
        </div>
        <div className={`rounded-[28px] border p-5 ${theme.panelBg}`}>
          <div className="text-sm font-semibold text-white">Insights</div>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
            <li>• Theme and copy align with the detected project type.</li>
            <li>• The strongest conversion step is usually the focused workflow screen.</li>
            <li>• The archetype-specific navigation clarifies the product promise faster.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function GenericScreen({ pack, theme }: { pack: MvpPack; theme: ThemeTokens }) {
  return (
    <div className={`rounded-[28px] border p-6 ${theme.panelBg}`}>
      <div className="text-sm font-semibold text-white">{pack.branding.name}</div>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{pack.branding.subtitle}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <DarkPanel title="Target user" body={pack.targetUser} panelClass={theme.panelMutedBg} />
        <DarkPanel title="Core outcome" body={pack.coreOutcome} panelClass={theme.panelMutedBg} />
      </div>
    </div>
  );
}

function MobilePreview({ pack, theme, current, currentKind, activeScreen }: { pack: MvpPack; theme: ThemeTokens; current: string; currentKind: ScreenKind; activeScreen: number }) {
  if (currentKind === "landing") {
    return (
      <div className="min-h-[980px] bg-white">
        <section className={`px-4 pb-12 pt-4 text-white ${theme.shellBg}`}>
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${theme.accentButton} font-bold ${theme.accentButtonText}`}>✦</div>
              <div className="text-2xl font-semibold tracking-tight">{pack.branding.name}</div>
            </div>
            <button className={`rounded-2xl px-4 py-2 text-sm font-semibold ${theme.accentButton} ${theme.accentButtonText}`}>{pack.branding.primaryCta}</button>
          </div>
          <div className={`rounded-[28px] border p-4 text-center ${theme.panelBg}`}>
            <div className={`inline-flex items-center rounded-full border px-4 py-2 text-xs font-medium ${theme.accentSoft} ${theme.accentBorder}`}>✦ {pack.branding.badge}</div>
            <div className="mt-6 text-5xl font-bold leading-[0.95] tracking-[-0.05em] text-white">
              <span>{pack.branding.headlineA} </span>
              <span className={theme.accentText}>{pack.branding.accentB}</span>
              <span> </span>
              <span className={theme.accentText}>{pack.branding.accentC}</span>
              <span> {pack.branding.closing}</span>
            </div>
            <p className="mt-5 text-base leading-7 text-slate-300">{pack.branding.subtitle}</p>
            <div className="mt-6 space-y-3">
              <button className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold ${theme.accentButton} ${theme.accentButtonText}`}>{pack.branding.primaryCta} →</button>
              <button className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white">{pack.branding.secondaryCta}</button>
            </div>
          </div>
        </section>

        <section className={`px-4 py-10 text-slate-900 ${theme.lightSectionBg}`}>
          <h3 className="text-4xl font-bold tracking-[-0.05em] leading-tight text-center">
            <span>{pack.branding.featuresTitle} </span>
            <span className={theme.accentGradient}>{pack.branding.featuresAccent}</span>
          </h3>
          <p className="mt-4 text-center text-base leading-7 text-slate-500">{pack.branding.featuresSubtitle}</p>
          <div className="mt-8 grid gap-4">
            {pack.branding.features.map((feature) => (
              <div key={feature.title} className={`rounded-[24px] border bg-white p-5 shadow-sm ${theme.lightFeatureBorder}`}>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${theme.lightIconBg}`}>{feature.icon}</div>
                <div className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">{feature.title}</div>
                <p className="mt-3 text-base leading-7 text-slate-500">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={`min-h-[760px] p-3 ${theme.mobileShellBg}`}>
      <div className={`mx-auto overflow-hidden rounded-[30px] border border-white/10 shadow-sm ${theme.frameInnerBg}`}>
        <div className="flex items-center justify-between px-4 pb-2 pt-3 text-xs font-semibold text-slate-500">
          <span>9:41</span>
          <span>{pack.branding.name}</span>
        </div>
        <div className="px-4 pb-4">
          <div className={`rounded-[28px] border p-4 ${theme.panelBg}`}>
            <div className={`inline-flex rounded-full border px-3 py-2 text-[11px] font-semibold ${theme.accentSoft} ${theme.accentBorder}`}>{currentKind}</div>
            <h3 className="mt-3 text-3xl font-bold tracking-tight text-white">{current}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">{pack.branding.subtitle}</p>
          </div>
          <div className={`mt-4 rounded-[24px] border p-4 text-sm leading-6 text-slate-300 ${theme.panelMutedBg}`}>{pack.branding.features[0]?.body}</div>
          <div className="mt-4 grid gap-3">
            {pack.appNavigation.slice(0, 5).map((item, index) => (
              <div key={item} className={`rounded-2xl border px-4 py-4 text-sm ${index === activeScreen ? `${theme.accentSoft} ${theme.accentBorder} text-white` : `${theme.panelMutedBg} text-slate-300`}`}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function inferScreenKind(screen: string, index: number): ScreenKind {
  const text = screen.toLowerCase();
  if (text.includes("landing") || text.includes("home")) return "landing";
  if (text.includes("onboarding") || text.includes("signup")) return "onboarding";
  if (text.includes("workflow") || text.includes("builder") || text.includes("discovery") || text.includes("dashboard") || text.includes("plan") || text.includes("feed")) return "workflow";
  if (text.includes("result") || text.includes("summary") || text.includes("checkout")) return "results";
  if (text.includes("analytics") || text.includes("report") || text.includes("insight")) return "analytics";
  if (index === 0) return "landing";
  if (index === 1) return "onboarding";
  if (index === 2) return "workflow";
  if (index === 3) return "results";
  if (index === 4) return "analytics";
  return "generic";
}

function describeScreen(screen: string, targetUser: string, coreOutcome: string) {
  const kind = inferScreenKind(screen, 0);
  if (kind === "landing") return `Hero, features, and CTA for ${targetUser.toLowerCase()}.`;
  if (kind === "onboarding") return `Collect setup data to unlock ${coreOutcome.toLowerCase()}.`;
  if (kind === "workflow") return "Main in-product experience with clear value delivery.";
  if (kind === "results") return "Success state, summary, and next action.";
  if (kind === "analytics") return "Signal, funnel, and conversion metrics for the founder.";
  return `Product screen for ${targetUser.toLowerCase()}.`;
}

function getSidebarStats(archetype: MvpArchetype) {
  if (archetype === "agency") return [{ label: "Leads", value: "142" }, { label: "Replies", value: "31" }, { label: "Won", value: "9" }];
  if (archetype === "marketplace") return [{ label: "Listings", value: "248" }, { label: "Matches", value: "67" }, { label: "Orders", value: "14" }];
  if (archetype === "education") return [{ label: "Students", value: "186" }, { label: "Progress", value: "72%" }, { label: "Completed", value: "41" }];
  if (archetype === "creator") return [{ label: "Audience", value: "12.4k" }, { label: "Offers", value: "4" }, { label: "Sales", value: "27" }];
  if (archetype === "fintech") return [{ label: "Accounts", value: "86" }, { label: "Alerts", value: "19" }, { label: "Forecast", value: "+12%" }];
  if (archetype === "recruiting") return [{ label: "Candidates", value: "93" }, { label: "Shortlist", value: "18" }, { label: "Interviews", value: "7" }];
  if (archetype === "ecommerce") return [{ label: "Products", value: "314" }, { label: "Carts", value: "62" }, { label: "Orders", value: "21" }];
  return [{ label: "Users", value: "214" }, { label: "Active", value: "67" }, { label: "Conv", value: "12%" }];
}

function getAnalyticsLabels(archetype: MvpArchetype) {
  if (archetype === "agency") return [{ label: "Visitors", value: "3,281" }, { label: "Leads", value: "214" }, { label: "Proposals", value: "98" }, { label: "Won", value: "19" }];
  if (archetype === "marketplace") return [{ label: "Visits", value: "4,102" }, { label: "Matches", value: "324" }, { label: "Bookings", value: "76" }, { label: "Repeat", value: "18%" }];
  if (archetype === "education") return [{ label: "Visitors", value: "2,148" }, { label: "Enrollments", value: "132" }, { label: "Active", value: "89" }, { label: "Completed", value: "41" }];
  if (archetype === "creator") return [{ label: "Views", value: "18k" }, { label: "Subscribers", value: "642" }, { label: "Buyers", value: "54" }, { label: "MRR", value: "$4.1k" }];
  if (archetype === "fintech") return [{ label: "Users", value: "1,420" }, { label: "Linked", value: "612" }, { label: "Alerts", value: "148" }, { label: "Saved", value: "$12k" }];
  return [{ label: "Visitors", value: "3,281" }, { label: "Signups", value: "214" }, { label: "Activated", value: "98" }, { label: "Retained", value: "41" }];
}

function getWorkflowBlocks(archetype: MvpArchetype, coreOutcome: string) {
  if (archetype === "agency") {
    return {
      leftTitle: "Lead feed",
      rightTitle: "Generated proposal",
      items: ["Studio North — website redesign", "Acme Interiors — proposal requested", "Pixel Foundry — warm inbound lead"],
      result: `Tailored pitch focused on ${coreOutcome.toLowerCase()}, with scope, timeline, and follow-up sequence already prepared.`,
    };
  }
  if (archetype === "marketplace") {
    return {
      leftTitle: "Live listings",
      rightTitle: "Best match",
      items: ["Top-rated local provider", "Recommended booking slot", "Most relevant category match"],
      result: `The marketplace recommends the best fit listing to help users ${coreOutcome.toLowerCase()} faster.`,
    };
  }
  if (archetype === "education") {
    return {
      leftTitle: "Learning path",
      rightTitle: "Next milestone",
      items: ["Current lesson", "Recommended exercise", "Upcoming checkpoint"],
      result: `The learning flow guides students toward ${coreOutcome.toLowerCase()} with clearer momentum and progress visibility.`,
    };
  }
  if (archetype === "creator") {
    return {
      leftTitle: "Audience engine",
      rightTitle: "Offer draft",
      items: ["Top content themes", "High-response audience segment", "Monetization opportunity"],
      result: `The creator workflow turns attention into structured offers that support ${coreOutcome.toLowerCase()}.`,
    };
  }
  return {
    leftTitle: "Core workspace",
    rightTitle: "Generated result",
    items: ["Primary input", "Workflow context", "Validation signal"],
    result: `This flow is optimized to help users ${coreOutcome.toLowerCase()} with less friction and a clearer success state.`,
  };
}

function DarkKpi({ label, value, panelClass }: { label: string; value: string; panelClass: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${panelClass}`}>
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className="mt-2 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}

function DarkPanel({ title, body, panelClass }: { title: string; body: string; panelClass: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${panelClass}`}>
      <div className="text-sm font-semibold text-white">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
    </div>
  );
}

function DarkField({ label, value, panelClass }: { label: string; value: string; panelClass: string }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className={`rounded-2xl border px-4 py-3 text-sm text-slate-200 ${panelClass}`}>{value}</div>
    </div>
  );
}

function DarkStep({ title, text, panelClass }: { title: string; text: string; panelClass: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${panelClass}`}>
      <div className="text-sm font-semibold text-white">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
    </div>
  );
}

function DarkListItem({ text, panelClass }: { text: string; panelClass: string }) {
  return <div className={`rounded-2xl border px-4 py-3 text-sm text-slate-200 ${panelClass}`}>{text}</div>;
}

function DarkBar({ label, value, width, colorClass }: { label: string; value: string; width: string; colorClass: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm text-slate-300">
        <span>{label}</span>
        <span className="font-semibold text-white">{value}</span>
      </div>
      <div className="h-3 rounded-full bg-white/10">
        <div className={`h-3 rounded-full ${colorClass}`} style={{ width }} />
      </div>
    </div>
  );
}
