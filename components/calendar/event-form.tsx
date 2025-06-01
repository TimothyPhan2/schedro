"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Trash2 } from "lucide-react";
import { EventTemplateButton } from "@/components/calendar/event-template-button";
import { ConflictIndicator } from "@/components/calendar/conflict-indicator";
import { DurationPreset } from "@/components/calendar/duration-preset";
import type { AppEvent } from "@/lib/types/event";

// Define the form schema
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  startTime: z.string(),
  endDate: z.string().min(1, "End date is required"),
  endTime: z.string(),
  location: z.string().optional(),
  allDay: z.boolean().default(false),
  calendarId: z.string().min(1, "Calendar ID is required"),
  groupId: z.string().optional(),
  color: z.string().optional(),
});

type EventFormProps = {
  initialData?: {
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
  calendars: { id: string; name: string }[];
  groups: { id: string; name: string; color: string }[];
  onClose: () => void;
  onDelete?: (eventId: string) => Promise<boolean>;
};

export function EventForm({
  initialData,
  calendars,
  groups,
  onClose,
  onDelete,
}: EventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);


  // Conflict detection state
  const [hasConflict, setHasConflict] = useState(false);
  const [conflictCount, setConflictCount] = useState(0);
  const [existingEvents, setExistingEvents] = useState<AppEvent[]>([]);

  // Predefined color options
  const colorOptions = [
    { name: "Default", value: "default" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Green", value: "#10b981" },
    { name: "Amber", value: "#f59e0b" },
    { name: "Red", value: "#ef4444" },
    { name: "Purple", value: "#8b5cf6" },
    { name: "Pink", value: "#ec4899" },
    { name: "Indigo", value: "#6366f1" },
    { name: "Teal", value: "#14b8a6" },
    { name: "Orange", value: "#f97316" },
  ];
  
  // Event templates for quick creation
  const eventTemplates = [
    { name: "Meeting", color: "#3b82f6", duration: 30 },
    { name: "Focus Time", color: "#10b981", duration: 60 },
    { name: "Break", color: "#f59e0b", duration: 15 },
  ];
  
  // Apply template function for quick event creation
  const applyTemplate = (template: { name: string; color: string; duration: number }) => {
    form.setValue("title", template.name);
    form.setValue("color", template.color);
    
    // Set duration based on template
    if (template.duration) {
      const startTime = form.getValues("startTime");
      const startDate = form.getValues("startDate");
      
      if (startTime && startDate) {
        const startDateTime = new Date(`${startDate}T${startTime}:00`);
        const newEndDateTime = new Date(startDateTime.getTime() + template.duration * 60000);
        
        form.setValue("endDate", format(newEndDateTime, "yyyy-MM-dd"));
        form.setValue("endTime", format(newEndDateTime, "HH:mm"));
      }
    }
  };

  // Set default values for the form
  const defaultValues = {
    title: initialData?.title || "",
    description: initialData?.description || "",
    startDate: initialData ? format(new Date(initialData.start_time), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    startTime: initialData ? format(new Date(initialData.start_time), "HH:mm") : format(new Date(), "HH:mm"),
    endDate: initialData ? format(new Date(initialData.end_time), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    endTime: initialData 
      ? format(new Date(initialData.end_time), "HH:mm") 
      : format(new Date(new Date().setHours(new Date().getHours() + 1)), "HH:mm"),
    location: initialData?.location || "",
    allDay: initialData?.all_day || false,
    calendarId: initialData?.calendar_id || (calendars.length > 0 ? calendars[0].id : ""),
    groupId: initialData?.group_id || "",
    color: initialData?.color || "default",
  };

  // Initialize the form with react-hook-form
  // Using any type to avoid complex react-hook-form typing issues
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Watch the allDay value to disable time inputs when true
  const allDay = form.watch("allDay");

  // Watch form values for conflict detection
  const startDate = form.watch("startDate");
  const startTime = form.watch("startTime");
  const endDate = form.watch("endDate");
  const endTime = form.watch("endTime");
  const calendarId = form.watch("calendarId");

  // Function to detect conflicts with existing events
  const checkForConflicts = useCallback((
    eventStart: Date,
    eventEnd: Date,
    currentEventId?: string
  ) => {
    if (!existingEvents.length) {
      return { hasConflict: false, count: 0 };
    }

    const conflicts = existingEvents.filter(existingEvent => {
      try {
        // Skip the current event when editing
        if (currentEventId && String(existingEvent.id) === currentEventId) {
          return false;
        }

        // Validate that we have valid Date objects
        if (!(existingEvent.start instanceof Date) || !(existingEvent.end instanceof Date)) {
          console.warn('⚠️ Invalid date objects in existing event:', existingEvent);
          return false;
        }

        const eventStartTime = existingEvent.start;
        const eventEndTime = existingEvent.end;

        // Additional validation - check if dates are valid
        if (isNaN(eventStartTime.getTime()) || isNaN(eventEndTime.getTime())) {
          console.warn('⚠️ Invalid date values in existing event:', existingEvent);
          return false;
        }

        // Check for overlap
        const hasOverlap = (
          (eventStart >= eventStartTime && eventStart < eventEndTime) ||
          (eventEnd > eventStartTime && eventEnd <= eventEndTime) ||
          (eventStart <= eventStartTime && eventEnd >= eventEndTime)
        );

        return hasOverlap;
      } catch (error) {
        console.error('💥 Error checking individual event:', existingEvent, error);
        return false;
      }
    });

    return {
      hasConflict: conflicts.length > 0,
      count: conflicts.length
    };
  }, [existingEvents]);

  // Fetch existing events when calendar changes
  const fetchEvents = useCallback(async () => {
    if (!calendarId) {
      setExistingEvents([]);
      return;
    }

    try {
      const response = await fetch(`/api/events?calendarId=${calendarId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      // Convert date strings to Date objects with validation
      const formattedEvents: AppEvent[] = data
        .map((event: Record<string, unknown>) => {
          try {
            // Handle different possible date field names
            const startTime = event.start_time || event.startTime || event.start;
            const endTime = event.end_time || event.endTime || event.end;
            
            if (!startTime || !endTime) {
              console.warn('⚠️ Missing start/end time in event:', event);
              return null;
            }
            
            const startDate = new Date(typeof startTime === 'string' ? startTime : '');
            const endDate = new Date(typeof endTime === 'string' ? endTime : '');
            
            // Validate dates - check if they're actually invalid
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
              console.warn('⚠️ Invalid date found in event:', {
                eventId: event.id,
                title: event.title,
                startTime,
                endTime,
                startDate: startDate.toString(),
                endDate: endDate.toString()
              });
              return null;
            }
            
            return {
              id: event.id,
              title: event.title,
              start: startDate,
              end: endDate,
              allDay: event.all_day || false,
              color: event.color,
              location: event.location,
              description: event.description,
            };
          } catch (error) {
            console.error('💥 Error formatting event:', event, error);
            return null;
          }
        })
        .filter((event: AppEvent | null): event is AppEvent => event !== null);
      
      setExistingEvents(formattedEvents);
    } catch (error) {
      console.error('💥 Error fetching events for conflict detection:', error);
      setExistingEvents([]);
    }
  }, [calendarId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Check for conflicts when time or date changes
  useEffect(() => {
    if (!startDate || !endDate || (!allDay && (!startTime || !endTime))) {
      setHasConflict(false);
      setConflictCount(0);
      return;
    }

    try {
      let eventStart: Date;
      let eventEnd: Date;

      if (allDay) {
        eventStart = new Date(`${startDate}T00:00:00`);
        eventEnd = new Date(`${endDate}T23:59:59`);
      } else {
        eventStart = new Date(`${startDate}T${startTime}:00`);
        eventEnd = new Date(`${endDate}T${endTime}:00`);
      }

      // Validate the dates
      if (eventStart >= eventEnd) {
        setHasConflict(false);
        setConflictCount(0);
        return;
      }

      const { hasConflict: conflicts, count } = checkForConflicts(
        eventStart,
        eventEnd,
        initialData?.id
      );

      setHasConflict(conflicts);
      setConflictCount(count);
    } catch (error) {
      console.error('💥 Error in conflict detection:', error);
      setHasConflict(false);
      setConflictCount(0);
    }
  }, [startDate, startTime, endDate, endTime, allDay, existingEvents, initialData?.id, checkForConflicts]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      // Verify calendar is selected
      if (!data.calendarId) {
        setCalendarError("Please select a calendar");
        return;
      }

      setIsSubmitting(true);
      setCalendarError(null);

      // Combine date and time strings into ISO date strings
      const startDateTime = new Date(
        `${data.startDate}T${data.startTime}:00`
      ).toISOString();
      const endDateTime = new Date(
        `${data.endDate}T${data.endTime}:00`
      ).toISOString();

      const eventData = {
        title: data.title,
        description: data.description,
        start_time: startDateTime,
        end_time: endDateTime,
        location: data.location,
        all_day: data.allDay,
        calendarId: data.calendarId,
        calendar_id: data.calendarId,
        group_id: data.groupId || null,
        color: data.color !== "default" ? data.color : null,
      };

      // If initialData exists with an id, it's an update; otherwise, it's a new event
      const isUpdate = initialData && initialData.id;
      const url = isUpdate
        ? `/api/events/${initialData.id}`
        : "/api/events";
      const method = isUpdate ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save event");
      }

      // Show success message
      toast.success(initialData?.id ? "Event updated" : "Event created", {
        description: `Successfully ${initialData?.id ? "updated" : "created"} the event`,
      });

      // Close the modal and refresh the page
      onClose();
      router.refresh();
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("Error saving event", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id || !onDelete) return;
    
    try {
      setIsDeleting(true);
      const success = await onDelete(initialData.id);
      
      if (success) {
        toast.success("Event deleted", {
          description: "The event has been successfully deleted",
        });
        onClose();
        router.refresh();
      } else {
        throw new Error("Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Error deleting event", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {(!initialData || !initialData.id) && (
          <div className="mb-6">
            <div className="mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Quick Templates</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {eventTemplates.map((template) => (
                <EventTemplateButton
                  key={template.name}
                  template={template}
                  onClick={() => applyTemplate(template)}
                />
              ))}
            </div>
          </div>
        )}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Event title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Event description (optional)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!allDay && (
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!allDay && (
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Duration Presets */}
        <DurationPreset
          show={!allDay}
          onDurationSelect={(minutes) => {
            const startDate = form.getValues("startDate");
            const startTime = form.getValues("startTime");
            
            if (startDate && startTime) {
              // Create start datetime
              const startDateTime = new Date(`${startDate}T${startTime}:00`);
              
              // Add preset duration
              const endDateTime = new Date(startDateTime.getTime() + minutes * 60000);
              
              // Update form fields
              form.setValue("endDate", format(endDateTime, "yyyy-MM-dd"));
              form.setValue("endTime", format(endDateTime, "HH:mm"));
            }
          }}
        />

        <FormField
          control={form.control}
          name="allDay"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>All Day Event</FormLabel>
                <FormDescription>
                  Toggle if this is an all-day event
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Conflict Detection Indicator */}
        {hasConflict && (
          <ConflictIndicator 
            message="This event overlaps with existing events"
            conflictCount={conflictCount}
          />
        )}

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Event location (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Color</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a color (optional)">
                      {field.value && field.value !== "default" ? (
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-2"
                            style={{ backgroundColor: field.value }}
                          />
                          {colorOptions.find(c => c.value === field.value)?.name || "Custom"}
                        </div>
                      ) : (
                        "Default"
                      )}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {colorOptions.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center">
                        {color.value !== "default" && (
                          <div
                            className="w-4 h-4 rounded-full mr-2"
                            style={{ backgroundColor: color.value }}
                          />
                        )}
                        {color.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose a color for this event or leave as default to use calendar theme
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="calendarId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Calendar</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  setCalendarError(null);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className={calendarError ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select a calendar" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {calendars.map((calendar) => (
                    <SelectItem key={calendar.id} value={calendar.id}>
                      {calendar.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {calendarError && (
                <p className="text-sm font-medium text-destructive mt-1">
                  {calendarError}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {groups.length > 0 && (
          <FormField
            control={form.control}
            name="groupId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group (Optional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a group (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: group.color }}
                          />
                          {group.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-4 border-t">
          {initialData?.id && onDelete ? (
            <Button 
              type="button" 
              variant="destructive" 
              onClick={() => setShowDeleteDialog(true)}
              disabled={isSubmitting || isDeleting}
              size="sm"
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          ) : (
            <div className="hidden sm:block">{/* Empty div to maintain flex spacing on desktop */}</div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || isDeleting}
              size="sm"
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || isDeleting}
              size="sm"
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {isSubmitting
                ? "Saving..."
                : initialData?.id
                ? "Update Event"
                : "Create Event"}
            </Button>
          </div>
        </div>
      </form>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
} 