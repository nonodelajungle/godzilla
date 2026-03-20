import type { MvpThemeKey } from "./mvp-pack";

export type BuildlyThemePreset = "lovable_soft" | "lovable_dark" | "saas_cyan" | "creator_rose" | "commerce_amber" | "finance_violet";

export type BuildlyProjectConfig = {
  themePreset: BuildlyThemePreset;
  workspaceKnowledge: string;
  projectKnowledge: string;
  referencedProjectIds: string[];
  remixedFromId?: string | null;
  buildOrigin?: "manual" | "url" | "remix";
  seedPrompt?: string;
};

export type BuildlyUrlSeed = {
  idea: string;
  icp: string;
  value: string;
  themePreset: BuildlyThemePreset;
  projectKnowledge: string;
  workspaceKnowledge: string;
  autosubmit: boolean;
  seedPrompt: string;
};

const DEFAULT_THEME: BuildlyThemePreset = "lovable_soft";
const WORKSPACE_KNOWLEDGE_KEY = "buildly/workspace-knowledge/v1";

export const THEME_PRESETS: Array<{ value: BuildlyThemePreset; label: string; description: string; themeKey: MvpThemeKey }> = [
  { value: "lovable_soft", label: "Lovable Soft", description: "Balanced SaaS styling for product-first MVPs.", themeKey: "cyan" },
  { value: "lovable_dark", label: "Lovable Dark", description: "More premium and contrast-heavy for AI / dev tools.", themeKey: "indigo" },
  { value: "saas_cyan", label: "SaaS Cyan", description: "Classic B2B SaaS palette with cleaner clarity.", themeKey: "cyan" },
  { value: "creator_rose", label: "Creator Rose", description: "Warmer creator / consumer visual identity.", themeKey: "rose" },
  { value: "commerce_amber", label: "Commerce Amber", description: "Stronger commerce / marketplace merchandising feel.", themeKey: "amber" },
  { value: "finance_violet", label: "Finance Violet", description: "Sharper finance / data / recruiting interface feel.", themeKey: "violet" },
];

export function defaultProjectConfig(overrides?: Partial<BuildlyProjectConfig>): BuildlyProjectConfig {
  return {
    themePreset: overrides?.themePreset || DEFAULT_THEME,
    workspaceKnowledge: overrides?.workspaceKnowledge || "",
    projectKnowledge: overrides?.projectKnowledge || "",
    referencedProjectIds: overrides?.referencedProjectIds || [],
    remixedFromId: overrides?.remixedFromId || null,
    buildOrigin: overrides?.buildOrigin || "manual",
    seedPrompt: overrides?.seedPrompt || "",
  };
}

export function themePresetToThemeKey(preset?: BuildlyThemePreset | null): MvpThemeKey | null {
  const match = THEME_PRESETS.find((item) => item.value === preset);
  return match?.themeKey || null;
}

export function readWorkspaceKnowledge() {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") return "";
  return window.localStorage.getItem(WORKSPACE_KNOWLEDGE_KEY) || "";
}

export function writeWorkspaceKnowledge(value: string) {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") return;
  window.localStorage.setItem(WORKSPACE_KNOWLEDGE_KEY, value);
}

export function parseBuildlyUrlSeed(): BuildlyUrlSeed | null {
  if (typeof window === "undefined") return null;
  const rawHash = window.location.hash?.replace(/^#/, "") || "";
  const rawSearch = window.location.search?.replace(/^\?/, "") || "";
  const hashParams = new URLSearchParams(rawHash);
  const searchParams = new URLSearchParams(rawSearch);
  const read = (key: string) => hashParams.get(key) || searchParams.get(key) || "";

  const idea = read("idea");
  const icp = read("icp");
  const value = read("value");
  const seedPrompt = read("prompt");
  const themePreset = asThemePreset(read("theme") || DEFAULT_THEME);
  const projectKnowledge = read("projectKnowledge");
  const workspaceKnowledge = read("workspaceKnowledge");
  const autosubmit = /^(1|true|yes)$/i.test(read("autosubmit"));

  if (!idea && !icp && !value && !seedPrompt && !projectKnowledge && !workspaceKnowledge) return null;

  return {
    idea: idea || inferIdeaFromPrompt(seedPrompt),
    icp,
    value,
    themePreset,
    projectKnowledge,
    workspaceKnowledge,
    autosubmit,
    seedPrompt,
  };
}

export function buildShareUrl(input: {
  idea: string;
  icp: string;
  value: string;
  themePreset: BuildlyThemePreset;
  projectKnowledge: string;
  workspaceKnowledge: string;
  autosubmit?: boolean;
}) {
  const params = new URLSearchParams();
  if (input.idea) params.set("idea", input.idea);
  if (input.icp) params.set("icp", input.icp);
  if (input.value) params.set("value", input.value);
  if (input.themePreset) params.set("theme", input.themePreset);
  if (input.projectKnowledge) params.set("projectKnowledge", input.projectKnowledge);
  if (input.workspaceKnowledge) params.set("workspaceKnowledge", input.workspaceKnowledge);
  if (input.autosubmit) params.set("autosubmit", "true");
  const base = typeof window !== "undefined" ? window.location.origin + window.location.pathname : "https://buildly.local/";
  return `${base}#${params.toString()}`;
}

function asThemePreset(value: string): BuildlyThemePreset {
  return THEME_PRESETS.some((item) => item.value === value) ? (value as BuildlyThemePreset) : DEFAULT_THEME;
}

function inferIdeaFromPrompt(prompt: string) {
  if (!prompt) return "";
  return prompt.replace(/^create\s+/i, "").replace(/^build\s+/i, "").trim();
}
