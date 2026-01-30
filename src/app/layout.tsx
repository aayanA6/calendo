import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/react";
import { inter } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { getTheme } from "@/cookies/get";
import { Providers } from "@/components/providers";

import type { Metadata } from "next";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Calendo",
  description: "A feature-rich calendar application built with Next.js, TypeScript, and Tailwind CSS.",
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  const theme = await getTheme();

  return (
    <html lang="en-US" className={cn(inter.variable, theme)} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <Header />
          <Analytics />
          {children}
        </Providers>
      </body>
    </html>
  );
}
