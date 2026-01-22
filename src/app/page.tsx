import { CalendarProvider } from "@/calendar/contexts/calendar-context";
import { ClientContainer } from "@/calendar/components/client-container";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

export default function HomePage() {
  return (
    <ProtectedRoute>
      <CalendarProvider>
        <main className="min-h-screen bg-gray-50 p-4">
          <ClientContainer view="month" />
        </main>
      </CalendarProvider>
    </ProtectedRoute>
  );
}
