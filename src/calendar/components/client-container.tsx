"use client";

import { useMemo } from "react";
import { isSameDay, parseISO } from "date-fns";

import { useCalendar } from "@/calendar/contexts/calendar-context";
import { IEvent, TCalendarView } from "@/calendar/types";

import { DndProviderWrapper } from "@/calendar/components/dnd/dnd-provider";

import { CalendarHeader } from "@/calendar/components/header/calendar-header";
import { CalendarYearView } from "@/calendar/components/year-view/calendar-year-view";
import { CalendarMonthView } from "@/calendar/components/month-view/calendar-month-view";
import { CalendarAgendaView } from "@/calendar/components/agenda-view/calendar-agenda-view";
import { CalendarDayView } from "@/calendar/components/week-and-day-view/calendar-day-view";
import { CalendarWeekView } from "@/calendar/components/week-and-day-view/calendar-week-view";

interface ClientContainerProps {
  view: TCalendarView;
}

export function ClientContainer({ view }: ClientContainerProps) {
  const { selectedDate, selectedUserId, events } = useCalendar();

  // Helper: check if event overlaps with a date range
  const isEventInRange = (event: IEvent, rangeStart: Date, rangeEnd: Date) => parseISO(event.startDate) <= rangeEnd && parseISO(event.endDate) >= rangeStart;

  // Helper: check user filter
  const matchesUser = (event: IEvent) => selectedUserId === "all" || event.user.id === selectedUserId;

  const filteredEvents = useMemo(() => {
    return events.filter((event: IEvent) => {
      if (!matchesUser(event)) return false;

      if (view === "year") {
        const yearStart = new Date(selectedDate.getFullYear(), 0, 1);
        const yearEnd = new Date(selectedDate.getFullYear(), 11, 31, 23, 59, 59, 999);
        return isEventInRange(event, yearStart, yearEnd);
      }

      if (view === "month" || view === "agenda") {
        const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59, 999);
        return isEventInRange(event, monthStart, monthEnd);
      }

      if (view === "week") {
        const weekStart = new Date(selectedDate);
        weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        return isEventInRange(event, weekStart, weekEnd);
      }

      if (view === "day") {
        const dayStart = new Date(selectedDate);
        dayStart.setHours(0, 0, 0, 0);

        const dayEnd = new Date(selectedDate);
        dayEnd.setHours(23, 59, 59, 999);

        return isEventInRange(event, dayStart, dayEnd);
      }

      return false;
    });
  }, [events, selectedDate, selectedUserId, view]);

  const singleDayEvents = useMemo(
    () =>
      filteredEvents.filter((event: IEvent) => {
        const start = parseISO(event.startDate);
        const end = parseISO(event.endDate);
        return isSameDay(start, end);
      }),
    [filteredEvents]
  );

  const multiDayEvents = useMemo(
    () =>
      filteredEvents.filter((event: IEvent) => {
        const start = parseISO(event.startDate);
        const end = parseISO(event.endDate);
        return !isSameDay(start, end);
      }),
    [filteredEvents]
  );

  const eventStartDates = useMemo(() => filteredEvents.map((event: IEvent) => ({ ...event, endDate: event.startDate })), [filteredEvents]);

  // ── Keep your debug logs ──
  if (process.env.NODE_ENV !== "production") {
    console.log("📊 ClientContainer - view:", view, "selectedDate:", selectedDate.toISOString(), "filtered count:", filteredEvents.length);
  }

  if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
    try {
      const lastAdded = localStorage.getItem("lastAddedEventId");
      if (lastAdded) {
        const id = Number(lastAdded);
        const found = filteredEvents.some(e => e.id === id);
        console.log("DEBUG: lastAddedEventId:", id, "foundInFilteredEvents:", found, "filteredEventsCount:", filteredEvents.length);

        if (!found) {
          const globalFound = events.some(e => e.id === id);
          console.log("DEBUG: lastAdded present in ALL events?", globalFound);
          if (globalFound) {
            const ev = events.find(e => e.id === id);
            console.log("DEBUG: lastAdded event object:", ev);
            console.log("DEBUG: selectedDate:", selectedDate.toISOString());
            console.log("DEBUG: event start:", ev?.startDate, "event end:", ev?.endDate);
          }
        }
      }
    } catch (err) {
      console.warn("DEBUG: error reading lastAddedEventId", err);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <CalendarHeader view={view} events={filteredEvents} />

      <DndProviderWrapper>
        {view === "day" && <CalendarDayView singleDayEvents={singleDayEvents} multiDayEvents={multiDayEvents} />}
        {view === "month" && <CalendarMonthView singleDayEvents={singleDayEvents} multiDayEvents={multiDayEvents} />}
        {view === "week" && <CalendarWeekView singleDayEvents={singleDayEvents} multiDayEvents={multiDayEvents} />}
        {view === "year" && <CalendarYearView allEvents={eventStartDates} />}
        {view === "agenda" && <CalendarAgendaView singleDayEvents={singleDayEvents} multiDayEvents={multiDayEvents} />}
      </DndProviderWrapper>
    </div>
  );
}
