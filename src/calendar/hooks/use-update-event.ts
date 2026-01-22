import { useCalendar } from "@/calendar/contexts/calendar-context";
import type { IEvent } from "@/calendar/types";

export function useUpdateEvent() {
  const { updateEvent } = useCalendar();

  const handleUpdateEvent = async (event: IEvent) => {
    try {
      await updateEvent(event.id, {
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        color: event.color,
      });
    } catch (error) {
      console.error("Failed to update event:", error);
    }
  };

  return { handleUpdateEvent };
}