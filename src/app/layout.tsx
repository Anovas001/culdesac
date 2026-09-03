import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const copy = getMessages(locale).site;

  return {
    title: { default: copy.title, template: "%s · Culdesac" },
    description: copy.description,
    icons: { icon: "/brand/culdesac-mark.png" },
  };
}

export const viewport: Viewport = {
  themeColor: "#0A0A0F",
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
