'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { Calendar, Views, View, type Components } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { localizer, toTimeZone, fromTimeZone, getDefaultTimeZone } from './localizer';
import type { AppEvent } from '@/lib/types/event';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useTheme } from 'next-themes';
import { CalendarThemeConfig } from './calendar-theme-config';
import { useEvent } from '@/hooks/use-event';
import { EventModal } from './event-modal';
import { EventComponent } from './event-component';
import { CustomToolbar } from './custom-toolbar';

interface CalendarViewProps {
  events: AppEvent[];
  defaultView?: View;
  defaultTimeZone?: string;
  onSelectEvent?: (event: AppEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date; slots: Date[] | string[]; action: 'select' | 'click' | 'doubleClick' }) => void;
  showThemeControls?: boolean;
  defaultColorScheme?: string;
  calendarId?: string;
  onEventChange?: () => void;
}

const allViews: View[] = [Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA];

// Common time zones that users might select
const commonTimeZones = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (US & Canada)" },
  { value: "America/Chicago", label: "Central Time (US & Canada)" },
  { value: "America/Denver", label: "Mountain Time (US & Canada)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US & Canada)" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Europe/Berlin", label: "Berlin" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Asia/Shanghai", label: "Shanghai" },
  { value: "Australia/Sydney", label: "Sydney" },
];

// Function to calculate responsive calendar height
const getCalendarHeight = (isMobile: boolean, isTablet: boolean) => {
  if (isMobile) {
    return window.innerHeight * 0.65; // 65% of viewport height on mobile
  }
  if (isTablet) {
    return window.innerHeight * 0.75; // 75% of viewport height on tablets
  }
  return window.innerHeight * 0.8; // 80% of viewport height on desktop
};

export function CalendarView({
  events,
  defaultView = Views.WEEK,
  defaultTimeZone = getDefaultTimeZone(),
  onSelectEvent,
  onSelectSlot,
  showThemeControls = true,
  calendarId,
  onEventChange,
}: CalendarViewProps) {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)");
  const { theme } = useTheme();
  
  // Add state for timezone
  const [timeZone, setTimeZone] = useState<string>(defaultTimeZone);
  
  // Add state for current date
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // For mobile, default to day view but don't force it
  const getResponsiveDefaultView = useCallback(() => {
    if (isMobile) {
      return Views.DAY;
    }
    return defaultView || Views.WEEK;
  }, [isMobile, defaultView]);
  
  const [view, setView] = useState<View>(getResponsiveDefaultView());
  const [height, setHeight] = useState<number>(600);

  // Use the event hook for modal management
  const {
    isModalOpen,
    selectedEvent,
    defaultDate,
    defaultCalendarId,
    createEvent,
    editEvent,
    closeModal,
    deleteEvent
  } = useEvent();
  
  // Update view when screen size changes
  useEffect(() => {
    setView(getResponsiveDefaultView());
  }, [isMobile, defaultView, getResponsiveDefaultView]);
  
  // Update calendar height when window is resized
  useEffect(() => {
    const updateHeight = () => {
      setHeight(getCalendarHeight(isMobile, isTablet));
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [isMobile, isTablet]);
  
  // Localize events to the specified timezone
  const localizedEvents = useMemo(() => {
    // First, ensure all events have proper Date objects
    const processedEvents = events.map(event => ({
      ...event,
      // Ensure these are proper Date objects
      start: event.start instanceof Date ? event.start : new Date(event.start),
      end: event.end instanceof Date ? event.end : new Date(event.end)
    }));
    
    // Then apply timezone conversion
    return processedEvents.map(event => ({
      ...event,
      start: toTimeZone(event.start, timeZone),
      end: toTimeZone(event.end, timeZone),
    }));
  }, [events, timeZone]);
  
  // Initialize custom components
  const components: Components<AppEvent, object> = useMemo(() => ({
    event: EventComponent,
    toolbar: CustomToolbar,
  }), []);
  
  // Handle navigation
  const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY' | Date) => {
    let newDate;
    
    if (action === 'PREV') {
      newDate = new Date(currentDate);
      if (view === Views.MONTH) {
        newDate.setMonth(newDate.getMonth() - 1);
      } else if (view === Views.WEEK) {
        newDate.setDate(newDate.getDate() - 7);
      } else if (view === Views.DAY) {
        newDate.setDate(newDate.getDate() - 1);
      }
    } else if (action === 'NEXT') {
      newDate = new Date(currentDate);
      if (view === Views.MONTH) {
        newDate.setMonth(newDate.getMonth() + 1);
      } else if (view === Views.WEEK) {
        newDate.setDate(newDate.getDate() + 7);
      } else if (view === Views.DAY) {
        newDate.setDate(newDate.getDate() + 1);
      }
    } else if (action === 'TODAY') {
      newDate = new Date();
    } else {
      newDate = new Date(action);
    }
    
    setCurrentDate(newDate);
  };
  
  // Handle slot selection - open event creation modal
  const handleSelectSlot = (slotInfo: { start: Date; end: Date; slots: Date[] | string[]; action: 'select' | 'click' | 'doubleClick' }) => {
    // Convert from local timezone before passing to handler
    const convertedStart = fromTimeZone(slotInfo.start);
    const convertedEnd = fromTimeZone(slotInfo.end);
    
    // Open the event creation modal with the selected date and time
    createEvent(convertedStart, calendarId);
    
    // Also call the original onSelectSlot if provided
    if (onSelectSlot) {
      const convertedSlotInfo = {
        ...slotInfo,
        start: convertedStart,
        end: convertedEnd,
      };
      onSelectSlot(convertedSlotInfo);
    }
  };
  
  // Handle event selection - open event editing modal
  const handleSelectEvent = (event: AppEvent) => {
    // Format the event data for the modal
    const formattedEvent = {
      id: String(event.id),
      title: event.title,
      description: event.description || '',
      start_time: fromTimeZone(event.start).toISOString(),
      end_time: fromTimeZone(event.end).toISOString(),
      location: event.location || '',
      all_day: event.allDay || false,
      calendar_id: calendarId || '',
      color: event.color,
    };
    
    // Open the event editing modal
    editEvent(formattedEvent);
    
    // Also call the original onSelectEvent if provided
    if (onSelectEvent) {
      onSelectEvent(event);
    }
  };
  
  // Handle modal close and refresh events if needed
  const handleModalClose = () => {
    closeModal();
    
    // Refresh events if an onEventChange callback is provided
    if (onEventChange) {
      onEventChange();
    }
  };
  
  // Calculate CSS classes based on device and theme
  const getViewClass = () => {
    const deviceClass = isMobile 
      ? 'calendar-mobile' 
      : isTablet 
        ? 'calendar-tablet' 
        : 'calendar-desktop';
    
    const themeClass = theme === 'dark' ? 'calendar-dark' : 'calendar-light';
    
    return `${deviceClass} ${themeClass}`;
  };
  
  // Calculate appropriate step size for different views
  const getStepSize = () => {
    if (isMobile) {
      return view === Views.DAY ? 30 : 60;
    }
    return 30; // Default 30-minute steps
  };
  
  // Calculate appropriate timeslots
  const getTimeslots = () => {
    if (isMobile) {
      return view === Views.DAY ? 2 : 1;
    }
    return 2; // Default 2 slots per time label
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        {!isMobile && (
          <div className="flex items-center">
            <Label htmlFor="timezone-select" className="mr-2">
              Time Zone:
            </Label>
            <Select
              value={timeZone}
              onValueChange={setTimeZone}
            >
              <SelectTrigger id="timezone-select" className="w-[250px]">
                <SelectValue placeholder="Select a timezone" />
              </SelectTrigger>
              <SelectContent>
                {commonTimeZones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {showThemeControls && (
          <div className={`flex justify-end ${!isMobile ? 'ml-auto' : ''}`}>
            <CalendarThemeConfig />
          </div>
        )}
      </div>
      
      <div className={`${getViewClass()} mb-6`}>
        <Calendar
          events={localizedEvents}
          localizer={localizer}
          startAccessor="start"
          endAccessor="end"
          titleAccessor="title"
          step={getStepSize()}
          timeslots={getTimeslots()}
          defaultView={view}
          view={view}
          views={allViews}
          onView={setView}
          date={currentDate}
          dayLayoutAlgorithm="no-overlap"
          onNavigate={handleNavigate}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          scrollToTime={new Date(new Date().setHours(6))}
          components={components}
          style={{ height }}
        />
      </div>
      
      {/* Event Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        selectedEvent={selectedEvent}
        defaultDate={defaultDate}
        defaultCalendarId={defaultCalendarId || calendarId}
        onDelete={deleteEvent}
      />
      
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="hidden">
          Debug: CalendarID = {calendarId || 'undefined'}
        </div>
      )}
    </div>
  );
} 