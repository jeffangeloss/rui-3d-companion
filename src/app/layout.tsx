import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rui — 3D Companion",
  description:
    "A private, local-first 3D virtual companion. Runs on Ollama, Piper and Whisper.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0e0a14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen font-display antialiased">{children}</body>
    </html>
  );
}
