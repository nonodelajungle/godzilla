import type { ReactNode } from "react";

export function PremiumShell({
  section,
  title,
  subtitle,
  children,
  accent = "emerald",
}: {
  section: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  accent?: "emerald" | "cyan" | "violet";
}) {
  const accentTone = accent === "violet"
    ? "bg-violet-50 text-violet-700"
    : accent === "cyan"
      ? "bg-cyan-50 text-cyan-700"
      : "bg-emerald-50 text-emerald-700";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,196,190,0.10),transparent_28%),radial-gradient(circle_at_top_right,rgba(121,103,255,0.10),transparent_28%),linear-gradient(180deg,#f8fcfc_0%,#f6f8fb_48%,#ffffff_100%)] text-slate-900">
      <div className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <a href="/founder-os" className="text-2xl font-bold tracking-tight text-slate-950">Buildly</a>
            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${accentTone}`}>{section}</span>
          </div>
          <div className="hidden flex-wrap items-center gap-2 md:flex">
            <NavChip href="/founder-os" label="Founder OS" />
            <NavChip href="/studio" label="Studio" />
            <NavChip href="/dashboard" label="Validate" />
            <NavChip href="/leads" label="Leads" />
            <NavChip href="/capital" label="Capital" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 rounded-[28px] border border-slate-200 bg-white/80 p-7 shadow-[0_20px_70px_rgba(15,23,42,0.06)] backdrop-blur">
          <div className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${accentTone}`}>{section}</div>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-slate-950 md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-4xl text-base leading-8 text-slate-600 md:text-lg">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function NavChip({ href, label }: { href: string; label: string }) {
  return <a href={href} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:shadow-sm">{label}</a>;
}
