"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Calendar, Clock, Text, User, Check, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EditEventDialog } from "@/calendar/components/dialogs/edit-event-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { useCalendar } from "@/calendar/contexts/calendar-context";

import type { IEvent } from "@/calendar/interfaces";

interface IProps {
  event: IEvent;
  children: React.ReactNode;
}

const DONT_SHOW_DELETE_KEY = "calendo_dont_show_delete_confirm";

export function EventDetailsDialog({ event, children }: IProps) {
  const { updateEvent, deleteEvent } = useCalendar();

  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const startDate = parseISO(event.startDate);
  const endDate = parseISO(event.endDate);

  const handleComplete = () => {
    updateEvent(event.id, {
      color: "gray",
      title: event.title.startsWith("✓ ") ? event.title : `✓ ${event.title}`,
    });
  };

  const handleDelete = () => {
    const dontShow = localStorage.getItem(DONT_SHOW_DELETE_KEY) === "true";

    if (dontShow) {
      deleteEvent(event.id);
      return;
    }

    setDontShowAgain(false); // reset checkbox
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    if (dontShowAgain) {
      localStorage.setItem(DONT_SHOW_DELETE_KEY, "true");
    }
    deleteEvent(event.id);
    setShowConfirm(false);
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl">{event.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-6">
            <div className="flex items-start gap-4">
              <User className="mt-1 size-5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Responsible</p>
                <p className="text-sm text-muted-foreground">{event.user.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Calendar className="mt-1 size-5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Start</p>
                <p className="text-sm text-muted-foreground">{format(startDate, "MMM d, yyyy h:mm a")}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock className="mt-1 size-5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">End</p>
                <p className="text-sm text-muted-foreground">{format(endDate, "MMM d, yyyy h:mm a")}</p>
              </div>
            </div>

            {event.description && (
              <div className="flex items-start gap-4">
                <Text className="mt-1 size-5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Description</p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{event.description}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-3 border-t pt-4 sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800" onClick={handleComplete}>
                <Check className="mr-1.5 h-4 w-4" />
                Complete
              </Button>

              <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={handleDelete}>
                <Trash2 className="mr-1.5 h-4 w-4" />
                Delete
              </Button>
            </div>

            <EditEventDialog event={event}>
              <Button variant="default" size="sm">
                Edit
              </Button>
            </EditEventDialog>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove "{event.title}".
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex items-center space-x-2 py-4">
            <Checkbox id="dont-show-again" checked={dontShowAgain} onCheckedChange={checked => setDontShowAgain(!!checked)} />
            <Label htmlFor="dont-show-again" className="cursor-pointer select-none text-sm font-medium leading-none">
              Don't show this warning again
            </Label>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
