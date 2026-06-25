"use client";

import { useRef, useState } from "react";
import { useCompanionStore } from "@/store/companion-store";
import { pickRecorderMimeType, transcribeAudio } from "@/lib/voice";
import { useConversation } from "@/lib/use-conversation";

/**
 * Push-to-talk microphone for "voz" mode: records audio, sends it to Whisper
 * (/api/stt), then feeds the transcript into the normal conversation flow.
 */
export default function VoiceRecorder() {
  const isRecording = useCompanionStore((s) => s.isRecording);
  const setRecording = useCompanionStore((s) => s.setRecording);
  const isThinking = useCompanionStore((s) => s.isThinking);
  const { send } = useConversation();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickRecorderMimeType();
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = handleStop;

      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch (err) {
      setError(
        "No pude acceder al micrófono. Revisa los permisos del navegador."
      );
      setRecording(false);
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  async function handleStop() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    const type = recorderRef.current?.mimeType || "audio/webm";
    const blob = new Blob(chunksRef.current, { type });
    chunksRef.current = [];

    if (blob.size === 0) return;

    setBusy(true);
    try {
      const text = await transcribeAudio(blob);
      if (text) {
        await send(text);
      } else {
        setError("No se entendió el audio. Intenta de nuevo.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  const disabled = isThinking || busy;

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        disabled={disabled}
        onClick={isRecording ? stopRecording : startRecording}
        aria-label={isRecording ? "Detener grabación" : "Hablar"}
        className={`flex h-11 w-11 items-center justify-center rounded-full text-lg transition disabled:opacity-40 ${
          isRecording
            ? "animate-pulse bg-rose-500 text-white"
            : "bg-stage-accent/20 text-stage-accent hover:bg-stage-accent/30"
        }`}
      >
        {busy ? "…" : isRecording ? "⏹" : "🎙️"}
      </button>
      {error && (
        <span className="max-w-[10rem] text-center text-[10px] text-rose-300/80">
          {error}
        </span>
      )}
    </div>
  );
}
