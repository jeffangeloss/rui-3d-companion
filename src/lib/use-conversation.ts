"use client";

import { useCallback } from "react";
import { useCompanionStore } from "@/store/companion-store";

/**
 * Orchestrates one conversational turn: append the user's message, ask Ollama
 * (via /api/chat) with the current mode, and append Rui's reply.
 *
 * Speaking the reply out loud is handled separately by <VoicePlayer/>, which
 * watches the transcript — so both typed and spoken input flow through here.
 */
export function useConversation() {
  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const store = useCompanionStore.getState();
    if (store.isThinking) return;

    store.addMessage("user", trimmed);
    store.setThinking(true);
    store.setStatus("thinking");

    // Build the payload from the freshest transcript.
    const history = useCompanionStore.getState().messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          mode: store.mode,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        useCompanionStore
          .getState()
          .addMessage(
            "assistant",
            `🎭 *Se apaga el reflector un instante…* No pude conectar con mi cerebro local. ${
              data?.error ?? `(HTTP ${res.status})`
            }`
          );
        return;
      }

      const reply: string = (data.reply ?? "").trim();
      useCompanionStore
        .getState()
        .addMessage(
          "assistant",
          reply || "🎭 *(Rui hace una reverencia silenciosa.)*"
        );
    } catch (err) {
      useCompanionStore
        .getState()
        .addMessage(
          "assistant",
          `🎭 Algo tembló entre bambalinas: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
    } finally {
      const s = useCompanionStore.getState();
      s.setThinking(false);
      // If voice is on, VoicePlayer will flip status to "speaking".
      if (!s.voiceEnabled) s.setStatus("idle");
    }
  }, []);

  return { send };
}
