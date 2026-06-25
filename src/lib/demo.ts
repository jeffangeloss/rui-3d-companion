/**
 * Offline "demo brain" for Rui.
 *
 * Lets the app respond in-character with ZERO backend (no Ollama needed), so it
 * runs out of the box and degrades gracefully when the LLM is unreachable.
 * Replies are mode-aware, echo the user's message, and stay in Rui's theatrical
 * voice. This is intentionally simple — the real intelligence is the local LLM.
 */

import { CompanionMode } from "./character-prompt";

/** Stable-ish index from a string so a given message picks a consistent line. */
function seedIndex(text: string, len: number): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(h) % Math.max(1, len);
}

/** First sentence / a short excerpt of the user's message, cleaned up. */
function excerpt(text: string, max = 80): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

type Template = (q: string) => string;

const TEMPLATES: Record<CompanionMode, Template[]> = {
  teatro: [
    (q) =>
      `🎭 ¡Que se alcen los telones! Dijiste «${q}», y el escenario entero contiene la respiración. Permíteme darte mi mejor escena: lo que traes merece aplausos, y yo seré tu narrador.`,
    (q) =>
      `✨ *Un foco cae sobre ti.* «${q}» — ¡qué entrada tan magnífica! Cuéntame el siguiente acto y lo montamos juntos, con luces, música y un poquito de drama del bueno.`,
    (q) =>
      `🎪 ¡Damas y caballeros, atención! El tema de hoy es: «${q}». Yo, tu inventor de funciones, prometo convertirlo en un espectáculo memorable.`,
  ],
  estudio: [
    (q) =>
      `📚 Muy bien, tomemos «${q}» y partámoslo en piezas pequeñas. Primero lo esencial, luego un ejemplo, y al final una pregunta para que lo fijes. ¿Empezamos por lo que ya sabes del tema?`,
    (q) =>
      `🧠 «${q}» es totalmente conquistable. Te propongo el plan del inventor: 1) idea clave, 2) un ejemplo concreto, 3) tú me lo explicas a mí. Dime qué parte se te hace más cuesta arriba.`,
    (q) =>
      `📖 Excelente pregunta: «${q}». Respira, que esto se entiende paso a paso. ¿Quieres que te lo explique como una receta, como una historia, o como un experimento?`,
  ],
  comfort: [
    (q) =>
      `🫂 Aquí estoy contigo. Leí «${q}» y solo quiero que sepas que está bien sentirse así. No hay prisa; cuéntame con calma y te acompaño.`,
    (q) =>
      `🌙 Gracias por contarme «${q}». Respira hondo conmigo… inhala… exhala. Estás haciéndolo mejor de lo que crees. ¿Qué necesitas ahora mismo?`,
    (q) =>
      `💗 Te escucho. «${q}» pesa, y no tienes que cargarlo sola. Quédate un ratito aquí; bajamos las luces y conversamos tranquilas.`,
  ],
  laboratorio: [
    (q) =>
      `🧪 ¡Eureka improbable! Si mezclo «${q}» con tres cucharadas de imaginación y un relámpago domesticado… ¡obtenemos una idea deliciosamente rara! ¿La probamos?`,
    (q) =>
      `⚗️ Anotado en mi cuaderno de inventos: «${q}». Propuesta absurda número 7: convertirlo en una máquina que hace justo lo contrario… y ver qué pasa. 🤓`,
    (q) =>
      `🔬 «${q}» entra al laboratorio. Hipótesis loca: y si lo hiciéramos al revés, en miniatura y con purpurina. La ciencia divertida nunca falla.`,
  ],
  escenario: [
    (q) =>
      `🌆 *Monto el escenario:* fondo violeta, una luz cálida cayendo en diagonal, y yo en pose pensativa. Desde aquí te respondo a «${q}». ¿Cambiamos el ambiente?`,
    (q) =>
      `🎬 Luces… ajusto el foco… *clic.* El set está listo para «${q}». Puedo cambiar el fondo a noche estrellada o a laboratorio neón cuando quieras.`,
    (q) =>
      `🪄 Decorado nuevo para «${q}»: telón azul profundo y un reflector dorado sobre ti. El escenario reacciona a tu ánimo; dime cómo lo quieres.`,
  ],
  voz: [
    (q) =>
      `🎙️ Te escuché decir «${q}». Respondo claro y con buen ritmo, para que suene bien en voz alta. Sigue hablándome cuando quieras.`,
    (q) =>
      `🔊 Recibido alto y claro: «${q}». Te contesto en frases cortas y con energía. ¿Continuamos la conversación a viva voz?`,
    (q) =>
      `🗣️ «${q}», dicho y escuchado. Mi voz está lista para acompañarte; tú hablas, yo respondo, y seguimos el ida y vuelta.`,
  ],
};

export interface DemoReplyOptions {
  /** When true, prefix a small note that this is a fallback (LLM unreachable). */
  fallback?: boolean;
}

/** Generate an in-character offline reply for the given message + mode. */
export function generateDemoReply(
  userText: string,
  mode: CompanionMode,
  opts: DemoReplyOptions = {}
): string {
  const templates = TEMPLATES[mode] ?? TEMPLATES.teatro;
  const q = excerpt(userText);
  const reply = templates[seedIndex(userText, templates.length)](q);

  if (opts.fallback) {
    return `*(modo demo — no encontré a Ollama, respondo con mi ingenio de bolsillo)*\n\n${reply}`;
  }
  return reply;
}
