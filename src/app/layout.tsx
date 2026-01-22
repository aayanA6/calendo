// app/layout.tsx
import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/react";
import { inter } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { getTheme } from "@/cookies/get";
import { CalendarProvider } from "@/calendar/contexts/calendar-context";

import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Calix",
  description: "A feature-rich calendar application built with Next.js, TypeScript, and Tailwind CSS.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const theme = getTheme();

  return (
    <html lang="en-US" className={cn(inter.variable, theme)} suppressHydrationWarning>
      <body>
        <CalendarProvider>
          <Header />
          <Analytics />
          {children}
        </CalendarProvider>
      </body>
    </html>
  );
}
