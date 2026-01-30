"use client";

import { SessionProvider } from "next-auth/react";
import { CalendarProvider } from "@/calendar/contexts/calendar-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CalendarProvider>{children}</CalendarProvider>
    </SessionProvider>
  );
}
