"use client";

import { useCallback } from "react";
import { useCompanionStore } from "@/store/companion-store";
import { generateDemoReply } from "@/lib/demo";

/**
 * Orchestrates one conversational turn: append the user's message, ask Ollama
 * (via /api/chat) with the current mode, and append Rui's reply.
 *
 * Resilience: if demo mode is on, or if the LLM can't be reached, Rui answers
 * with the offline demo brain so the app never feels broken. Speaking the reply
 * out loud is handled separately by <VoicePlayer/>, which watches the transcript
 * — so both typed and spoken input flow through here.
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

    const finish = () => {
      const s = useCompanionStore.getState();
      s.setThinking(false);
      // If voice is on, VoicePlayer will flip status to "speaking".
      if (!s.voiceEnabled) s.setStatus("idle");
    };

    // ── Offline demo brain (explicit) ──────────────────────
    if (store.demoMode) {
      const reply = generateDemoReply(trimmed, store.mode);
      useCompanionStore.getState().addMessage("assistant", reply, { demo: true });
      finish();
      return;
    }

    // Build the payload from the freshest transcript.
    const history = useCompanionStore.getState().messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, mode: store.mode }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // LLM unreachable / errored → fall back to the demo brain.
        const reply = generateDemoReply(trimmed, store.mode, { fallback: true });
        useCompanionStore
          .getState()
          .addMessage("assistant", reply, { demo: true });
        return;
      }

      const reply: string = (data.reply ?? "").trim();
      useCompanionStore
        .getState()
        .addMessage(
          "assistant",
          reply || "🎭 *(Rui hace una reverencia silenciosa.)*"
        );
    } catch {
      // Network error → demo fallback keeps the conversation alive.
      const reply = generateDemoReply(trimmed, store.mode, { fallback: true });
      useCompanionStore
        .getState()
        .addMessage("assistant", reply, { demo: true });
    } finally {
      finish();
    }
  }, []);

  return { send };
}
