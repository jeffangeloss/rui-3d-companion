"use client";

import { ChatMessage } from "@/store/companion-store";

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "rounded-br-sm bg-gradient-to-br from-stage-accent2 to-indigo-600 text-white"
            : "rounded-bl-sm border border-white/10 bg-stage-panel text-white/90"
        }`}
      >
        {!isUser && (
          <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wider text-stage-accent">
            Rui
          </span>
        )}
        {message.content}
      </div>
    </div>
  );
}
