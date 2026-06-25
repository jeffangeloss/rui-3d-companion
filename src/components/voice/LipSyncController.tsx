"use client";

import { useEffect } from "react";
import { VolumeLipSync } from "@/lib/lipsync";
import { useCompanionStore } from "@/store/companion-store";

/**
 * While mounted, samples the given VolumeLipSync once per animation frame and
 * pushes the mouth-openness value into the store (read by the 3D AvatarModel).
 * Mounted by <VoicePlayer/> only while Rui is actually speaking.
 */
export default function LipSyncController({
  lipSync,
}: {
  lipSync: VolumeLipSync | null;
}) {
  const setMouthOpen = useCompanionStore((s) => s.setMouthOpen);

  useEffect(() => {
    if (!lipSync) return;
    let raf = 0;
    let active = true;

    const loop = () => {
      if (!active) return;
      setMouthOpen(lipSync.sample());
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      active = false;
      cancelAnimationFrame(raf);
      setMouthOpen(0);
    };
  }, [lipSync, setMouthOpen]);

  return null;
}
