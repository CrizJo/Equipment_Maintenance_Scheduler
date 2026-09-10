import { ArrowRight, CalendarCheck, ClipboardList, Search, Shield, Wrench } from "lucide-react";
import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: Wrench,
    title: "Know every machine",
    text: "Name, location, technician, and status in one place — like a shop-floor inventory that stays up to date.",
  },
  {
    icon: CalendarCheck,
    title: "Never miss a service",
    text: "Set repeating maintenance the way you set reminders. Fixed intervals auto-plan the next visit after each job.",
  },
  {
    icon: ClipboardList,
    title: "Full service history",
    text: "See what was done, what is coming, and what is overdue. Managers can plan; technicians can close their tasks.",
  },
  {
    icon: Search,
    title: "Find anything fast",
    text: "Search by machine, location, or technician instead of flipping through paper logs.",
  },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fbfbfd] text-[#1d1d1f]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(59,91,219,0.22),transparent_68%)]" />
        <div className="absolute top-40 -left-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,184,108,0.28),transparent_70%)]" />
        <div className="absolute top-72 right-[-80px] h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(110,86,207,0.18),transparent_70%)]" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#3b5bdb] text-white shadow-lg shadow-indigo-500/25">
            <Wrench size={18} />
          </div>
          <span className="text-[17px] font-semibold tracking-tight">EquipSync</span>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black"
        >
          Get Started
          <ArrowRight size={16} />
        </Link>
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-4xl px-6 pb-16 pt-16 text-center sm:pt-24">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-medium text-[#3b5bdb] shadow-sm ring-1 ring-black/5">
            <Shield size={14} />
            Built for shops, labs, and facilities
          </p>
          <h1 className="mt-7 text-[44px] font-semibold leading-[1.05] tracking-tight sm:text-7xl">
            Keep your equipment
            <span className="mt-2 block bg-gradient-to-r from-[#3b5bdb] via-[#5b6cff] to-[#7c5cbf] bg-clip-text text-transparent">
              always running.
            </span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-[#6e6e73] sm:text-[21px] sm:leading-8">
            Track machines, plan preventive maintenance, and cut surprise downtime — all in one
            calm, clear workspace. No passwords. Pick a role and start.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-8 py-4 text-[15px] font-semibold text-white shadow-xl shadow-black/15 transition hover:scale-[1.02] hover:bg-black"
            >
              Launch Dashboard
              <ArrowRight size={18} />
            </Link>
            <p className="text-sm text-[#86868b]">No setup required · Demo data is ready</p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-20">
          <div className="rounded-[32px] border border-white/60 bg-white/70 p-4 shadow-[0_30px_80px_rgba(29,29,31,0.10)] backdrop-blur-xl sm:p-6">
            <div className="rounded-3xl bg-[#f5f5f7] p-5 sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#86868b]">Today on the floor</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">8 machines in view</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  5 operational
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <PreviewCard name="CNC Milling Machine" status="Operational" tone="green" next="Sep 10" />
                <PreviewCard name="3D Printer — Prusa XL" status="Maintenance" tone="amber" next="Aug 18" />
                <PreviewCard name="Toyota 8FG Forklift" status="Out of service" tone="red" next="Sep 12" />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <p className="text-center text-sm font-medium text-[#3b5bdb]">Why it helps</p>
          <h2 className="mt-3 text-center text-3xl font-semibold tracking-tight sm:text-4xl">
            Preventive care, without the paperwork pile.
          </h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="rounded-[28px] bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-black/4"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef1ff] text-[#3b5bdb]">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight">{feature.title}</h3>
                  <p className="mt-2 text-[15px] leading-7 text-[#6e6e73]">{feature.text}</p>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

function PreviewCard({ name, status, tone, next }) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className="rounded-2xl bg-white p-4 text-left shadow-sm">
      <p className="font-semibold tracking-tight">{name}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${tones[tone]}`}>{status}</span>
        <span className="text-xs text-[#86868b]">Next {next}</span>
      </div>
    </div>
  );
}
