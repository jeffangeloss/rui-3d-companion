"use client";

import { useCompanionStore } from "@/store/companion-store";
import { STAGE_PRESETS } from "@/lib/avatar-config";

/**
 * Stage controls overlaid on the 3D scene — the heart of "escenario" mode.
 * Lets Gaby switch backgrounds/lighting presets. Pose/animation switching can
 * hook in here once .vrma clips are added.
 */
export default function AvatarControls() {
  const presetId = useCompanionStore((s) => s.presetId);
  const setPreset = useCompanionStore((s) => s.setPreset);
  const status = useCompanionStore((s) => s.status);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
      {/* Status pill */}
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white/80 backdrop-blur">
        <span
          className={`h-2 w-2 rounded-full ${
            status === "speaking"
              ? "bg-stage-accent"
              : status === "thinking"
              ? "bg-stage-spot"
              : "bg-emerald-400"
          }`}
        />
        {status === "speaking"
          ? "Hablando"
          : status === "thinking"
          ? "Pensando…"
          : "En escena"}
      </div>

      {/* Stage presets */}
      <div className="pointer-events-auto flex flex-wrap justify-end gap-1.5">
        {STAGE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => setPreset(preset.id)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur transition ${
              preset.id === presetId
                ? "border-stage-accent bg-stage-accent/20 text-white"
                : "border-white/10 bg-black/40 text-white/60 hover:text-white"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
