"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import AvatarControls from "@/components/avatar/AvatarControls";
import AvatarExpressions from "@/components/avatar/AvatarExpressions";
import ChatPanel from "@/components/chat/ChatPanel";

// The 3D scene touches WebGL/three.js, so render it client-side only.
const AvatarScene = dynamic(
  () => import("@/components/avatar/AvatarScene"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center text-white/40">
        Cargando escenario 3D…
      </div>
    ),
  }
);

export default function CompanionPage() {
  return (
    <main className="grid h-screen w-screen grid-cols-1 overflow-hidden lg:grid-cols-[1fr_minmax(340px,420px)]">
      {/* Stage */}
      <section className="relative h-[45vh] min-h-[320px] lg:h-screen">
        <AvatarScene />
        <AvatarControls />

        {/* Back link */}
        <Link
          href="/"
          className="absolute bottom-3 right-3 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white/60 backdrop-blur transition hover:text-white"
        >
          ← Salir
        </Link>

        {/* Non-visual emotion driver. */}
        <AvatarExpressions />
      </section>

      {/* Chat */}
      <aside className="h-[55vh] min-h-0 lg:h-screen">
        <ChatPanel />
      </aside>
    </main>
  );
}
