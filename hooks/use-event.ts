"use client";

import { useState } from "react";

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
  color?: string;
};

export function useEvent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>(undefined);
  const [defaultDate, setDefaultDate] = useState<Date | undefined>(undefined);
  const [defaultCalendarId, setDefaultCalendarId] = useState<string | undefined>(undefined);

  // Open modal for creating a new event
  const createEvent = (date?: Date, calendarId?: string) => {
    console.log("Creating event with calendarId:", calendarId);
    setSelectedEvent(undefined);
    setDefaultDate(date);
    setDefaultCalendarId(calendarId);
    setIsModalOpen(true);
  };

  // Open modal for editing an existing event
  const editEvent = (event: Event) => {
    // Make sure we have a properly formatted event object
    const formattedEvent: Event = {
      id: event.id,
      title: event.title,
      description: event.description || "",
      start_time: event.start_time,
      end_time: event.end_time,
      location: event.location || "",
      all_day: Boolean(event.all_day),
      calendar_id: event.calendar_id,
      group_id: event.group_id,
      color: event.color,
    };

    setSelectedEvent(formattedEvent);
    setDefaultDate(undefined);
    setDefaultCalendarId(undefined);
    setIsModalOpen(true);
  };

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Delete an event
  const deleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete event");
      }

      return true;
    } catch (error) {
      console.error("Error deleting event:", error);
      return false;
    }
  };

  return {
    isModalOpen,
    selectedEvent,
    defaultDate,
    defaultCalendarId,
    createEvent,
    editEvent,
    closeModal,
    deleteEvent,
  };
} 