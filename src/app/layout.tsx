import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Culdesac — Competicions online",
    template: "%s · Culdesac",
  },
  description: "Tornejos online de Fortnite. Entra, competeix i demostra fins on pots arribar.",
  icons: {
    icon: "/brand/culdesac-mark.webp",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0F",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ca">
      <body>{children}</body>
    </html>
  );
}
