"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useDisclosure } from "@/hooks/use-disclosure";
import { useCalendar } from "@/calendar/contexts/calendar-context";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TimeInput } from "@/components/ui/time-input";
import { SingleDayPicker } from "@/components/ui/single-day-picker";
import { Form, FormField, FormLabel, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogHeader, DialogClose, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";

import { eventSchema } from "@/calendar/schemas";

import type { TimeValue } from "react-aria-components";
import type { TEventFormData } from "@/calendar/schemas";

interface IProps {
  children: React.ReactNode;
  startDate?: Date;
  startTime?: { hour: number; minute: number };
}

export function AddEventDialog({ children, startDate, startTime }: IProps) {
  const { isOpen, onClose, onToggle } = useDisclosure();
  const { addEvent, users, selectedUserId } = useCalendar();

  // Log selectedUserId for debugging
  useEffect(() => {
    console.log("📅 Current selectedUserId:", selectedUserId);
  }, [selectedUserId]);

  // Define the default user (always the same as requested)
  const defaultUser = {
    id: "1",
    name: "Aayana",
    email: "aayanadited@gmail.com",
    picturePath: "",
  };

  // Ensure default values match the schema types with full user object
  const _defaultStartDate = startDate ?? new Date();
  const _defaultStartTime = startTime ?? { hour: 9, minute: 0 };
  const _defaultEndDate = _defaultStartDate;
  const _defaultEndTime = { hour: (_defaultStartTime.hour + 1) % 24, minute: _defaultStartTime.minute };

  const form = useForm<TEventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: _defaultStartDate,
      startTime: _defaultStartTime,
      endDate: _defaultEndDate,
      endTime: _defaultEndTime,
      color: "blue",
      user: defaultUser, // Full user object to pass validation
    },
  });

  const onSubmit = (values: TEventFormData) => {
    console.log("✅ SUBMIT CALLED", values);
    console.log("📊 Form is valid on submit:", form.formState.isValid);

    // Use the default user (always the same)
    const newEvent = {
      id: Date.now(), // Generate a unique numeric ID
      title: values.title,
      description: values.description,
      color: values.color,
      user: defaultUser, // Always assign to the same user
      startDate: new Date(
        values.startDate.getFullYear(),
        values.startDate.getMonth(),
        values.startDate.getDate(),
        values.startTime.hour,
        values.startTime.minute
      ).toISOString(),
      endDate: new Date(
        values.endDate.getFullYear(),
        values.endDate.getMonth(),
        values.endDate.getDate(),
        values.endTime.hour,
        values.endTime.minute
      ).toISOString(),
    };

    console.log("📅 NEW EVENT CREATED:", newEvent);

    // Add the new event using the context's addEvent function
    addEvent(newEvent);

    onClose();
    form.reset();
  };

  useEffect(() => {
    console.log("📊 Form errors:", JSON.stringify(form.formState.errors, null, 2));
    console.log("📊 Form is valid:", form.formState.isValid);
  }, [form.formState.errors, form.formState.isValid]);

  useEffect(() => {
    form.reset({
      title: "",
      description: "",
      startDate: startDate ?? new Date(),
      startTime: startTime ?? { hour: 9, minute: 0 },
      endDate: startDate ?? new Date(),
      endTime: startTime ? { hour: (startTime.hour + 1) % 24, minute: startTime.minute } : { hour: 10, minute: 0 },
      color: "blue",
      user: defaultUser, // Full user object
    });
  }, [startDate, startTime, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel htmlFor="title">Title</FormLabel>
                  <FormControl>
                    <Input id="title" placeholder="Enter a title" data-invalid={fieldState.invalid} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-start gap-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field, fieldState }) => (
                  <FormItem className="flex-1">
                    <FormLabel htmlFor="startDate">Start Date</FormLabel>
                    <FormControl>
                      <SingleDayPicker
                        id="startDate"
                        value={field.value}
                        onSelect={date => field.onChange(date as Date)}
                        placeholder="Select a date"
                        data-invalid={fieldState.invalid}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startTime"
                render={({ field, fieldState }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <TimeInput value={field.value as TimeValue} onChange={field.onChange} hourCycle={12} data-invalid={fieldState.invalid} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-start gap-2">
              <FormField
                control={form.control}
                name="endDate"
                render={({ field, fieldState }) => (
                  <FormItem className="flex-1">
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <SingleDayPicker
                        value={field.value}
                        onSelect={date => field.onChange(date as Date)}
                        placeholder="Select a date"
                        data-invalid={fieldState.invalid}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field, fieldState }) => (
                  <FormItem className="flex-1">
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <TimeInput value={field.value as TimeValue} onChange={field.onChange} hourCycle={12} data-invalid={fieldState.invalid} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="color"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger data-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>

                      <SelectContent>
                        {["blue", "green", "red", "yellow", "purple", "orange", "gray"].map(color => (
                          <SelectItem key={color} value={color}>
                            <div className="flex items-center gap-2">
                              <div className={`size-3.5 rounded-full bg-${color}-600`} />
                              {color.charAt(0).toUpperCase() + color.slice(1)}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value} data-invalid={fieldState.invalid} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => console.log("Cancel clicked")}>
                  Cancel
                </Button>
              </DialogClose>

              <Button type="submit">Create Event</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
