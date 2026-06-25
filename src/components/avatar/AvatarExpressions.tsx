"use client";

import { useEffect } from "react";
import { useCompanionStore } from "@/store/companion-store";
import { EmotionName } from "@/lib/avatar-config";

/**
 * Non-visual driver: picks an emotion for Rui from the latest assistant message
 * and the current status, then writes it to the store (the AvatarModel reads it
 * each frame). A tiny Spanish keyword heuristic — good enough for the MVP, and a
 * natural seam to later swap for model-provided emotion tags.
 */

const HAPPY = /(jaja|genial|increíble|maravillos|bravo|aplaus|funci[oó]n|brillante|me encanta|qué bien|excelente|🎉|✨|😄|😁)/i;
const SAD = /(lo siento|triste|perd[oó]n|qué pena|descansa|tranquil|aquí estoy|😢|🥺)/i;
const SURPRISED = /(¡vaya|increíble|no me lo creo|sorpresa|guau|wow|asombros|😮|😲)/i;
const RELAXED = /(respira|calma|tranquil|despacio|suave|relaj|paz)/i;
const ANGRY = /(no es justo|me molesta|grr|enojad|cómo se atreve)/i;

function detectEmotion(text: string): EmotionName {
  if (HAPPY.test(text)) return "happy";
  if (SURPRISED.test(text)) return "surprised";
  if (RELAXED.test(text)) return "relaxed";
  if (SAD.test(text)) return "sad";
  if (ANGRY.test(text)) return "angry";
  return "neutral";
}

export default function AvatarExpressions() {
  const messages = useCompanionStore((s) => s.messages);
  const status = useCompanionStore((s) => s.status);
  const mode = useCompanionStore((s) => s.mode);
  const setEmotion = useCompanionStore((s) => s.setEmotion);

  useEffect(() => {
    // Comfort mode leans relaxed regardless of words.
    if (mode === "comfort") {
      setEmotion(status === "speaking" ? "relaxed" : "relaxed");
      return;
    }

    if (status === "thinking") {
      setEmotion("neutral");
      return;
    }

    const lastAssistant = [...messages]
      .reverse()
      .find((m) => m.role === "assistant");

    if (status === "speaking" && lastAssistant) {
      setEmotion(detectEmotion(lastAssistant.content));
    } else if (status === "idle") {
      // Settle back toward neutral/happy between turns.
      setEmotion(mode === "laboratorio" ? "happy" : "neutral");
    }
  }, [messages, status, mode, setEmotion]);

  return null;
}
