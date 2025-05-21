'use client';

import { useMemo, useState, useEffect } from 'react';
import { Calendar, Views, View, Navigate, type DateLocalizer, type Components, type ToolbarProps, type Messages, type EventProps } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { localizer, toTimeZone, fromTimeZone, getDefaultTimeZone } from './localizer';
import type { AppEvent } from '@/lib/types/event';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
import { useCalendarTheme } from '@/hooks/use-calendar-theme';

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon, // For Month View
  ViewIcon,         // For Week View (generic, could be more specific)
  ListIcon,         // For Agenda View
  RectangleVerticalIcon, // For Day view (using a more abstract icon)
} from 'lucide-react';

interface CalendarViewProps {
  events: AppEvent[];
  defaultView?: View;
  defaultTimeZone?: string;
  onSelectEvent?: (event: AppEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date; slots: Date[] | string[]; action: 'select' | 'click' | 'doubleClick' }) => void;
  showThemeControls?: boolean;
  defaultColorScheme?: string;
}

const allViews: View[] = [Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA];

// Custom event display component for better responsive design
const EventComponent = (props: EventProps<AppEvent>) => {
  const { event, title } = props;
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)");
  const { getEventStyle } = useCalendarTheme();
  
  // Get styles for this event, either from the hook or from the event's own color
  const eventStyle = getEventStyle(event.color);
  
  // For small screens, just show title to save space
  if (isMobile) {
    return (
      <div 
        className="rbc-event-content font-medium truncate px-1" 
        style={eventStyle}
      >
        {title}
      </div>
    );
  }
  
  // For medium screens, show title and maybe a short time
  if (isTablet) {
    const startTime = event.start.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
    
    return (
      <div className="flex flex-col px-1" style={eventStyle}>
        <div className="font-medium truncate">{title}</div>
        <div className="text-xs opacity-80">{startTime}</div>
      </div>
    );
  }
  
  // For large screens, show more details
  return (
    <div className="flex flex-col px-1" style={eventStyle}>
      <div className="font-medium truncate">{title}</div>
      {event.location && (
        <div className="text-xs truncate opacity-80">{event.location}</div>
      )}
    </div>
  );
};

// Custom toolbar component with responsive design
const CustomToolbar = (props: ToolbarProps<AppEvent, object>) => {
  const { label, onNavigate, onView, view, views: availableViewsObject } = props;
  const isMobile = useMediaQuery("(max-width: 640px)");

  const navigate = (action: typeof Navigate.PREVIOUS | typeof Navigate.NEXT | typeof Navigate.TODAY | typeof Navigate.DATE) => {
    onNavigate(action);
  };

  const viewNamesGroup = (
    <ToggleGroup 
      type="single" 
      value={view} 
      onValueChange={(selectedView) => {
        if (selectedView) {
          onView(selectedView as View);
        }
      }}
      aria-label="Calendar View"
      className="flex flex-wrap justify-center gap-1"
    >
      {Array.isArray(availableViewsObject) && availableViewsObject.includes(Views.MONTH) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem value={Views.MONTH} aria-label="Month view">
              <CalendarDaysIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>
            <p>Month View</p>
          </TooltipContent>
        </Tooltip>
      )}
      {Array.isArray(availableViewsObject) && availableViewsObject.includes(Views.WEEK) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem value={Views.WEEK} aria-label="Week view">
              <ViewIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>
            <p>Week View</p>
          </TooltipContent>
        </Tooltip>
      )}
      {Array.isArray(availableViewsObject) && availableViewsObject.includes(Views.DAY) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem value={Views.DAY} aria-label="Day view">
              <RectangleVerticalIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>
            <p>Day View</p>
          </TooltipContent>
        </Tooltip>
      )}
      {Array.isArray(availableViewsObject) && availableViewsObject.includes(Views.AGENDA) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem value={Views.AGENDA} aria-label="Agenda view">
              <ListIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>
            <p>Agenda View</p>
          </TooltipContent>
        </Tooltip>
      )}
    </ToggleGroup>
  );

  return (
    <div className="rbc-toolbar mb-4 flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className="rbc-btn-group mb-2 sm:mb-0 flex flex-wrap justify-center w-full sm:w-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" onClick={() => navigate(Navigate.PREVIOUS)} aria-label="Previous Period" size={isMobile ? "sm" : "default"}>
              <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Previous {view}</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" onClick={() => navigate(Navigate.TODAY)} aria-label="Today" className="mx-1" size={isMobile ? "sm" : "default"}>
              Today
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Go to today</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" onClick={() => navigate(Navigate.NEXT)} aria-label="Next Period" size={isMobile ? "sm" : "default"}>
              <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Next {view}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="rbc-toolbar-label text-base sm:text-lg font-semibold mb-2 sm:mb-0 sm:mx-4 text-center">
        {label}
      </div>
      <div className="rbc-btn-group w-full sm:w-auto flex justify-center">
        {viewNamesGroup}
      </div>
    </div>
  );
};

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
}: CalendarViewProps) {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)");
  const { theme } = useTheme();
  
  // Add state for timezone
  const [timeZone, setTimeZone] = useState<string>(defaultTimeZone);
  
  // Add state for current date
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // For mobile, default to day view but don't force it
  const getResponsiveDefaultView = () => {
    if (isMobile) {
      return Views.DAY;
    }
    return defaultView || Views.WEEK;
  };
  
  const [view, setView] = useState<View>(getResponsiveDefaultView());
  const [height, setHeight] = useState<number>(600);
  
  // Update view when screen size changes
  useEffect(() => {
    setView(getResponsiveDefaultView());
  }, [isMobile, defaultView]);
  
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
    return events.map(event => ({
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
  
  // Handle slot selection
  const handleSelectSlot = (slotInfo: { start: Date; end: Date; slots: Date[] | string[]; action: 'select' | 'click' | 'doubleClick' }) => {
    if (onSelectSlot) {
      // Convert back from local timezone before passing to handler
      const convertedSlotInfo = {
        ...slotInfo,
        start: fromTimeZone(slotInfo.start, timeZone),
        end: fromTimeZone(slotInfo.end, timeZone),
      };
      onSelectSlot(convertedSlotInfo);
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
      
      <Calendar
        className={getViewClass()}
        date={currentDate}
        events={localizedEvents}
        localizer={localizer}
        defaultView={getResponsiveDefaultView()}
        views={allViews}
        step={getStepSize()}
        timeslots={getTimeslots()}
        selectable
        popup={isMobile ? true : false}
        length={isMobile ? 50 : 30}
        view={view}
        onView={setView}
        onNavigate={handleNavigate}
        onSelectEvent={onSelectEvent}
        onSelectSlot={handleSelectSlot}
        components={components}
        longPressThreshold={isMobile ? 250 : 500}
        formats={{
          timeGutterFormat: isMobile
            ? (date: Date, culture?: string) => date.toLocaleTimeString(culture, { hour: 'numeric' })
            : (date: Date, culture?: string) => date.toLocaleTimeString(culture, { hour: 'numeric', minute: '2-digit' }),
        }}
        drilldownView={isMobile ? null : Views.DAY}
        style={{ height }}
      />
    </div>
  );
} 