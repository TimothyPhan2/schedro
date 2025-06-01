"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { EventForm } from "./event-form";
import { Loader2, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

type Calendar = {
  id: string;
  name: string;
};

type Group = {
  id: string;
  name: string;
  color: string;
};

type Event = {
  id?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  all_day: boolean;
  calendar_id: string;
  group_id?: string;
};

type EventModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedEvent?: Event;
  defaultDate?: Date;
  defaultCalendarId?: string;
  onDelete?: (eventId: string) => Promise<boolean>;
};

export function EventModal({
  isOpen,
  onClose,
  selectedEvent,
  defaultDate,
  defaultCalendarId,
  onDelete,
}: EventModalProps) {
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch calendars
        const calendarsResponse = await fetch("/api/calendars");
        if (!calendarsResponse.ok) {
          throw new Error("Failed to fetch calendars");
        }
        const calendarsData = await calendarsResponse.json();

        // Fetch groups
        const groupsResponse = await fetch("/api/groups");
        if (!groupsResponse.ok && groupsResponse.status !== 404) {
          // We'll ignore 404s for groups since that might just mean no groups exist yet
          throw new Error("Failed to fetch groups");
        }
        const groupsData = groupsResponse.ok ? await groupsResponse.json() : [];

        if (calendarsData.length === 0) {
          setError("No calendars found. Please create a calendar first.");
        }

        setCalendars(calendarsData);
        setGroups(groupsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load calendars and groups. Please try again.");
        toast.error("Error loading data", {
          description: "Failed to load calendars and groups. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Create initialData if defaultDate is provided but no selectedEvent
  const getInitialData = () => {
    if (selectedEvent) return selectedEvent;
    
    if (defaultDate) {
      // Create a default end date 1 hour after the start
      const endDate = new Date(defaultDate);
      endDate.setHours(endDate.getHours() + 1);
      
      // For a new event, don't include an id property at all
      // This will ensure the form uses POST instead of PUT
      const calendarId = defaultCalendarId || (calendars.length > 0 ? calendars[0].id : "");
      
      return {
        title: "",
        description: "",
        start_time: defaultDate.toISOString(),
        end_time: endDate.toISOString(),
        all_day: false,
        location: "",
        calendar_id: calendarId,
      };
    }
    
    return undefined;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] sm:max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg sm:text-xl">
            {selectedEvent ? "Edit Event" : "Create Event"}
          </DialogTitle>
          {error && (
            <DialogDescription className="text-destructive text-sm pt-1">
              {error}
            </DialogDescription>
          )}
        </DialogHeader>

        {isLoading && (
          <div className="flex justify-center items-center py-8 sm:py-12">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
            <span className="ml-2 text-sm sm:text-base">Loading calendars...</span>
          </div>
        )}

        {!isLoading && error && calendars.length === 0 && (
          <div className="py-6 sm:py-8 text-center space-y-4">
            <p className="text-sm sm:text-base px-2">Please create a calendar before adding events.</p>
            <Button asChild size="sm" className="w-full sm:w-auto">
              <Link href="/dashboard">
                <CalendarPlus className="mr-2 h-4 w-4" />
                Create Calendar
              </Link>
            </Button>
          </div>
        )}
        
        {!isLoading && !error && calendars.length > 0 && (
          <div className="space-y-4">
            <EventForm
              initialData={getInitialData()}
              calendars={calendars}
              groups={groups}
              onClose={onClose}
              onDelete={onDelete}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 