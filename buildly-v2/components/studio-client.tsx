"use client";

import { useMemo, useState } from "react";
import { demoIdeas, type ValidationInput } from "../lib/buildly";

type AgentPayload = {
  input: ValidationInput;
  urgency: string;
  landingSections: string[];
  agentActions: string[];
  mvpScope: string[];
  generatedCopy: { headline: string; subheadline: string; cta: string };
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

type SpeechRecognitionResultLike = ArrayLike<{ transcript: string }>;

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: null | (() => void);
  onend: null | (() => void);
  onerror: null | ((event: { error: string }) => void);
  onresult: null | ((event: SpeechRecognitionEventLike) => void);
};

const initialInput = demoIdeas[0];

export default function StudioClient() {
  const [form, setForm] = useState<ValidationInput>(initialInput);
  const [status, setStatus] = useState("Voice input ready.");
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creatingCanva, setCreatingCanva] = useState(false);
  const [result, setResult] = useState<AgentPayload | null>(null);
  const [canvaResult, setCanvaResult] = useState<{ editUrl?: string; viewUrl?: string; error?: string } | null>(null);

  const readinessTone = useMemo(() => {
    const readiness = result?.validation.readiness ?? "Medium";
    if (readiness === "High") return "border-emerald-200 bg-emerald-50 text-emerald-700";
    if (readiness === "Low") return "border-rose-200 bg-rose-50 text-rose-700";
    return "border-amber-200 bg-amber-50 text-amber-700";
  }, [result]);

  async function generateLanding(nextForm?: ValidationInput) {
    const payload = nextForm ?? form;
    setLoading(true);
    setCanvaResult(null);
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
      setLoading(true);
    }
  }

  async function createCanvaDraft() {
    if (!result) return;
    setCreatingCanva(true);
    setCanvaResult(null);
    try {
      const response = await fetch("/api/canva/create-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: `${result.input.idea} - Buildly draft` }),
      });
      const data = await response.json();
      setCanvaResult({ editUrl: data.editUrl, viewUrl: data.viewUrl, error: data.error });
    } finally {
      setCreatingCanva(false);
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
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }
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
            <a href="#how">How it works</a>
            <a href="/dashboard">Dashboard</a>
            <a href="#prompt" className="rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">Try an idea</a>
          </div>
        </nav>

        <section className="py-14 text-center" id="prompt">
          <div className="inline-block rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-slate-600">
            Validate before you build
          </div>
          <h1 className="mx-auto max-w-5xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] md:text-7xl">
            Generate a landing page from one startup idea
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-500 md:text-[21px]">
            Buildly takes one project idea, turns it into a real landing-page structure, gives validation signals,
            and tells the founder whether to keep testing or move into MVP generation.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a href="#results" className="rounded-full bg-slate-950 px-6 py-3 font-semibold text-white">See preview</a>
            <a href="#how" className="rounded-full border border-slate-200 bg-white px-6 py-3 font-semibold">How it works</a>
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm text-slate-700">
            <span className="rounded-full border border-slate-200 bg-white/80 px-4 py-2">Voice input</span>
            <span className="rounded-full border border-slate-200 bg-white/80 px-4 py-2">Instant landing preview</span>
            <span className="rounded-full border border-slate-200 bg-white/80 px-4 py-2">Functional AI agent</span>
          </div>
          <div className="mx-auto mt-8 max-w-5xl 