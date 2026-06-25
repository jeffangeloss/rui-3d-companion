"use client";

import { useEffect, useRef, useState } from "react";
import { useCompanionStore } from "@/store/companion-store";
import { useConversation } from "@/lib/use-conversation";
import { MODE_LIST, COMPANION_MODES } from "@/lib/character-prompt";
import MessageBubble from "./MessageBubble";
import ServiceStatus from "./ServiceStatus";
import VoicePlayer from "@/components/voice/VoicePlayer";
import VoiceRecorder from "@/components/voice/VoiceRecorder";

export default function ChatPanel() {
  const messages = useCompanionStore((s) => s.messages);
  const isThinking = useCompanionStore((s) => s.isThinking);
  const mode = useCompanionStore((s) => s.mode);
  const setMode = useCompanionStore((s) => s.setMode);
  const voiceEnabled = useCompanionStore((s) => s.voiceEnabled);
  const setVoiceEnabled = useCompanionStore((s) => s.setVoiceEnabled);
  const demoMode = useCompanionStore((s) => s.demoMode);
  const setDemoMode = useCompanionStore((s) => s.setDemoMode);
  const clearMessages = useCompanionStore((s) => s.clearMessages);

  const { send } = useConversation();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to the newest message.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isThinking]);

  async function handleSend() {
    const text = draft;
    setDraft("");
    await send(text);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  return (
    <div className="flex h-full flex-col border-l border-white/10 bg-stage-bg/80 backdrop-blur">
      {/* Header */}
      <header className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
        <div>
          <h2 className="text-sm font-bold text-white">
            {COMPANION_MODES[mode].emoji} Rui — {COMPANION_MODES[mode].label}
          </h2>
          <p className="text-[11px] text-white/45">
            {COMPANION_MODES[mode].description}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setDemoMode(!demoMode)}
            title="Modo demo: responde sin Ollama"
            className={`rounded-full px-2.5 py-1 text-xs transition ${
              demoMode
                ? "bg-stage-spot/25 text-stage-spot"
                : "bg-white/5 text-white/50 hover:text-white"
            }`}
          >
            🎭 Demo
          </button>
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            title="Voz de Rui (TTS)"
            className={`rounded-full px-2.5 py-1 text-xs transition ${
              voiceEnabled
                ? "bg-stage-accent/25 text-stage-accent"
                : "bg-white/5 text-white/50 hover:text-white"
            }`}
          >
            {voiceEnabled ? "🔊 Voz" : "🔈 Voz"}
          </button>
          <button
            onClick={clearMessages}
            title="Limpiar conversación"
            className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/50 transition hover:text-white"
          >
            🧹
          </button>
        </div>
      </header>

      {/* Mode selector */}
      <div className="flex flex-wrap gap-1.5 border-b border-white/10 px-3 py-2">
        {MODE_LIST.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
              m.id === mode
                ? "bg-stage-accent2/30 text-white"
                : "bg-white/5 text-white/55 hover:text-white"
            }`}
          >
            <span className="mr-1">{m.emoji}</span>
            {m.label}
          </button>
        ))}
      </div>

      {/* Live service status */}
      <div className="border-b border-white/10 px-3 py-2">
        <ServiceStatus />
        {demoMode && (
          <p className="mt-1.5 text-[10px] text-stage-spot/80">
            Modo demo activo — Rui responde con su cerebro de bolsillo, sin Ollama.
          </p>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="rui-scroll flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 && (
          <div className="mt-10 text-center text-sm text-white/40">
            🎭 El telón está arriba. Escríbele a Rui para empezar la función.
          </div>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {isThinking && (
          <div className="flex items-center gap-1 pl-1 text-stage-accent">
            <span className="rui-dot text-xl leading-none">•</span>
            <span className="rui-dot text-xl leading-none">•</span>
            <span className="rui-dot text-xl leading-none">•</span>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-end gap-2">
          {voiceEnabled && <VoiceRecorder />}
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Escríbele a Rui…  (Enter para enviar)"
            className="rui-scroll max-h-32 min-h-[2.75rem] flex-1 resize-none rounded-xl border border-white/10 bg-stage-panel px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-stage-accent/60 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={isThinking || !draft.trim()}
            className="h-11 rounded-xl bg-gradient-to-r from-stage-accent to-stage-accent2 px-4 text-sm font-semibold text-white transition disabled:opacity-40"
          >
            Enviar
          </button>
        </div>
      </div>

      {/* Non-visual: speaks Rui's replies + drives lip sync. */}
      <VoicePlayer />
    </div>
  );
}
