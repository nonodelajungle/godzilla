"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { demoIdeas, type ValidationInput } from "../lib/buildly";
import {
  analyzeMarket,
  buildLocalProject,
  buildMvpBrief,
  decideFromSignal,
  getProjectSignal,
  listProjectLeads,
  listProjects,
  publishVariant,
  saveProject,
  type AgentPayloadLite,
  type ExperimentPlan,
  type LandingVariant,
  type LocalProject,
} from "../lib/local-demo";

type AgentPayload = AgentPayloadLite;

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    SpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: null | (() => void);
  onend: null | (() => void);
  onerror: null | ((event: { error: string }) => void);
  onresult: null | ((event: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void);
};

const initialInput = demoIdeas[0];

export default function StudioClient() {
  const [form, setForm] = useState<ValidationInput>(initialInput);
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState("Voice input ready.");
  const [recording, setRecording] = useState(false);
  const [variants, setVariants] = useState<LandingVariant[] | null>(null);
  const [experiments, setExperiments] = useState<ExperimentPlan[] | null>(null);
  const [history, setHistory] = useState<LocalProject[]>([]);
  const [result, setResult] = useState<AgentPayload | null>(null);
  const [activeProject, setActiveProject] = useState<LocalProject | null>(null);
  const [publishModal, setPublishModal] = useState<{ open: boolean; url: string; variant?: string }>({ open: false, url: "" });

  useEffect(() => {
    setHistory(listProjects());
  }, []);

  const signal = useMemo(() => (activeProject ? getProjectSignal(activeProject.id) : null), [activeProject, publishModal.open]);
  const leads = useMemo(() => (activeProject ? listProjectLeads(activeProject.id) : []), [activeProject, publishModal.open]);
  const decision = useMemo(() => (activeProject && signal ? decideFromSignal(activeProject, signal) : null), [activeProject, signal]);
  const mvpBrief = useMemo(() => (activeProject && signal ? buildMvpBrief(activeProject, signal) : null), [activeProject, signal]);
  const marketAnalysis = useMemo(() => (activeProject ? analyzeMarket(activeProject) : null), [activeProject]);

  const providerTone = result?.meta?.provider === "openai"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-rose-200 bg-rose-50 text-rose-700";

  const handleGenerate = useCallback(async (idea?: string, icp?: string, value?: string) => {
    const payload: ValidationInput = {
      idea: idea ?? form.idea,
      icp: icp ?? form.icp,
      value: value ?? form.value,
    };

    setForm(payload);
    setIsGenerating(true);
    setStatus("Generating landing variants and validation plan...");

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as AgentPayload;
      const nextVariants = buildVariants(data);
      const nextExperiments = buildExperiments(data);
      const saved = saveProject(buildLocalProject({ payload: data, variants: nextVariants, experiments: nextExperiments }));
      setResult(data);
      setVariants(nextVariants);
      setExperiments(nextExperiments);
      setActiveProject(saved);
      setHistory(listProjects());
      setStatus("Landing variants ready. Publish one to start collecting signal.");
    } finally {
      setIsGenerating(false);
    }
  }, [form]);

  const handlePublish = useCallback((variant: LandingVariant) => {
    if (!activeProject) return;
    const published = publishVariant(activeProject, variant);
    setPublishModal({ open: true, url: `/p/${published.slug}`, variant: variant.type });
    setHistory(listProjects());
  }, [activeProject]);

  const handleHistorySelect = useCallback((project: LocalProject) => {
    setForm(project.input);
    setResult(project.result);
    setVariants(project.variants);
    setExperiments(project.experiments);
    setActiveProject(project);
    setStatus("Project restored from local history.");
  }, []);

  function toggleVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setStatus("Voice input is not supported in this browser. Use Chrome or Edge.");
      return;
    }
    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onstart = () => {
      setRecording(true);
      setStatus("Listening... describe the startup idea.");
    };
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) transcript += event.results[i][0].transcript;
      const parsed = parseTranscript(transcript);
      setForm((current) => ({
        idea: parsed.idea || current.idea,
        icp: parsed.icp || current.icp,
        value: parsed.value || current.value,
      }));
    };
    recognition.onerror = (event) => {
      setRecording(false);
      setStatus(`Voice error: ${event.error}`);
    };
    recognition.onend = () => {
      setRecording(false);
      setStatus("Voice captured. Generate landing variants.");
    };
    if (!recording) recognition.start();
    else recognition.stop();
  }

  return (
    <div className="min-h-screen bg-[#f7fbfb] text-slate-900">
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <span className="text-2xl font-bold tracking-tight text-cyan-600">Buildly</span>
          <div className="flex items-center gap-4">
            <a href="#how-it-works" className="hidden text-sm text-slate-500 transition hover:text-slate-900 sm:block">How it works</a>
            <a href="/dashboard" className="hidden text-sm text-slate-500 transition hover:text-slate-900 sm:block">Dashboard</a>
            <a href="#generator" className="rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95">Get Started</a>
          </div>
        </div>
      </nav>

      <main>
        <section className="bg-[radial-gradient(circle_at_top_left,rgba(59,196,190,0.10),transparent_35%),radial-gradient(circle_at_top_right,rgba(121,103,255,0.12),transparent_35%),linear-gradient(180deg,#f8fcfc_0%,#f5f8fb_100%)] px-4 pb-24 pt-28">
          <div className="mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center rounded-full bg-emerald-50 px-5 py-2 text-sm font-medium text-emerald-600">✦ AI-Powered Startup Validation</div>
            <h1 className="mx-auto mt-8 max-w-4xl text-5xl font-bold tracking-[-0.05em] text-slate-950 md:text-7xl">
              Validate Your Startup Idea
              <span className="block bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-500 bg-clip-text text-transparent">Before You Build</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-xl leading-9 text-slate-500">
              Idea in → market analysis → landing variants → publish → collect leads → analyze signal → decide → generate MVP.
            </p>
          </div>
        </section>

        <section id="generator" className="relative -mt-10 px-4">
          <div className="mx-auto max-w-4xl rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Describe Your Startup</h2>
                <p className="mt-2 text-slate-500">Autonomous mode: market analysis, local publish, local leads, local analytics, local decision engine.</p>
              </div>
              <button
                type="button"
                onClick={() => void handleGenerate(demoIdeas[1].idea, demoIdeas[1].icp, demoIdeas[1].value)}
                className="text-sm font-semibold text-cyan-600 transition hover:text-cyan-700"
              >
                Fill example
              </button>
            </div>

            <div className="space-y-5">
              <Field label="Startup Idea" placeholder="e.g. An AI tool that generates personalized workout plans" value={form.idea} onChange={(value) => setForm({ ...form, idea: value })} />
              <Field label="Target Customer (ICP)" placeholder="e.g. Fitness enthusiasts aged 25–35 who work from home" value={form.icp} onChange={(value) => setForm({ ...form, icp: value })} />
              <Field label="Value Proposition" placeholder="e.g. Help users stay consistent with tailored plans and faster results" value={form.value} onChange={(value) => setForm({ ...form, value })} />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={toggleVoice}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${recording ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
              >
                {recording ? "⏺ Stop" : "🎙️ Voice input"}
              </button>
              <button
                type="button"
                onClick={() => void handleGenerate()}
                disabled={isGenerating}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#9bd9d4] to-[#7ed3cf] px-6 py-4 text-lg font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-80"
              >
                {isGenerating ? "Generating..." : "✦ Generate Landing Pages"}
              </button>
            </div>
            <p className="mt-4 text-sm text-slate-500">{status}</p>
          </div>
        </section>

        {activeProject && marketAnalysis && (
          <section className="px-4 pb-4 pt-14">
            <div className="mx-auto max-w-6xl rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Market Analysis</div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Automatic reading of the targeted market before you push traffic into landing tests.</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-slate-100 px-3 py-2 text-slate-700">{marketAnalysis.segment}</span>
                  <span className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-700">Attractiveness · {marketAnalysis.marketAttractiveness}</span>
                  <span className="rounded-full bg-amber-50 px-3 py-2 text-amber-700">Urgency · {marketAnalysis.buyerUrgency}</span>
                  <span className="rounded-full bg-rose-50 px-3 py-2 text-rose-700">Competition · {marketAnalysis.competitivePressure}</span>
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-slate-600">{marketAnalysis.summary}</p>
              <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Best entry wedge</div>
                  <p className="mt-3 text-sm leading-7 text-slate-700">{marketAnalysis.entryWedge}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Recommended first channel</div>
                  <p className="mt-3 text-sm leading-7 text-slate-700">{marketAnalysis.recommendedChannel}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Top market risks</div>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                    {marketAnalysis.topRisks.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {variants && (
          <section className="px-4 pb-4 pt-10">
            <div className="mx-auto max-w-6xl">
              <SectionHeader
                eyebrow="Landing variants"
                title="Pick the strongest angle before you publish"
                subtitle="Publish a variant into a real local Buildly route and start collecting signal immediately."
              />
              <div className="mt-8 grid gap-6 lg:grid-cols-3">
                {variants.map((variant) => (
                  <div key={variant.id} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">{variant.type}</div>
                    <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">{variant.headline}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-500">{variant.subheadline}</p>
                    <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Angle</div>
                      <p className="mt-2 text-sm text-slate-600">{variant.angle}</p>
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-500">For {variant.audience.toLowerCase()}</span>
                      <button onClick={() => handlePublish(variant)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Publish</button>
                    </div>
                    <button className="mt-5 w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">{variant.cta}</button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeProject && signal && decision && mvpBrief && (
          <section className="px-4 pb-8 pt-8">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
              <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm lg:col-span-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Signal</div>
                    <p className="mt-2 text-sm text-slate-500">This project now has a real local feedback loop.</p>
                  </div>
                  {result?.meta && (
                    <div className={`rounded-full border px-3 py-2 text-xs font-semibold ${providerTone}`}>
                      {result.meta.provider === "openai" ? `OpenAI · ${result.meta.model}` : "Fallback"}
                    </div>
                  )}
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <MetricCard label="Views" value={String(signal.totalViews)} />
                  <MetricCard label="Leads" value={String(signal.totalLeads)} />
                  <MetricCard label="CTR" value={`${signal.ctr}%`} />
                  <MetricCard label="Conversion" value={`${signal.conversion}%`} />
                </div>
                <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Decision</div>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{decision.label}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{decision.rationale}</p>
                  <div className="mt-4 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 inline-flex">Confidence · {decision.confidence}</div>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm lg:col-span-1">
                <div className="text-sm font-semibold text-slate-900">Published variants</div>
                <div className="mt-5 space-y-3">
                  {signal.variants.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">Publish one landing to start collecting signal.</div>
                  ) : (
                    signal.variants.map((variant) => (
                      <div key={variant.slug} className="rounded-2xl border border-slate-200 p-4">
                        <div className="text-sm font-semibold text-slate-900">{variant.variantType}</div>
                        <p className="mt-2 text-sm text-slate-500">{variant.headline}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                          <span className="rounded-full bg-slate-100 px-3 py-1">{variant.views} views</span>
                          <span className="rounded-full bg-slate-100 px-3 py-1">{variant.leads} leads</span>
                          <span className="rounded-full bg-slate-100 px-3 py-1">{variant.conversion}% conv</span>
                        </div>
                        <a href={`/p/${variant.slug}`} className="mt-4 inline-flex text-sm font-semibold text-cyan-600">Open landing →</a>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm lg:col-span-1">
                <div className="text-sm font-semibold text-slate-900">Generate MVP</div>
                <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{mvpBrief.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{mvpBrief.summary}</p>
                <div className="mt-6">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Build now</div>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                    {mvpBrief.features.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </div>
                <div className="mt-6">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Do not build yet</div>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                    {mvpBrief.doNotBuild.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-8 grid max-w-6xl gap-8 lg:grid-cols-2">
              <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">Testing plan</div>
                <div className="mt-5 space-y-4">
                  {(experiments || []).map((experiment) => (
                    <div key={experiment.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-base font-semibold text-slate-900">{experiment.title}</div>
                          <p className="mt-2 text-sm text-slate-500">Channel: {experiment.channel}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{experiment.budget}</span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{experiment.goal}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">Collected leads</div>
                <div className="mt-5 space-y-3">
                  {leads.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">No leads yet. Publish a landing and submit a form from that page.</div>
                  ) : (
                    leads.map((lead) => (
                      <div key={lead.id} className="rounded-2xl border border-slate-200 p-4">
                        <div className="text-sm font-semibold text-slate-900">{lead.name || lead.email}</div>
                        <div className="mt-1 text-sm text-slate-500">{lead.email}</div>
                        {lead.note ? <p className="mt-3 text-sm leading-6 text-slate-600">{lead.note}</p> : null}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        <section id="how-it-works" className="bg-[#f4f8f8] px-4 py-24">
          <div className="mx-auto max-w-5xl">
            <SectionHeader
              title="What Buildly Does"
              subtitle="From idea to validated MVP plan in minutes. No code, no guesswork, no wasted runway."
            />
            <div className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
              <StepCard step="Step 1" title="Describe Your Idea" text="Enter your startup concept, target audience, and value proposition." />
              <StepCard step="Step 2" title="Understand the Market" text="Buildly estimates market urgency, pressure, wedge, and best starting channel." />
              <StepCard step="Step 3" title="Collect Signal" text="Publish one variant, drive traffic, collect leads, and watch the signal update." />
              <StepCard step="Step 4" title="Build with Confidence" text="Use the decision engine and MVP brief to move only when the signal is strong enough." />
            </div>
          </div>
        </section>

        <section className="px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <SectionHeader eyebrow="Project history" title="Come back to old ideas fast" subtitle="Your local Buildly projects stay one click away in this browser." />
            <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              {history.length === 0 ? (
                <p className="text-sm text-slate-500">No project yet. Generate your first validation flow above.</p>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleHistorySelect(item)}
                      className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-4 text-left transition hover:bg-slate-50"
                    >
                      <div>
                        <div className="text-base font-semibold text-slate-900">{item.input.idea}</div>
                        <div className="mt-1 text-sm text-slate-500">{item.input.icp} · {item.input.value}</div>
                      </div>
                      <span className="text-xs font-medium text-slate-400">{formatDate(item.updatedAt)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <span className="text-2xl font-bold tracking-tight text-cyan-600">Buildly</span>
          <p className="text-xs text-slate-500">© 2026 Buildly. Validate before you build.</p>
        </div>
      </footer>

      <PublishModal
        isOpen={publishModal.open}
        variant={publishModal.variant}
        url={publishModal.url}
        onClose={() => setPublishModal({ open: false, url: "" })}
      />
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="block text-left">
      <span className="mb-2 block text-lg font-semibold text-slate-900">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-[#fbfbfc] px-5 py-4 text-lg text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-200 focus:bg-white"
      />
    </label>
  );
}

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle: string }) {
  return (
    <div className="text-center">
      {eyebrow ? <div className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-600">{eyebrow}</div> : null}
      <h2 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-slate-950 md:text-5xl">{title}</h2>
      <p className="mx-auto mt-4 max-w-3xl text-xl leading-8 text-slate-500">{subtitle}</p>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="text-3xl font-bold tracking-tight text-slate-950">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{label}</div>
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

function PublishModal({ isOpen, onClose, url, variant }: { isOpen: boolean; onClose: () => void; url: string; variant?: string }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 px-4">
      <div className="w-full max-w-lg rounded-[28px] bg-white p-7 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-2xl font-bold tracking-tight text-slate-950">Landing published</div>
            <p className="mt-2 text-slate-500">{variant ? `${variant} variant is ready for testing.` : "Your landing page is ready for testing."}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 transition hover:text-slate-700">✕</button>
        </div>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{url}</div>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-900">Close</button>
          <a href={url} className="flex-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 px-4 py-3 text-center font-semibold text-white">Open URL</a>
        </div>
      </div>
    </div>
  );
}

function buildVariants(data: AgentPayload): LandingVariant[] {
  const base = data.generatedCopy;
  return [
    {
      id: "lead-capture",
      type: "Lead Capture",
      angle: "Capture intent from high-pain prospects with a direct promise and fast CTA.",
      headline: base.headline,
      subheadline: base.subheadline,
      cta: base.cta,
      audience: data.input.icp,
    },
    {
      id: "waitlist",
      type: "Waitlist",
      angle: "Position the product as an early-access opportunity to validate excitement and demand.",
      headline: `Join the waitlist for ${data.input.idea}`,
      subheadline: `Built for ${data.input.icp.toLowerCase()} who want ${data.input.value.toLowerCase()}`,
      cta: "Join the waitlist",
      audience: data.input.icp,
    },
    {
      id: "pre-sell",
      type: "Pre-Sell",
      angle: "Test willingness to pay with a stronger commercial framing before building the MVP.",
      headline: `Pre-order the easiest way to ${extractOutcome(data.input.value)}`,
      subheadline: `A sharper value proposition for ${data.input.icp.toLowerCase()} with a pricing-ready offer.`,
      cta: "Reserve your spot",
      audience: data.input.icp,
    },
  ];
}

function buildExperiments(data: AgentPayload): ExperimentPlan[] {
  return [
    {
      id: "exp-1",
      title: "Run first landing test",
      channel: data.validation.channel,
      goal: `Publish the strongest variant, collect the first 20 leads, and measure whether ${data.input.icp.toLowerCase()} respond to the core promise.`,
      budget: "$150",
    },
    {
      id: "exp-2",
      title: "Compare headline angles",
      channel: "Organic + paid social",
      goal: "Test which headline creates more curiosity and signups before making any MVP commitments.",
      budget: "$100",
    },
    {
      id: "exp-3",
      title: "Qualitative follow-up",
      channel: "Email replies",
      goal: "Ask every lead why they signed up, what they use today, and what would make them pay immediately.",
      budget: "$0",
    },
  ];
}

function extractOutcome(value: string) {
  return value.replace(/^help\s+/i, "").replace(/\.$/, "").toLowerCase() || "solve this painful workflow";
}

function parseTranscript(transcript: string) {
  const cleaned = transcript.trim();
  let idea = cleaned;
  let icp = "";
  let value = "";
  const targeting = cleaned.match(/targeting (.+?)(?: and helping| helping| that helps| who need|$)/i);
  if (targeting) icp = targeting[1].trim();
  const helping = cleaned.match(/(?:helping|that helps|which helps) (.+)$/i);
  if (helping) value = `Help ${helping[1].trim().replace(/\.$/, "")}.`;
  const forMatch = cleaned.match(/for (.+?)(?: that| who| helping| to|$)/i);
  if (!icp && forMatch) icp = forMatch[1].trim();
  const toMatch = cleaned.match(/to (.+)$/i);
  if (!value && toMatch) value = `Help users ${toMatch[1].trim().replace(/\.$/, "")}.`;
  idea = cleaned.replace(/\.$/, "");
  return { idea, icp, value };
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
