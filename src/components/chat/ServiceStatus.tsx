"use client";

import { useEffect, useState } from "react";

type ServiceState = "up" | "down" | "binary" | "unconfigured";

interface HealthReport {
  ollama: { state: ServiceState; model: string; detail?: string };
  piper: { state: ServiceState; detail?: string };
  whisper: { state: ServiceState; detail?: string };
}

const DOT: Record<ServiceState, string> = {
  up: "bg-emerald-400",
  down: "bg-rose-500",
  binary: "bg-amber-400",
  unconfigured: "bg-white/30",
};

function Pill({
  label,
  state,
  title,
}: {
  label: string;
  state: ServiceState;
  title?: string;
}) {
  return (
    <span
      title={title}
      className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[10px] text-white/60"
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[state] ?? "bg-white/30"}`} />
      {label}
    </span>
  );
}

/**
 * Small live indicator of the local services (Ollama / Piper / Whisper).
 * Polls /api/health periodically; failures are shown as red dots, not errors.
 */
export default function ServiceStatus() {
  const [health, setHealth] = useState<HealthReport | null>(null);

  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        const data = (await res.json()) as HealthReport;
        if (active) setHealth(data);
      } catch {
        if (active) setHealth(null);
      }
    };
    check();
    const id = setInterval(check, 20000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  if (!health) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-white/30">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/30" />
        comprobando servicios…
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Pill
        label={`IA ${health.ollama.model}`}
        state={health.ollama.state}
        title={
          health.ollama.state === "up"
            ? "Ollama conectado"
            : `Ollama no disponible${health.ollama.detail ? ` · ${health.ollama.detail}` : ""}`
        }
      />
      <Pill
        label="Voz"
        state={health.piper.state}
        title={`Piper: ${health.piper.state}${health.piper.detail ? ` · ${health.piper.detail}` : ""}`}
      />
      <Pill
        label="Oído"
        state={health.whisper.state}
        title={`Whisper: ${health.whisper.state}${health.whisper.detail ? ` · ${health.whisper.detail}` : ""}`}
      />
    </div>
  );
}
