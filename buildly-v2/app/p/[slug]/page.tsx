"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getLandingSignal, getPublishedLanding, getSessionId, submitLead, trackLandingEvent } from "../../../lib/local-demo";

export default function PublishedLandingPage() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const [landing, setLanding] = useState(() => (slug ? getPublishedLanding(slug) : null));
  const [signal, setSignal] = useState(() => (slug ? getLandingSignal(slug) : null));
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const nextLanding = getPublishedLanding(slug);
    setLanding(nextLanding);
    if (!nextLanding) return;
    trackLandingEvent(slug, "page_view", getSessionId(slug));
    setSignal(getLandingSignal(slug));
  }, [slug]);

  const stats = useMemo(() => ({
    views: signal?.views || 0,
    cta: signal?.ctaClicks || 0,
    leads: signal?.leads || 0,
    conversion: signal?.conversion || 0,
  }), [signal]);

  if (!landing) {
    return (
      <main className="min-h-screen bg-[#f8fbfc] px-4 py-20">
        <div className="mx-auto max-w-2xl rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Landing not found</h1>
          <p className="mt-4 text-slate-500">This published page exists only in local demo mode on the browser that created it.</p>
          <a href="/" className="mt-6 inline-flex rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white">Back to Buildly</a>
        </div>
      </main>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = submitLead(slug, { email, name, note });
    if (!result.ok) {
      setFeedback(result.error);
      return;
    }
    setFeedback("Lead captured. This landing is now collecting real local demo signal.");
    setEmail("");
    setName("");
    setNote("");
    setSignal(getLandingSignal(slug));
  }

  function handleCtaClick() {
    trackLandingEvent(slug, "cta_click", getSessionId(slug));
    setSignal(getLandingSignal(slug));
    const element = document.getElementById("lead-form");
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(45,197,186,0.12),transparent_35%),linear-gradient(180deg,#f8fcfc,#ffffff)] px-4 pb-20 pt-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4 rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div>
            <div className="text-sm font-semibold text-cyan-600">Buildly demo publish</div>
            <div className="mt-1 text-sm text-slate-500">Local autonomous mode · idea → publish → leads → signal</div>
          </div>
          <a href="/" className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Open studio</a>
        </div>

        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="rounded-[36px] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.07)] md:p-10">
            <div className="inline-flex rounded-full bg-cyan-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
              {landing.variantType}
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-bold tracking-[-0.05em] text-slate-950 md:text-6xl">
              {landing.headline}
            </h1>
            <p className="mt-5 max-w-2xl text-xl leading-9 text-slate-500">
              {landing.subheadline}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={handleCtaClick} className="rounded-2xl bg-slate-950 px-6 py-4 text-base font-semibold text-white shadow-sm">
                {landing.cta}
              </button>
              <span className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
                Audience · {landing.audience}
              </span>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                ["Angle", landing.angle],
                ["ICP", landing.icp],
                ["Value", landing.valueProp],
              ].map(([title, text]) => (
                <div key={title} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</div>
                  <div className="mt-3 text-sm leading-7 text-slate-700">{text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Live signal on this landing</div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <StatCard label="Views" value={String(stats.views)} />
                <StatCard label="CTA clicks" value={String(stats.cta)} />
                <StatCard label="Leads" value={String(stats.leads)} />
                <StatCard label="Conversion" value={`${stats.conversion}%`} />
              </div>
            </div>

            <div id="lead-form" className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-2xl font-bold tracking-tight text-slate-950">Join the waitlist</div>
              <p className="mt-2 text-sm leading-6 text-slate-500">Submit your details to simulate real lead capture and update Buildly’s decision engine.</p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <Input value={name} onChange={setName} placeholder="Your name" />
                <Input value={email} onChange={setEmail} placeholder="Your email" type="email" />
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="What made you interested?"
                  className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-200 focus:bg-white"
                />
                <button type="submit" className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 px-5 py-4 text-base font-semibold text-white">
                  Submit lead
                </button>
              </form>
              <p className="mt-4 text-sm text-slate-500">{feedback || "Local demo mode: this lead is stored in your browser and updates the product signal instantly."}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-2xl font-bold tracking-tight text-slate-950">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (value: string) => void; placeholder: string; type?: string }) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      type={type}
      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-200 focus:bg-white"
    />
  );
}
