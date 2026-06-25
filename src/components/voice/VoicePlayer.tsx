"use client";

import { useEffect, useRef, useState } from "react";
import { useCompanionStore } from "@/store/companion-store";
import {
  synthesizeSpeech,
  speakWithBrowserTTS,
  isBrowserTtsAvailable,
  BrowserTtsHandle,
} from "@/lib/voice";
import { VolumeLipSync } from "@/lib/lipsync";
import LipSyncController from "./LipSyncController";

/**
 * Speaks each new assistant message when voice is enabled, choosing an engine:
 *
 *  - **Piper** (default): high-quality local TTS via /api/tts, with accurate
 *    volume-based lip sync (VolumeLipSync + LipSyncController).
 *  - **Browser** (demo mode, or automatic fallback when Piper is unreachable):
 *    Web Speech API with a simple time-based mouth oscillation so the avatar
 *    still "talks". This makes voice work with zero setup.
 */
export default function VoicePlayer() {
  const messages = useCompanionStore((s) => s.messages);
  const voiceEnabled = useCompanionStore((s) => s.voiceEnabled);
  const demoMode = useCompanionStore((s) => s.demoMode);
  const setStatus = useCompanionStore((s) => s.setStatus);
  const setMouthOpen = useCompanionStore((s) => s.setMouthOpen);

  const [lipSync, setLipSync] = useState<VolumeLipSync | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSpokenId = useRef<string | null>(null);
  const urlRef = useRef<string | null>(null);
  const browserHandle = useRef<BrowserTtsHandle | null>(null);
  const oscRaf = useRef<number | null>(null);

  // Keep a stable audio element across renders.
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;
    return () => {
      audio.pause();
      stopBrowserSpeech();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stop everything if voice is turned off mid-utterance.
  useEffect(() => {
    if (!voiceEnabled) {
      audioRef.current?.pause();
      stopBrowserSpeech();
      setStatus("idle");
      setMouthOpen(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceEnabled]);

  function stopBrowserSpeech() {
    browserHandle.current?.cancel();
    browserHandle.current = null;
    if (oscRaf.current != null) {
      cancelAnimationFrame(oscRaf.current);
      oscRaf.current = null;
    }
  }

  /** Drive a believable mouth flap from a clock while the browser TTS speaks. */
  function startMouthOscillation() {
    const start =
      typeof performance !== "undefined" ? performance.now() : 0;
    const loop = () => {
      const now =
        typeof performance !== "undefined" ? performance.now() : 0;
      const t = (now - start) / 1000;
      const v = 0.35 + 0.3 * Math.sin(t * 11) + 0.2 * Math.sin(t * 6.5);
      setMouthOpen(Math.min(1, Math.max(0, v)));
      oscRaf.current = requestAnimationFrame(loop);
    };
    oscRaf.current = requestAnimationFrame(loop);
  }

  function speakBrowser(text: string) {
    setStatus("speaking");
    startMouthOscillation();
    browserHandle.current = speakWithBrowserTTS(text, {
      onEnd: () => {
        stopBrowserSpeech();
        setMouthOpen(0);
        setStatus("idle");
      },
      onError: () => setError("La voz del navegador no está disponible."),
    });
  }

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

    const text = stripStageDirections(last.content);
    if (!text) return;

    let cancelled = false;
    const controller = new AbortController();

    (async () => {
      setError(null);

      // Demo mode → browser TTS directly (no backend needed).
      if (demoMode) {
        if (!isBrowserTtsAvailable()) {
          setError("Tu navegador no soporta voz (Web Speech API).");
          return;
        }
        speakBrowser(text);
        return;
      }

      // Otherwise try Piper; fall back to browser TTS on any failure.
      try {
        const { url } = await synthesizeSpeech(text, controller.signal);
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }

        const audio = audioRef.current!;
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = url;
        audio.src = url;

        const ls = new VolumeLipSync(audio);
        await ls.resume();
        setLipSync(ls);
        setStatus("speaking");

        const cleanup = () => {
          setStatus("idle");
          setMouthOpen(0);
          ls.dispose();
          setLipSync(null);
        };
        audio.onended = cleanup;
        audio.onerror = cleanup;

        await audio.play().catch(() => {
          ls.dispose();
          setLipSync(null);
          // Autoplay blocked / context suspended → browser engine instead.
          speakBrowser(text);
        });
      } catch {
        if (!cancelled) speakBrowser(text);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, voiceEnabled, demoMode]);

  return (
    <>
      <LipSyncController lipSync={lipSync} />
      {error && voiceEnabled && (
        <p className="px-3 pb-1 text-[11px] text-rose-300/80">🔇 {error}</p>
      )}
    </>
  );
}

/** Strip simple *stage directions* / emojis so TTS doesn't read them aloud. */
function stripStageDirections(text: string): string {
  return text
    .replace(/\*[^*]+\*/g, " ")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}
