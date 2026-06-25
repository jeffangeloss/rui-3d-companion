import Link from "next/link";
import { MODE_LIST } from "@/lib/character-prompt";

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
      {/* Stage glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 animate-spot-pulse"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, #2a1d3a 0%, #140d1f 55%, #0a0710 100%)",
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
        <span className="mb-4 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.25em] text-stage-spot">
          Private companion
        </span>

        <h1 className="bg-gradient-to-r from-stage-accent via-stage-spot to-stage-accent2 bg-clip-text text-6xl font-black text-transparent drop-shadow-sm">
          Rui
        </h1>

        <p className="mt-5 max-w-xl text-lg text-white/70">
          Un compañero virtual teatral, inventor y carismático. Te acompaña para
          estudiar, descansar o simplemente conversar — y todo corre{" "}
          <span className="text-white">en tu propia máquina</span>.
        </p>

        <Link
          href="/companion"
          className="mt-9 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-stage-accent to-stage-accent2 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-stage-accent2/30 transition hover:scale-[1.03] hover:shadow-stage-accent2/50"
        >
          🎭 Entrar al escenario
        </Link>

        <div className="mt-14 grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
          {MODE_LIST.map((mode) => (
            <div
              key={mode.id}
              className="rounded-xl border border-white/10 bg-stage-panel/60 p-4 text-left backdrop-blur"
            >
              <div className="text-2xl">{mode.emoji}</div>
              <div className="mt-1 font-semibold text-white">{mode.label}</div>
              <div className="mt-1 text-xs leading-snug text-white/55">
                {mode.description}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-12 max-w-md text-[11px] leading-relaxed text-white/35">
          Private fan project for personal use only. No official Project SEKAI
          assets, voices, models, or copyrighted materials are included.
        </p>
      </div>
    </main>
  );
}
