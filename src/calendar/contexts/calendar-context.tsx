"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export interface IEvent {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  color: string;
  user: {
    id: string;
    name: string;
    email: string;
    picturePath: string;
  };
}

interface ICalendarContext {
  events: IEvent[];
  addEvent: (event: Omit<IEvent, "id">) => Promise<void>;
  updateEvent: (id: number, event: Partial<IEvent>) => Promise<void>;
  deleteEvent: (id: number) => Promise<void>;
  isLoading: boolean;
  user: any;
  signOut: () => Promise<void>;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  selectedUserId: string;
  setSelectedUserId: (id: string) => void;
}

const CalendarContext = createContext<ICalendarContext | undefined>(undefined);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedUserId, setSelectedUserId] = useState<string>("all");
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      loadEvents();
    } else if (status === "unauthenticated") {
      // Only redirect if not on login/signup/forgot-password/reset-password pages
      const protectedPages = ["/login", "/signup", "/forgot-password", "/reset-password"];
      const currentPath = window.location.pathname;
      if (!protectedPages.includes(currentPath)) {
        router.push("/login");
      }
    }
  }, [status, router]);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/events");

      if (!response.ok) throw new Error("Failed to load events");

      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addEvent = async (event: Omit<IEvent, "id">) => {
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });

      if (!response.ok) throw new Error("Failed to add event");

      const data = await response.json();
      setEvents(prev => [...prev, data.event]);
    } catch (error) {
      console.error("Error adding event:", error);
      throw error;
    }
  };

  const updateEvent = async (id: number, eventUpdate: Partial<IEvent>) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventUpdate),
      });

      if (!response.ok) throw new Error("Failed to update event");

      const data = await response.json();
      setEvents(prev => prev.map(event => (event.id === id ? { ...event, ...data.event } : event)));
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  };

  const deleteEvent = async (id: number) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete event");

      setEvents(prev => prev.filter(event => event.id !== id));
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  };

  const signOut = async () => {
    await nextAuthSignOut({ redirect: false });
    setEvents([]);
    router.push("/login");
  };

  return (
    <CalendarContext.Provider
      value={{
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        isLoading,
        user: session?.user,
        signOut,
        selectedDate,
        setSelectedDate,
        selectedUserId,
        setSelectedUserId,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
}
