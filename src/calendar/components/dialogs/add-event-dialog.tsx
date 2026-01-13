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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import MyDropzone from "@/calendar/components/MyDropzone";
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
  const { addEvent } = useCalendar();

  const defaultUser = {
    id: "1",
    name: "Aayana",
    email: "aayanadited@gmail.com",
    picturePath: "",
  };

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
      user: defaultUser,
    },
  });

  const onSubmit = (values: TEventFormData) => {
    const newEvent = {
      id: Date.now(),
      title: values.title,
      description: values.description,
      color: values.color,
      user: defaultUser,
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

    addEvent(newEvent);
    onClose();
    form.reset();
  };

  useEffect(() => {
    form.reset({
      title: "",
      description: "",
      startDate: startDate ?? new Date(),
      startTime: startTime ?? { hour: 9, minute: 0 },
      endDate: startDate ?? new Date(),
      endTime: startTime ? { hour: (startTime.hour + 1) % 24, minute: startTime.minute } : { hour: 10, minute: 0 },
      color: "blue",
      user: defaultUser,
    });
  }, [startDate, startTime, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Event Details</TabsTrigger>
            <TabsTrigger value="upload">Upload File</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} data-invalid={fieldState.invalid} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Start Date</FormLabel>
                        <SingleDayPicker
                          value={field.value}
                          onSelect={d => field.onChange(d as Date)}
                          placeholder="Select start date"
                        />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Start Time</FormLabel>
                        <TimeInput value={field.value as TimeValue} onChange={field.onChange} hourCycle={12} />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>End Date</FormLabel>
                        <SingleDayPicker
                          value={field.value}
                          onSelect={d => field.onChange(d as Date)}
                          placeholder="Select end date"
                        />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>End Time</FormLabel>
                        <TimeInput value={field.value as TimeValue} onChange={field.onChange} hourCycle={12} />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger />
                        <SelectContent>
                          {["blue", "green", "red", "yellow", "purple", "orange", "gray"].map(c => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <Textarea {...field} />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit">Create Event</Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="upload">
            <MyDropzone />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
