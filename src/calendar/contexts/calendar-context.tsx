"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { IEvent } from "@/calendar/types";

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
  const [user, setUser] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedUserId, setSelectedUserId] = useState<string>("all");
  const router = useRouter();

  // ── Define all functions first ──
  const checkUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
  };

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from("events").select("*").order("start_date", { ascending: true });

      if (error) throw error;

      const transformedEvents: IEvent[] = (data || []).map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description || "",
        startDate: event.start_date,
        endDate: event.end_date,
        color: event.color,
        user: {
          id: event.user_id,
          name: user?.email?.split("@")[0] || "User",
          email: user?.email || "",
          picturePath: "",
        },
      }));

      setEvents(transformedEvents);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addEvent = async (event: Omit<IEvent, "id">) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("events")
        .insert([
          {
            user_id: userData.user.id,
            title: event.title,
            description: event.description,
            start_date: event.startDate,
            end_date: event.endDate,
            color: event.color,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const newEvent: IEvent = {
        id: data.id,
        title: data.title,
        description: data.description || "",
        startDate: data.start_date,
        endDate: data.end_date,
        color: data.color,
        user: event.user,
      };

      setEvents(prev => [...prev, newEvent]);
    } catch (error) {
      console.error("Error adding event:", error);
      throw error;
    }
  };

  const updateEvent = async (id: number, eventUpdate: Partial<IEvent>) => {
    try {
      const updateData: any = {};
      if (eventUpdate.title) updateData.title = eventUpdate.title;
      if (eventUpdate.description) updateData.description = eventUpdate.description;
      if (eventUpdate.startDate) updateData.start_date = eventUpdate.startDate;
      if (eventUpdate.endDate) updateData.end_date = eventUpdate.endDate;
      if (eventUpdate.color) updateData.color = eventUpdate.color;

      const { error } = await supabase.from("events").update(updateData).eq("id", id);

      if (error) throw error;

      setEvents(prev =>
        prev.map(event =>
          event.id === id
            ? { ...event, ...eventUpdate, startDate: eventUpdate.startDate || event.startDate, endDate: eventUpdate.endDate || event.endDate }
            : event
        )
      );
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  };

  const deleteEvent = async (id: number) => {
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);

      if (error) throw error;

      setEvents(prev => prev.filter(event => event.id !== id));
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setEvents([]);
    router.push("/login");
  };

  // ── Value object after all functions are defined ──
  const value: ICalendarContext = {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    isLoading,
    user,
    signOut,
    selectedDate,
    setSelectedDate,
    selectedUserId,
    setSelectedUserId,
  };

  useEffect(() => {
    checkUser();
    loadEvents();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadEvents();
      } else {
        setEvents([]);
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
}
