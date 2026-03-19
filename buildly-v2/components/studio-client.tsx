"use client";

import { useMemo, useState } from "react";
import { demoIdeas, type ValidationInput } from "../lib/buildly";

type AgentPayload = {
  input: ValidationInput;
  urgency: string;
  agentActions: string[];
  mvpScope: string[];
  generatedCopy: { headline: string; subheadline: string; cta: string };
  meta?: { provider?: string; model?: string; reasoning?: string };
  validation: {
    visitors: number;
    signups: number;
    conversion: string;
    channel: string;
    score: number;
    readiness: "Low" | "Medium" | "High";
    nextStep: string;
    insight: string;
    mvpRecommendation: string;
    features: { title: string; description: string }[];
  };
};

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
  const [status, setStatus] = useState("Voice input ready.");
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AgentPayload | null>(null);

  const readinessTone = useMemo(() => {
    const readiness = result?.validation.readiness ?? "Medium";
    if (readiness === "High") return "border-emerald-200 bg-emerald-50 text-emerald-700";
    if (readiness === "Low") return "border-rose-200 bg-rose-50 text-rose-700";
    return "border-amber-200 bg-amber-50 text-amber-700";
  }, [result]);

  const providerTone = result?.meta?.provider === "openai"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-slate-200 bg-slate-50 text-slate-700";

  async function generateLanding(nextForm?: ValidationInput) {
    const payload = nextForm ?? form;
    setLoading(true);
    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as AgentPayload;
      setResult(data);
      setStatus("Landing page generated.");
    } finally {
      setLoading(false);
    }
  }

  function loadExample(example: ValidationInput) {
    setForm(example);
    void generateLanding(example);
  }

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
      setForm((current) => ({ idea: parsed.idea || current.idea, icp: parsed.icp || current.icp, value: parsed.value || current.value }));
    };
    recognition.onerror = (event) => {
      setRecording(false);
      setStatus(`Voice error: ${event.error}`);
    };
    recognition.onend = () => {
      setRecording(false);
      setStatus("Voice captured. Generate the landing page.");
    };
    if (!recording) recognition.start();
    else recognition.stop();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(900px_420px_at_0%_0%,rgba(78,197,255,.14),transparent_55%),radial-gradient(900px_420px_at_100%_0%,rgba(255,79,179,.10),transparent_52%),#f6f8fc] px-6 pb-12 text-slate-950 md:px-8">
      <div className="mx-auto max-w-[1240px]">
        <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/70 bg-[#f6f8fc]/85 py-5 backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-[conic-gradient(from_210deg,#4ec5ff,#ff4fb3,#ffb347,#8b6cff,#4ec5ff)] shadow-soft" />
            <div>
              <div className="text-[28px] font-semibold tracking-[0.02em]">BUILDLY</div>
              <div className="text-[11px] font-semibold text-slate-500">Turn ideas into validated, growing startups</div>
            </div>
          </div>
          <div className="hidden items-center gap-6 text-sm text-slate-700 md:flex">
            <a href="#results">Preview</a>
            <a href="/dashboard">Dashboard</a>
          </div>
        </nav>

        <section className="py-14 text-center" id="prompt">
          <div className="inline-block rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-slate-600">Validate before you build</div>
          <h1 className="mx-auto mt-5 max-w-5xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] md:text-7xl">Generate a landing page from one startup idea</h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-500 md:text-[21px]">Buildly turns one project idea into a landing-page structure, validation signals, and a clear next move toward MVP generation.</p>

          <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm text-slate-700">
            <span className="rounded-full border border-slate-200 bg-white/80 px-4 py-2">Voice input</span>
            <span className="rounded-full border border-slate-200 bg-white/80 px-4 py-2">Instant landing preview</span>
            <span className="rounded-full border border-slate-200 bg-white/80 px-4 py-2">Functional AI agent</span>
          </div>

          <div className="mx-auto mt-8 max-w-5xl rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500">Type or dictate one startup idea</div>
              <div className={`rounded-full border px-4 py-2 text-sm ${recording ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-slate-50 text-slate-700"}`}>{status}</div>
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
              <Field label="Startup idea" value={form.idea} onChange={(value) => setForm({ ...form, idea: value })} />
              <Field label="ICP / target audience" value={form.icp} onChange={(value) => setForm({ ...form, icp: value })} />
              <Field label="Value proposition" value={form.value} onChange={(value) => setForm({ ...form, value })} />
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={toggleVoice} className={`inline-flex h-12 items-center justify-center rounded-full border px-5 font-semibold ${recording ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-900"}`}>{recording ? "⏺ Stop" : "🎙️ Speak"}</button>
                <button type="button" onClick={() => void generateLanding()} className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-5 font-semibold text-white">{loading ? "Generating..." : "Generate"}</button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {demoIdeas.map((example) => <button key={example.idea} type="button" onClick={() => loadExample(example)} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">{example.idea}</button>)}
            </div>
          </div>
        </section>

        <section id="results" className="py-8">
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">Generated result</div>
                <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">Landing page preview for the creator’s idea</h2>
              </div>
              {result?.meta && <div className={`rounded-full border px-3 py-2 text-sm font-semibold ${providerTone}`}>{result.meta.provider === "openai" ? `OpenAI · ${result.meta.model} · ${result.meta.reasoning}` : "Fallback local agent"}</div>}
            </div>
            <p className="mt-3 max-w-4xl text-lg leading-8 text-slate-500">Buildly generates a complete landing concept when the creator pushes a project idea.</p>

            {!result ? (
              <div className="mt-8 rounded-[24px] border border-dashed border-slate-300 p-8 text-center text-slate-500">Generate a landing page to see the full preview here.</div>
            ) : (
              <div className="mt-8 grid gap-5 lg:grid-cols-[340px_1fr]">
                <div className="grid gap-4">
                  <Metric value={String(result.validation.visitors)} label="Visitors" />
                  <Metric value={String(result.validation.signups)} label="Signups" />
                  <Metric value={result.validation.conversion} label="Conversion" />
                  <Metric value={result.validation.channel} label="Best channel" />
                  <Metric value={String(result.validation.score)} label="Validation score" />
                </div>
                <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-soft">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
                    <div className="text-xs text-slate-500">Generated landing-page preview</div>
                    <div className={`rounded-full border px-3 py-2 text-sm font-semibold ${readinessTone}`}>MVP readiness · {result.validation.readiness}</div>
                  </div>
                  <div className="bg-[radial-gradient(520px_220px_at_0%_0%,rgba(78,197,255,.14),transparent_60%),radial-gradient(520px_220px_at_100%_0%,rgba(255,79,179,.12),transparent_60%),#fff] px-7 py-10">
                    <h3 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em]">{result.generatedCopy.headline}</h3>
                    <p className="mt-4 max-w-3xl text-[17px] leading-8 text-slate-500">{result.generatedCopy.subheadline}</p>
                    <div className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">{result.generatedCopy.cta}</div>
                  </div>
                  <div className="grid gap-4 px-7 pb-6 md:grid-cols-3">
                    <PreviewMini title={`For ${result.input.icp.toLowerCase()}`} label="Focused ICP" />
                    <PreviewMini title={result.urgency} label="Market signal" />
                    <PreviewMini title={result.validation.nextStep} label="Recommended move" />
                  </div>
                  <div className="grid gap-4 px-7 pb-6 md:grid-cols-3">
                    {result.validation.features.map((feature) => <div key={feature.title} className="rounded-[20px] border border-slate-200 bg-slate-50 p-4"><strong className="block text-base">{feature.title}</strong><p className="mt-2 text-sm leading-6 text-slate-500">{feature.description}</p></div>)}
                  </div>
                  <div className="grid gap-4 px-7 pb-7 md:grid-cols-2">
                    <SectionBox title="Problem" text={extractProblem(result.input.value)} />
                    <SectionBox title="Promise" text={result.input.value} />
                  </div>
                  <div className="grid gap-4 px-7 pb-6 md:grid-cols-2">
                    <QuoteCard title="Founder signal" text={result.validation.insight} />
                    <QuoteCard title="User reaction" text={result.validation.mvpRecommendation} />
                  </div>
                  <div className="mx-7 mb-5 rounded-[22px] bg-[linear-gradient(135deg,rgba(78,197,255,.08),rgba(139,108,255,.10))] p-5">
                    <h4 className="text-2xl font-semibold tracking-[-0.03em]">Final step: Generate the MVP</h4>
                    <p className="mt-3 leading-7 text-slate-600">{result.validation.mvpRecommendation}</p>
                    <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">{result.mvpScope.map((item) => <li key={item}>{item}</li>)}</ul>
                  </div>
                  <div className="px-7 pb-8">
                    <div className="rounded-[20px] border border-slate-200 p-5">
                      <strong>Buildly AI agent</strong>
                      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">{result.agentActions.map((action) => <li key={action}>{action}</li>)}</ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block text-left text-sm font-semibold text-slate-700"><span className="mb-2 block">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none" /></label>;
}
function Metric({ value, label }: { value: string; label: string }) { return <div className="rounded-[22px] border border-slate-200 p-5"><div className="text-3xl font-semibold tracking-[-0.04em]">{value}</div><div className="mt-1 text-sm text-slate-500">{label}</div></div>; }
function PreviewMini({ title, label }: { title: string; label: string }) { return <div className="rounded-[20px] border border-slate-200 p-4"><strong className="block">{title}</strong><div className="mt-2 text-xs text-slate-500">{label}</div></div>; }
function SectionBox({ title, text }: { title: string; text: string }) { return <div className="rounded-[18px] border border-slate-200 p-5"><strong className="block">{title}</strong><p className="mt-2 leading-7 text-slate-500">{text}</p></div>; }
function QuoteCard({ title, text }: { title: string; text: string }) { return <div className="rounded-[20px] border border-slate-200 p-5"><strong className="block">{title}</strong><p className="mt-3 leading-7 text-slate-500">“{text}”</p></div>; }
function parseTranscript(transcript: string) { const cleaned = transcript.trim(); let idea = cleaned; let icp = ""; let value = ""; const targeting = cleaned.match(/targeting (.+?)(?: and helping| helping| that helps| who need|$)/i); if (targeting) icp = targeting[1].trim(); const helping = cleaned.match(/(?:helping|that helps|which helps) (.+)$/i); if (helping) value = `Help ${helping[1].trim().replace(/\.$/, "")}.`; const forMatch = cleaned.match(/for (.+?)(?: that| who| helping| to|$)/i); if (!icp && forMatch) icp = forMatch[1].trim(); const toMatch = cleaned.match(/to (.+)$/i); if (!value && toMatch) value = `Help users ${toMatch[1].trim().replace(/\.$/, "")}.`; idea = cleaned.replace(/\.$/, ""); return { idea, icp, value }; }
function extractProblem(value: string) { const cleaned = value.replace(/^Help\s+/i, "").replace(/^Give\s+/i, "").trim(); return cleaned ? `${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)}` : "Users struggle with a painful workflow."; }
