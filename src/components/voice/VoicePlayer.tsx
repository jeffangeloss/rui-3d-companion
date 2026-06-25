"use client";

import { useEffect, useRef, useState } from "react";
import { useCompanionStore } from "@/store/companion-store";
import { synthesizeSpeech } from "@/lib/voice";
import { VolumeLipSync } from "@/lib/lipsync";
import LipSyncController from "./LipSyncController";

/**
 * Watches the transcript and, when voice is enabled, speaks each new assistant
 * message with Piper (via /api/tts). During playback it builds a VolumeLipSync
 * graph and hands it to <LipSyncController/> so Rui's mouth tracks the audio.
 */
export default function VoicePlayer() {
  const messages = useCompanionStore((s) => s.messages);
  const voiceEnabled = useCompanionStore((s) => s.voiceEnabled);
  const setStatus = useCompanionStore((s) => s.setStatus);
  const setMouthOpen = useCompanionStore((s) => s.setMouthOpen);

  const [lipSync, setLipSync] = useState<VolumeLipSync | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSpokenId = useRef<string | null>(null);
  const urlRef = useRef<string | null>(null);

  // Keep a stable audio element across renders.
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;
    return () => {
      audio.pause();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  useEffect(() => {
    if (!voiceEnabled) return;

    const last = messages[messages.length - 1];
    if (
      !last ||
      last.role !== "assistant" ||
      !last.content.trim() ||
      last.id === lastSpokenId.current
    ) {
      return;
    }
    lastSpokenId.current = last.id;

    let cancelled = false;
    const controller = new AbortController();

    (async () => {
      try {
        setError(null);
        const { url } = await synthesizeSpeech(
          stripStageDirections(last.content),
          controller.signal
        );
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }

        const audio = audioRef.current!;
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = url;
        audio.src = url;

        // Build (or rebuild) the lip-sync graph for this element.
        const ls = new VolumeLipSync(audio);
        await ls.resume();
        setLipSync(ls);
        setStatus("speaking");

        audio.onended = () => {
          setStatus("idle");
          setMouthOpen(0);
          ls.dispose();
          setLipSync(null);
        };
        audio.onerror = () => {
          setStatus("idle");
          setMouthOpen(0);
          ls.dispose();
          setLipSync(null);
        };

        await audio.play().catch((err) => {
          // Autoplay blocked or context suspended.
          setError("No pude reproducir la voz (¿permiso de audio?).");
          setStatus("idle");
          ls.dispose();
          setLipSync(null);
          throw err;
        });
      } catch (err) {
        if (!cancelled) {
          setStatus("idle");
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [messages, voiceEnabled, setStatus, setMouthOpen]);

  return (
    <>
      <LipSyncController lipSync={lipSync} />
      {error && voiceEnabled && (
        <p className="px-3 pb-1 text-[11px] text-rose-300/80">🔇 {error}</p>
      )}
    </>
  );
}

/** Strip simple *stage directions* / emojis so Piper doesn't read them aloud. */
function stripStageDirections(text: string): string {
  return text
    .replace(/\*[^*]+\*/g, " ")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}
