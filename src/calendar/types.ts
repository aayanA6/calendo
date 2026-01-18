export type TEventColor =
  | "blue"
  | "green"
  | "red"
  | "yellow"
  | "purple"
  | "orange"
  | "pink"
  | "teal"
  | "indigo"
  | "gray";

export interface IEvent {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  color: TEventColor;
  user: {
    id: string;
    name: string;
    email: string;
    picturePath: string;
  };
}

export type TCalendarView = "day" | "week" | "month" | "year" | "agenda";