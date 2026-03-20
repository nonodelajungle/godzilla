"use client";

import { useMemo, useState } from "react";
import type { MvpPack, MvpThemeKey } from "../lib/mvp-pack";

type MvpPreviewProps = { pack: MvpPack };
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

type Layout = {
  shellTitle: string;
  shellSubtitle: string;
  modules: string[];
  workflowTitle: string;
  workflowItems: string[];
  leftPanelTitle: string;
  leftPanelItems: string[];
  rightPanelTitle: string;
  rightPanelBody: string;
  resultSummary: string;
  resultChecks: string[];
  analyticsTitle: string;
  analyticsFunnel: Array<{ label: string; value: string; width: string }>;
  analyticsInsights: string[];
  onboardingFields: Array<{ label: string; value: string }>;
  mobileHighlight: string;
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
  const layout = getLayout(pack);

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">MVP preview</div>
          <p className="mt-2 text-sm leading-6 text-slate-500">Adaptive visual result generated from the detected project archetype.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:block">
            {pack.archetype.replace(/_/g, " ")}
          </div>
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
              <DesktopPreview pack={pack} layout={layout} theme={theme} current={current} currentKind={currentKind} activeScreen={activeScreen} />
            ) : (
              <MobilePreview pack={pack} layout={layout} theme={theme} current={current} currentKind={currentKind} activeScreen={activeScreen} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function DesktopPreview({ pack, layout, theme, current, currentKind, activeScreen }: { pack: MvpPack; layout: Layout; theme: ThemeTokens; current: string; currentKind: ScreenKind; activeScreen: number }) {
  if (currentKind === "landing") return <LandingPreview pack={pack} layout={layout} theme={theme} />;

  return (
    <div className={`grid min-h-[820px] grid-cols-[250px_1fr] text-white ${theme.shellBg}`}>
      <aside className={`border-r border-white/10 p-5 ${theme.sidebarBg}`}>
        <div className={`rounded-2xl border p-4 ${theme.panelBg}`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${theme.accentButton} ${theme.accentButtonText}`}>✦</div>
            <div>
              <div className="text-base font-semibold">{layout.shellTitle}</div>
              <div className="text-xs text-slate-400">{layout.shellSubtitle}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          {pack.appNavigation.slice(0, 5).map((item, index) => (
            <div key={item} className={`rounded-2xl border px-4 py-3 text-sm ${index === activeScreen ? `${theme.accentButton} ${theme.accentButtonText} font-semibold` : `${theme.panelMutedBg} text-slate-300`}`}>
              {item}
            </div>
          ))}
        </div>

        <div className={`mt-6 rounded-2xl border p-4 ${theme.panelBg}`}>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Core modules</div>
          <div className="mt-4 space-y-3">
            {layout.modules.map((module) => (
              <DarkListItem key={module} text={module} panelClass={theme.panelMutedBg} />
            ))}
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
          {currentKind === "onboarding" && <OnboardingScreen layout={layout} theme={theme} />}
          {currentKind === "workflow" && <WorkflowScreen pack={pack} layout={layout} theme={theme} />}
          {currentKind === "results" && <ResultsScreen layout={layout} theme={theme} />}
          {currentKind === "analytics" && <AnalyticsScreen layout={layout} theme={theme} />}
          {currentKind === "generic" && <GenericScreen pack={pack} layout={layout} theme={theme} />}
        </div>
      </main>
    </div>
  );
}

function LandingPreview({ pack, layout, theme }: { pack: MvpPack; layout: Layout; theme: ThemeTokens }) {
  return (
    <div className="min-h-[1450px] overflow-hidden bg-white">
      <section className={`text-white ${theme.shellBg}`}>
        <div className="flex items-center justify-between border-b border-white/10 px-8 py-5">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${theme.accentButton} ${theme.accentButtonText}`}>✦</div>
            <div className="text-3xl font-semibold tracking-tight">{pack.branding.name}</div>
          </div>
          <div className="flex items-center gap-8 text-sm text-slate-300">
            <span>{pack.appNavigation[0] || "Overview"}</span>
            <button className={`rounded-2xl px-5 py-3 font-semibold ${theme.accentButton} ${theme.accentButtonText}`}>{pack.branding.primaryCta}</button>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-8 pb-20 pt-16 text-center">
          <div className={`inline-flex items-center rounded-full border px-5 py-2 text-sm font-medium ${theme.accentSoft} ${theme.accentBorder}`}>✦ {pack.branding.badge}</div>
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
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {layout.modules.slice(0, 3).map((module) => (
              <div key={module} className={`rounded-2xl border px-4 py-4 text-left ${theme.panelBg}`}>
                <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Module</div>
                <div className="mt-2 text-sm font-semibold text-white">{module}</div>
              </div>
            ))}
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

function OnboardingScreen({ layout, theme }: { layout: Layout; theme: ThemeTokens }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className={`rounded-[28px] border p-6 ${theme.panelBg}`}>
        <div className="text-sm font-semibold text-white">Setup tailored to this product</div>
        <div className="mt-6 space-y-4">
          {layout.onboardingFields.map((field) => (
            <DarkField key={field.label} label={field.label} value={field.value} panelClass={theme.panelMutedBg} />
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <button className={`rounded-2xl px-5 py-3 text-sm font-semibold ${theme.accentButton} ${theme.accentButtonText}`}>Continue</button>
        </div>
      </div>
      <div className={`rounded-[28px] border p-5 ${theme.panelBg}`}>
        <div className="text-sm font-semibold text-white">Why this flow is different</div>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
          {layout.workflowItems.slice(0, 3).map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function WorkflowScreen({ pack, layout, theme }: { pack: MvpPack; layout: Layout; theme: ThemeTokens }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div className={`rounded-[28px] border p-6 ${theme.panelBg}`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-white">{layout.workflowTitle}</div>
              <p className="mt-2 text-sm text-slate-300">Structure spécifique à l’archetype {pack.archetype.replace(/_/g, " ")}.</p>
            </div>
            <span className={`rounded-full px-3 py-2 text-xs font-semibold ${theme.accentButton} ${theme.accentButtonText}`}>Adaptive</span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {layout.workflowItems.map((item, index) => (
              <DarkStep key={item} title={`Step ${index + 1}`} text={item} panelClass={theme.panelMutedBg} />
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className={`rounded-[28px] border p-5 ${theme.panelBg}`}>
            <div className="text-sm font-semibold text-white">{layout.leftPanelTitle}</div>
            <div className="mt-4 space-y-3">
              {layout.leftPanelItems.map((item) => (
                <DarkListItem key={item} text={item} panelClass={theme.panelMutedBg} />
              ))}
            </div>
          </div>
          <div className={`rounded-[28px] border p-5 ${theme.panelBg}`}>
            <div className="text-sm font-semibold text-white">{layout.rightPanelTitle}</div>
            <div className={`mt-4 rounded-2xl border p-4 text-sm leading-6 text-slate-200 ${theme.panelMutedBg}`}>{layout.rightPanelBody}</div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {layout.modules.slice(0, 2).map((item) => (
                <DarkKpi key={item} label={item} value="Live" panelClass={theme.panelMutedBg} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={`rounded-[28px] border p-5 ${theme.panelBg}`}>
        <div className="text-sm font-semibold text-white">Product modules</div>
        <div className="mt-4 space-y-3">
          {layout.modules.map((item) => (
            <DarkListItem key={item} text={item} panelClass={theme.panelMutedBg} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ResultsScreen({ layout, theme }: { layout: Layout; theme: ThemeTokens }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className={`rounded-[28px] border p-6 ${theme.panelBg}`}>
        <div className="text-sm font-semibold text-white">Outcome summary</div>
        <div className={`mt-5 rounded-2xl border p-5 text-sm leading-7 text-slate-200 ${theme.panelMutedBg}`}>{layout.resultSummary}</div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {layout.modules.slice(0, 3).map((item, index) => (
            <DarkKpi key={item} label={item} value={["Ready", "Live", "Tracked"][index] || "Ready"} panelClass={theme.panelMutedBg} />
          ))}
        </div>
      </div>
      <div className={`rounded-[28px] border p-5 ${theme.panelBg}`}>
        <div className="text-sm font-semibold text-white">Launch checklist</div>
        <div className="mt-4 space-y-3">
          {layout.resultChecks.map((item) => (
            <DarkListItem key={item} text={item} panelClass={theme.panelMutedBg} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsScreen({ layout, theme }: { layout: Layout; theme: ThemeTokens }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {layout.analyticsFunnel.map((item) => (
          <DarkKpi key={item.label} label={item.label} value={item.value} panelClass={theme.panelMutedBg} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className={`rounded-[28px] border p-6 ${theme.panelBg}`}>
          <div className="text-sm font-semibold text-white">{layout.analyticsTitle}</div>
          <div className="mt-5 space-y-4">
            {layout.analyticsFunnel.map((item) => (
              <DarkBar key={item.label} label={item.label} value={item.value} width={item.width} colorClass={theme.accentButton} />
            ))}
          </div>
        </div>
        <div className={`rounded-[28px] border p-5 ${theme.panelBg}`}>
          <div className="text-sm font-semibold text-white">Insights</div>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
            {layout.analyticsInsights.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function GenericScreen({ pack, layout, theme }: { pack: MvpPack; layout: Layout; theme: ThemeTokens }) {
  return (
    <div className={`rounded-[28px] border p-6 ${theme.panelBg}`}>
      <div className="text-sm font-semibold text-white">{pack.branding.name}</div>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{layout.mobileHighlight}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <DarkPanel title="Target user" body={pack.targetUser} panelClass={theme.panelMutedBg} />
        <DarkPanel title="Core outcome" body={pack.coreOutcome} panelClass={theme.panelMutedBg} />
      </div>
    </div>
  );
}

function MobilePreview({ pack, layout, theme, current, currentKind, activeScreen }: { pack: MvpPack; layout: Layout; theme: ThemeTokens; current: string; currentKind: ScreenKind; activeScreen: number }) {
  if (currentKind === "landing") {
    return (
      <div className="min-h-[980px] bg-white">
        <section className={`px-4 pb-12 pt-4 text-white ${theme.shellBg}`}>
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${theme.accentButton} ${theme.accentButtonText}`}>✦</div>
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
            <p className="mt-3 text-sm leading-6 text-slate-300">{layout.mobileHighlight}</p>
          </div>
          <div className="mt-4 grid gap-3">
            {layout.modules.slice(0, 3).map((item) => (
              <DarkListItem key={item} text={item} panelClass={theme.panelMutedBg} />
            ))}
          </div>
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

function getLayout(pack: MvpPack): Layout {
  const outcome = pack.coreOutcome.toLowerCase();

  switch (pack.archetype) {
    case "agency":
      return {
        shellTitle: "Revenue workspace",
        shellSubtitle: "Leads, proposals, pipeline",
        modules: ["Lead discovery", "Proposal drafts", "Follow-up automation", "Deal tracking"],
        workflowTitle: "Client acquisition workflow",
        workflowItems: ["Source high-fit leads", "Generate personalized proposal", "Trigger follow-up and move deal"],
        leftPanelTitle: "Lead inbox",
        leftPanelItems: ["Warm referrals", "Job-board prospects", "Portfolio-fit opportunities"],
        rightPanelTitle: "Proposal composer",
        rightPanelBody: `Draft a proposal that helps the freelancer ${outcome}, with scope, timeline, and clear next step.`,
        resultSummary: "The MVP behaves like a lightweight sales cockpit for a freelancer or boutique agency, not like a generic app shell.",
        resultChecks: ["Lead list connected", "Proposal generation visible", "Pipeline stages tracked"],
        analyticsTitle: "Pipeline funnel",
        analyticsFunnel: [{ label: "Prospects", value: "132", width: "100%" }, { label: "Qualified", value: "48", width: "70%" }, { label: "Proposals", value: "19", width: "42%" }, { label: "Won", value: "6", width: "18%" }],
        analyticsInsights: ["Best conversion from referrals", "Proposal speed is core value", "Follow-up cadence drives wins"],
        onboardingFields: [{ label: "Niche", value: pack.targetUser }, { label: "Offer", value: pack.coreOutcome }, { label: "Portfolio hook", value: "Best case study angle" }, { label: "Outreach tone", value: "Direct but premium" }],
        mobileHighlight: "A compact revenue cockpit for independent operators.",
      };
    case "marketplace":
      return {
        shellTitle: "Marketplace OS",
        shellSubtitle: "Listings, trust, bookings",
        modules: ["Listings feed", "Filters and categories", "Match scoring", "Booking state"],
        workflowTitle: "Marketplace matching flow",
        workflowItems: ["Browse intent-matched listings", "Inspect trust signals", "Confirm booking or inquiry"],
        leftPanelTitle: "Live listings",
        leftPanelItems: ["Top-rated provider", "Best availability slot", "Highest-fit match"],
        rightPanelTitle: "Listing detail",
        rightPanelBody: `Show the best listing, price, trust, and booking state so the user can ${outcome} quickly.`,
        resultSummary: "The MVP behaves like a transactional discovery layer with trust and booking, not like a generic dashboard.",
        resultChecks: ["Listings visible", "Detail page structured", "Booking step present"],
        analyticsTitle: "Marketplace conversion",
        analyticsFunnel: [{ label: "Visits", value: "4.1k", width: "100%" }, { label: "Listing views", value: "1.8k", width: "72%" }, { label: "Inquiries", value: "420", width: "40%" }, { label: "Bookings", value: "76", width: "18%" }],
        analyticsInsights: ["Trust section matters more than filters", "Availability is conversion-critical", "Top category drives majority of bookings"],
        onboardingFields: [{ label: "Primary side", value: "Buyer" }, { label: "Goal", value: pack.coreOutcome }, { label: "Budget range", value: "Mid-market" }, { label: "Location / category", value: "Geo + niche" }],
        mobileHighlight: "A buyer-first marketplace flow with trust and booking.",
      };
    case "education":
      return {
        shellTitle: "Learning hub",
        shellSubtitle: "Lessons, path, progress",
        modules: ["Course map", "Lesson player", "Milestones", "Progress report"],
        workflowTitle: "Guided learning flow",
        workflowItems: ["Assess current level", "Unlock next lesson", "Complete milestone and review progress"],
        leftPanelTitle: "Learning path",
        leftPanelItems: ["Current module", "Next lesson", "Practice checkpoint"],
        rightPanelTitle: "Lesson player",
        rightPanelBody: `Keep the learner moving toward ${outcome} with clear next actions and visible progress.`,
        resultSummary: "The MVP behaves like a guided learning journey with progress and milestones, not a generic content app.",
        resultChecks: ["Path visible", "Lesson state saved", "Progress summary generated"],
        analyticsTitle: "Learning progression",
        analyticsFunnel: [{ label: "Visitors", value: "2.1k", width: "100%" }, { label: "Enrollments", value: "132", width: "48%" }, { label: "Active learners", value: "89", width: "36%" }, { label: "Completed", value: "41", width: "20%" }],
        analyticsInsights: ["Drop-off highest after module 1", "Guided milestones improve completion", "Progress clarity increases return sessions"],
        onboardingFields: [{ label: "Current level", value: "Beginner to intermediate" }, { label: "Learning goal", value: pack.coreOutcome }, { label: "Cadence", value: "3 sessions per week" }, { label: "Preferred format", value: "Video + exercises" }],
        mobileHighlight: "A structured learning path with milestones and momentum.",
      };
    case "creator":
      return {
        shellTitle: "Creator studio",
        shellSubtitle: "Audience, content, offers",
        modules: ["Audience segments", "Content calendar", "Offer builder", "Revenue signals"],
        workflowTitle: "Creator monetization flow",
        workflowItems: ["Identify high-response segment", "Plan content around demand", "Turn attention into an offer"],
        leftPanelTitle: "Audience engine",
        leftPanelItems: ["Top segment", "Best-performing hook", "Warmest subscribers"],
        rightPanelTitle: "Offer workspace",
        rightPanelBody: `Package a creator offer that helps the audience ${outcome}, tied to real engagement signals.`,
        resultSummary: "The MVP behaves like a creator business system with content and offer logic, not a generic productivity dashboard.",
        resultChecks: ["Audience segment visible", "Content planner live", "Offer page connected"],
        analyticsTitle: "Audience-to-revenue funnel",
        analyticsFunnel: [{ label: "Views", value: "18k", width: "100%" }, { label: "Subscribers", value: "642", width: "60%" }, { label: "Offer visits", value: "212", width: "34%" }, { label: "Buyers", value: "54", width: "14%" }],
        analyticsInsights: ["Best content theme drives most subscribers", "Offer conversion depends on audience fit", "Monetization is strongest on warm lists"],
        onboardingFields: [{ label: "Audience type", value: pack.targetUser }, { label: "Primary offer", value: pack.coreOutcome }, { label: "Content cadence", value: "3 posts per week" }, { label: "Monetization model", value: "Digital offer / membership" }],
        mobileHighlight: "A creator operating system for audience, content, and offers.",
      };
    case "fintech":
      return {
        shellTitle: "Finance cockpit",
        shellSubtitle: "Accounts, insights, forecasts",
        modules: ["Account overview", "Cash flow feed", "Alerts", "Forecasts"],
        workflowTitle: "Money insight workflow",
        workflowItems: ["Aggregate account data", "Detect anomalies and patterns", "Project future cash state"],
        leftPanelTitle: "Account overview",
        leftPanelItems: ["Balance snapshot", "Recurring expenses", "Upcoming pressure points"],
        rightPanelTitle: "Forecast panel",
        rightPanelBody: `Give the user a clean financial view that helps them ${outcome} with less ambiguity.`,
        resultSummary: "The MVP behaves like a finance assistant with insight and forecast layers, not like a generic admin tool.",
        resultChecks: ["Accounts visible", "Insights generated", "Forecast scenario shown"],
        analyticsTitle: "Financial signal",
        analyticsFunnel: [{ label: "Users", value: "1.4k", width: "100%" }, { label: "Connected accounts", value: "612", width: "66%" }, { label: "Insight sessions", value: "248", width: "36%" }, { label: "Alerts resolved", value: "92", width: "18%" }],
        analyticsInsights: ["Forecast tab is the retention driver", "Alerts create repeat visits", "Insight clarity beats dashboard density"],
        onboardingFields: [{ label: "Entity type", value: "Individual / small business" }, { label: "Main goal", value: pack.coreOutcome }, { label: "Time horizon", value: "30–90 days" }, { label: "Connected sources", value: "Bank + card + invoices" }],
        mobileHighlight: "A finance assistant with balances, alerts, and forecasts.",
      };
    case "recruiting":
      return {
        shellTitle: "Hiring pipeline",
        shellSubtitle: "Candidates, scores, stages",
        modules: ["Candidate queue", "Fit scoring", "Interview kit", "Stage tracking"],
        workflowTitle: "Hiring decision workflow",
        workflowItems: ["Source or import candidates", "Score fit against role", "Advance strongest profiles"],
        leftPanelTitle: "Candidate queue",
        leftPanelItems: ["Top-fit candidate", "Recently screened", "Needs review"],
        rightPanelTitle: "Scorecard",
        rightPanelBody: `Show structured fit so the hiring team can ${outcome} faster and with less noise.`,
        resultSummary: "The MVP behaves like a hiring pipeline with scoring and stages, not like a generic CRM clone.",
        resultChecks: ["Candidates listed", "Fit score visible", "Interview stage tracked"],
        analyticsTitle: "Hiring funnel",
        analyticsFunnel: [{ label: "Applicants", value: "384", width: "100%" }, { label: "Shortlisted", value: "86", width: "44%" }, { label: "Interviews", value: "28", width: "24%" }, { label: "Offers", value: "7", width: "10%" }],
        analyticsInsights: ["Scorecards reduce noisy review", "Time-to-shortlist is core value", "Most drop-off occurs before interview"],
        onboardingFields: [{ label: "Role", value: pack.targetUser }, { label: "Hiring objective", value: pack.coreOutcome }, { label: "Must-have signals", value: "Skills + experience + fit" }, { label: "Pipeline style", value: "Lean shortlist first" }],
        mobileHighlight: "A hiring workspace focused on candidate signal and stages.",
      };
    case "ecommerce":
      return {
        shellTitle: "Commerce layer",
        shellSubtitle: "Catalog, cart, orders",
        modules: ["Catalog discovery", "Collection merchandising", "Cart state", "Order analytics"],
        workflowTitle: "Store conversion workflow",
        workflowItems: ["Surface relevant products", "Guide to cart", "Reduce friction through checkout"],
        leftPanelTitle: "Storefront blocks",
        leftPanelItems: ["Hero collection", "Recommended bundle", "Low-friction cart prompt"],
        rightPanelTitle: "Cart and checkout",
        rightPanelBody: `Optimize discovery and purchase flow so shoppers can ${outcome} with less hesitation.`,
        resultSummary: "The MVP behaves like a conversion-focused commerce flow with merchandising and checkout, not like a generic dashboard.",
        resultChecks: ["Catalog surfaced", "Cart state shown", "Orders measurable"],
        analyticsTitle: "Store funnel",
        analyticsFunnel: [{ label: "Sessions", value: "9.2k", width: "100%" }, { label: "Product views", value: "3.8k", width: "68%" }, { label: "Carts", value: "620", width: "28%" }, { label: "Orders", value: "148", width: "12%" }],
        analyticsInsights: ["Collection merchandising drives first click", "Cart friction is biggest leak", "Bundles improve AOV"],
        onboardingFields: [{ label: "Store type", value: pack.targetUser }, { label: "Conversion goal", value: pack.coreOutcome }, { label: "Top collection", value: "Best seller / hero category" }, { label: "Checkout emphasis", value: "Speed + trust" }],
        mobileHighlight: "A commerce journey optimized for discovery, cart, and orders.",
      };
    case "health":
      return {
        shellTitle: "Care journey",
        shellSubtitle: "Plan, check-ins, progress",
        modules: ["Care plan", "Check-ins", "Habit streaks", "Progress review"],
        workflowTitle: "Guided care workflow",
        workflowItems: ["Capture goals and constraints", "Build realistic plan", "Track consistency and outcomes"],
        leftPanelTitle: "Care plan",
        leftPanelItems: ["Today’s action", "Upcoming check-in", "Risk / motivation note"],
        rightPanelTitle: "Progress review",
        rightPanelBody: `Provide calm structure and feedback so the user can ${outcome} with more consistency.`,
        resultSummary: "The MVP behaves like a supportive health journey with check-ins and progress, not like a generic habit app.",
        resultChecks: ["Plan visible", "Check-ins live", "Progress summary generated"],
        analyticsTitle: "Engagement and adherence",
        analyticsFunnel: [{ label: "Signups", value: "1.1k", width: "100%" }, { label: "Plan started", value: "420", width: "52%" }, { label: "Weekly active", value: "208", width: "30%" }, { label: "Progressing", value: "91", width: "16%" }],
        analyticsInsights: ["Check-ins are the stickiest loop", "Calm onboarding improves completion", "Progress review increases retention"],
        onboardingFields: [{ label: "Goal", value: pack.coreOutcome }, { label: "Context", value: pack.targetUser }, { label: "Constraints", value: "Time / energy / schedule" }, { label: "Check-in mode", value: "Daily + weekly review" }],
        mobileHighlight: "A calm care flow with plan, check-ins, and progress.",
      };
    case "b2b_saas":
      return {
        shellTitle: "Ops workspace",
        shellSubtitle: "Workflows, tasks, reports",
        modules: ["Workflow board", "Automation runs", "Team queue", "Reports"],
        workflowTitle: "Operational execution flow",
        workflowItems: ["Configure workflow", "Run automation", "Review team exceptions"],
        leftPanelTitle: "Workflow queue",
        leftPanelItems: ["Active workflow", "Blocked task", "Recent automation run"],
        rightPanelTitle: "Execution panel",
        rightPanelBody: `Give operators a clean control layer that helps teams ${outcome} with less manual coordination.`,
        resultSummary: "The MVP behaves like an operations workspace with workflow state and exceptions, not like a generic SaaS shell.",
        resultChecks: ["Workflow visible", "Exceptions surfaced", "Reports connected"],
        analyticsTitle: "Ops performance funnel",
        analyticsFunnel: [{ label: "Teams", value: "82", width: "100%" }, { label: "Active workflows", value: "214", width: "72%" }, { label: "Completed runs", value: "1.3k", width: "58%" }, { label: "Resolved exceptions", value: "312", width: "24%" }],
        analyticsInsights: ["Exception handling is the real sticky layer", "Reports need workflow context", "Team visibility drives expansion"],
        onboardingFields: [{ label: "Team type", value: pack.targetUser }, { label: "Operational outcome", value: pack.coreOutcome }, { label: "Workflow type", value: "Approval / handoff / ops" }, { label: "Reporting need", value: "Throughput + blockers" }],
        mobileHighlight: "An operations control layer with workflows and exceptions.",
      };
    default:
      return {
        shellTitle: "Consumer product",
        shellSubtitle: "Journey, actions, retention",
        modules: ["Main journey", "Personalized state", "Repeat action", "Retention signal"],
        workflowTitle: "Consumer activation flow",
        workflowItems: ["Enter with clear intent", "Get first useful result", "Return for the next action"],
        leftPanelTitle: "Primary journey",
        leftPanelItems: ["Intent capture", "Recommended action", "Next-use trigger"],
        rightPanelTitle: "Success state",
        rightPanelBody: `Make the product feel immediately useful so users can ${outcome} in the first session.`,
        resultSummary: "The MVP behaves like a simple consumer journey with strong first value and repeat trigger, not a generic dashboard.",
        resultChecks: ["First value delivered", "Repeat action suggested", "Retention signal measured"],
        analyticsTitle: "Activation funnel",
        analyticsFunnel: [{ label: "Visitors", value: "5.6k", width: "100%" }, { label: "Signups", value: "812", width: "62%" }, { label: "Activated", value: "244", width: "28%" }, { label: "Returned", value: "91", width: "12%" }],
        analyticsInsights: ["First useful result drives activation", "Retention depends on next action", "Simple journeys outperform complex menus"],
        onboardingFields: [{ label: "User type", value: pack.targetUser }, { label: "Desired result", value: pack.coreOutcome }, { label: "First value", value: "Under 60 seconds" }, { label: "Return trigger", value: "New result / daily use" }],
        mobileHighlight: "A simple consumer journey built around first value and repeat use.",
      };
  }
}

function inferScreenKind(screen: string, index: number): ScreenKind {
  const text = screen.toLowerCase();
  if (text.includes("landing") || text.includes("home")) return "landing";
  if (text.includes("onboarding") || text.includes("signup") || text.includes("client") || text.includes("student") || text.includes("buyer") || text.includes("patient")) return "onboarding";
  if (text.includes("workflow") || text.includes("builder") || text.includes("discovery") || text.includes("dashboard") || text.includes("plan") || text.includes("feed") || text.includes("pipeline") || text.includes("catalog") || text.includes("workspace") || text.includes("lesson") || text.includes("content") || text.includes("money") || text.includes("candidate") || text.includes("product")) return "workflow";
  if (text.includes("result") || text.includes("summary") || text.includes("checkout") || text.includes("detail") || text.includes("offer")) return "results";
  if (text.includes("analytics") || text.includes("report") || text.includes("insight") || text.includes("trust")) return "analytics";
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
