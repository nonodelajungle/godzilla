"use client";

import { useMemo, useState } from "react";
import { demoIdeas, type ValidationInput } from "../lib/buildly";

type AgentPayload = {
  input: ValidationInput;
  urgency: string;
  agentActions: string[];
  mvpScope: string[];
  landingSections?: string[];
  generatedCopy: { headline: string; subheadline: string; cta: string };
  meta?: { provider?: string; model?: string; reasoning?: string; error?: string };
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
    : "border-rose-200 bg-rose-50 text-rose-700";

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
      setStatus("Voice captured. Generate the landing page.");
    };
    if (!recording) recognition.start();
    else recognition.stop();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(800px_300px_at_0%_0%,rgba(121,173,255,.18),transparent_60%),radial-gradient(700px_260px_at_100%_0%,rgba(255,88,185,.12),transparent_55%),#f7f8fc] text-slate-950">
      <div className="mx-auto max-w-7xl px-5 pb-16 md:px-8">
        <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/70 bg-[#f7f8fc]/85 py-5 backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-2xl bg-[conic-gradient(from_210deg,#4ec5ff,#ff4fb3,#ffb347,#8b6cff,#4ec5ff)] shadow-[0_12px_30px_rgba(80,120,255,.18)]" />
            <div>
              <div className="text-[28px] font-semibold tracking-[0.02em]">BUILDLY</div>
              <div className="text-[11px] font-semibold text-slate-500">Turn ideas into validated, growing startups</div>
            </div>
          </div>
          <div className="hidden items-center gap-6 text-sm text-slate-700 md:flex">
            <a href="#generator">Generator</a>
            <a href="#preview">Preview</a>
            <a href="#pricing">Pricing</a>
          </div>
        </nav>

        <section className="pt-14 md:pt-20">
          <div className="mx-auto max-w-5xl text-center">
            <div className="inline-flex rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-600 shadow-sm">
              Validate before you build
            </div>
            <h1 className="mx-auto mt-6 max-w-5xl text-5xl font-semibold tracking-[-0.06em] md:text-7xl">
              Validate startup ideas before you build anything
            </h1>
            <p className="mx-auto mt-5 max-w-4xl text-lg leading-8 text-slate-600 md:text-[21px]">
              Buildly turns your idea into a landing page, tests it on real users through social channels,
              and tells you exactly what to build next.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-slate-700">
              <Tag>Voice input</Tag>
              <Tag>Landing generation</Tag>
              <Tag>Validation signal</Tag>
              <Tag>MVP scoping</Tag>
            </div>
          </div>
        </section>

        <section id="generator" className="mt-12 grid gap-6 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,.08)] md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">One-page MVP studio</div>
                <div className="mt-1 text-sm text-slate-500">Describe the startup, generate the landing, and decide what to build.</div>
              </div>
              <div className={`rounded-full border px-4 py-2 text-sm ${recording ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
                {status}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <Field label="Startup idea" value={form.idea} onChange={(value) => setForm({ ...form, idea: value })} />
              <Field label="ICP / target audience" value={form.icp} onChange={(value) => setForm({ ...form, icp: value })} />
              <Field label="Value proposition" value={form.value} onChange={(value) => setForm({ ...form, value })} />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={toggleVoice} className={`inline-flex h-12 items-center justify-center rounded-full border px-5 font-semibold ${recording ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-900"}`}>
                {recording ? "⏺ Stop" : "🎙️ Speak"}
              </button>
              <button type="button" onClick={() => void generateLanding()} className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-6 font-semibold text-white shadow-[0_12px_24px_rgba(15,23,42,.18)]">
                {loading ? "Generating..." : "Generate landing"}
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {demoIdeas.map((example) => (
                <button key={example.idea} type="button" onClick={() => loadExample(example)} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition hover:bg-white">
                  {example.idea}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#111827,#0f172a_65%,#1f2a44)] p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,.22)] md:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-white/90">What Buildly does</div>
                <div className="mt-1 text-sm text-white/60">Validate, test, decide, then build.</div>
              </div>
              <div className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs text-white/70">Lovable-like single page</div>
            </div>
            <div className="mt-6 grid gap-3">
              <DarkCard title="Validate" text="Turn a raw idea into a landing-page angle and a clear hypothesis." />
              <DarkCard title="Test" text="Run experiments through social and paid channels where attention already exists." />
              <DarkCard title="Generate MVP" text="Once the signal is real, move from validation into the first product version." />
            </div>
          </div>
        </section>

        <section id="preview" className="mt-8 rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,.08)] md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500">Generated landing preview</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] md:text-4xl">A sharper, more realistic landing-page preview</h2>
            </div>
            {result?.meta && (
              <div className={`rounded-full border px-3 py-2 text-sm font-semibold ${providerTone}`}>
                {result.meta.provider === "openai"
                  ? `OpenAI · ${result.meta.model} · ${result.meta.reasoning}`
                  : `Fallback · ${result.meta.error || "unknown_error"}`}
              </div>
            )}
          </div>

          {!result ? (
            <div className="mt-8 rounded-[28px] border border-dashed border-slate-300 p-10 text-center text-slate-500">
              Generate a landing to render the full preview here.
            </div>
          ) : (
            <div className="mt-8 grid gap-6 xl:grid-cols-[330px_1fr]">
              <div className="grid gap-4">
                <Metric value={String(result.validation.visitors)} label="Visitors" />
                <Metric value={String(result.validation.signups)} label="Signups" />
                <Metric value={result.validation.conversion} label="Conversion" />
                <Metric value={result.validation.channel} label="Best channel" />
                <Metric value={String(result.validation.score)} label="Validation score" />
                <div className={`rounded-[24px] border px-5 py-4 text-sm font-semibold ${readinessTone}`}>
                  MVP readiness · {result.validation.readiness}
                </div>
              </div>

              <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-[#fbfcff] shadow-[0_16px_50px_rgba(15,23,42,.08)]">
                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 text-sm text-slate-500">
                  <span>Live landing canvas</span>
                  <span>{result.input.icp}</span>
                </div>

                <div className="bg-[radial-gradient(650px_260px_at_0%_0%,rgba(78,197,255,.16),transparent_60%),radial-gradient(700px_260px_at_100%_0%,rgba(255,79,179,.14),transparent_60%),linear-gradient(180deg,#ffffff,#f8fbff)] px-7 py-10 md:px-10 md:py-12">
                  <div className="max-w-4xl">
                    <div className="inline-flex rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                      For {result.input.icp.toLowerCase()}
                    </div>
                    <h3 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
                      {result.generatedCopy.headline}
                    </h3>
                    <p className="mt-5 max-w-3xl text-[17px] leading-8 text-slate-600 md:text-lg">
                      {result.generatedCopy.subheadline}
                    </p>
                    <div className="mt-7 flex flex-wrap gap-3">
                      <button className="rounded-full bg-slate-950 px-6 py-3 font-semibold text-white shadow-[0_12px_24px_rgba(15,23,42,.18)]">
                        {result.generatedCopy.cta}
                      </button>
                      <button className="rounded-full border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-800">
                        See validation plan
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 border-t border-slate-200 bg-white px-7 py-6 md:grid-cols-3 md:px-10">
                  <PreviewMini title={result.urgency} label="Market signal" />
                  <PreviewMini title={result.validation.nextStep} label="Recommended move" />
                  <PreviewMini title={`Channel · ${result.validation.channel}`} label="Distribution" />
                </div>

                <div className="grid gap-4 px-7 pb-6 md:grid-cols-3 md:px-10">
                  {result.validation.features.map((feature) => (
                    <FeaturePreview key={feature.title} title={feature.title} text={feature.description} />
                  ))}
                </div>

                <div className="grid gap-4 border-t border-slate-200 bg-white px-7 py-6 md:grid-cols-2 md:px-10">
                  <SectionBox title="Problem" text={extractProblem(result.input.value)} />
                  <SectionBox title="Promise" text={result.input.value} />
                </div>

                <div className="grid gap-4 px-7 pb-6 md:grid-cols-2 md:px-10">
                  <QuoteCard title="Founder signal" text={result.validation.insight} />
                  <QuoteCard title="User reaction" text={result.validation.mvpRecommendation} />
                </div>

                <div className="mx-7 mb-7 rounded-[26px] border border-slate-200 bg-white p-5 md:mx-10">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Buildly AI recommendations</div>
                      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
                        {result.agentActions.map((action) => <li key={action}>{action}</li>)}
                      </ul>
                    </div>
                    <div className="min-w-[220px] rounded-[20px] bg-[linear-gradient(135deg,rgba(78,197,255,.10),rgba(139,108,255,.10))] p-4">
                      <div className="text-sm font-semibold text-slate-900">MVP scope</div>
                      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
                        {result.mvpScope.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="mt-8 grid gap-8">
          <BlockSection
            title="What Buildly does"
            subtitle="Validate, test, decide, then build"
            items={[
              ["Validate", "Turn a raw idea into a landing-page angle and a clear hypothesis."],
              ["Test", "Run experiments through social and paid channels where attention already exists."],
              ["Generate MVP", "Once the signal is real, move from validation into the first product version."],
            ]}
          />

          <BlockSection
            title="How it works"
            subtitle="From idea to first product direction"
            items={[
              ["1. Describe the idea", "Buildly turns the startup concept, ICP, and promise into a sharp validation angle."],
              ["2. Generate the page", "The app produces a convincing one-page landing preview you can react to immediately."],
              ["3. Read the signal", "You get positioning clues, recommended channel, and an MVP readiness score."],
              ["4. Build with focus", "Once the signal is good enough, Buildly tells you what the first product should include."],
            ]}
          />

          <section id="pricing" className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,.08)] md:p-8">
            <div className="max-w-2xl">
              <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500">Pricing</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Simple pricing for founder progress</h2>
              <p className="mt-3 text-slate-600">Pick the plan that matches your validation speed.</p>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <PriceCard title="Starter" price="$29" description="Validate your first ideas and generate early landing concepts." items={["Idea validation", "Landing-page generation", "Basic recommendations"]} />
              <PriceCard title="Growth" price="$99" description="Run more experiments, test better angles, and tighten your positioning." items={["Channel recommendations", "Smarter validation loops", "Stronger decision support"]} featured />
              <PriceCard title="Pro" price="$299" description="Move from validated demand into a first product scope." items={["MVP generation path", "Advanced agent guidance", "Priority support"]} />
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-left text-sm font-semibold text-slate-700">
      <span className="mb-2 block">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-slate-300 focus:bg-white" />
    </label>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return <div className="rounded-[24px] border border-slate-200 bg-white p-5"><div className="text-3xl font-semibold tracking-[-0.04em]">{value}</div><div className="mt-1 text-sm text-slate-500">{label}</div></div>;
}
function PreviewMini({ title, label }: { title: string; label: string }) {
  return <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4"><strong className="block text-slate-900">{title}</strong><div className="mt-2 text-xs text-slate-500">{label}</div></div>;
}
function SectionBox({ title, text }: { title: string; text: string }) {
  return <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5"><strong className="block text-slate-900">{title}</strong><p className="mt-2 leading-7 text-slate-600">{text}</p></div>;
}
function QuoteCard({ title, text }: { title: string; text: string }) {
  return <div className="rounded-[24px] border border-slate-200 bg-white p-5"><strong className="block text-slate-900">{title}</strong><p className="mt-3 leading-7 text-slate-600">“{text}”</p></div>;
}
function FeaturePreview({ title, text }: { title: string; text: string }) {
  return <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm"><div className="text-base font-semibold text-slate-900">{title}</div><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>;
}
function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-slate-200 bg-white/80 px-4 py-2">{children}</span>;
}
function DarkCard({ title, text }: { title: string; text: string }) {
  return <div className="rounded-[24px] border border-white/10 bg-white/5 p-4"><div className="text-sm font-semibold text-white">{title}</div><p className="mt-2 text-sm leading-6 text-white/65">{text}</p></div>;
}
function BlockSection({ title, subtitle, items }: { title: string; subtitle: string; items: [string, string][] }) {
  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,.08)] md:p-8">
      <div className="max-w-3xl">
        <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500">{title}</div>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{subtitle}</h2>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map(([itemTitle, itemText]) => (
          <div key={itemTitle} className="rounded-[24px] border border-slate-200 p-5">
            <div className="text-lg font-semibold text-slate-900">{itemTitle}</div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{itemText}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
function PriceCard({ title, price, description, items, featured = false }: { title: string; price: string; description: string; items: string[]; featured?: boolean }) {
  return (
    <div className={`rounded-[26px] border p-5 ${featured ? "border-violet-300 bg-violet-50/50" : "border-slate-200 bg-white"}`}>
      <div className="text-xl font-semibold text-slate-900">{title}</div>
      <div className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{price}<span className="ml-1 text-base font-medium text-slate-500">/ month</span></div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
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
function extractProblem(value: string) {
  const cleaned = value.replace(/^Help\s+/i, "").replace(/^Give\s+/i, "").trim();
  return cleaned ? `${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)}` : "Users struggle with a painful workflow.";
}
