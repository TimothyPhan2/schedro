'use client';

import { type EventProps } from 'react-big-calendar';
import type { AppEvent } from '@/lib/types/event';
import { useMediaQuery } from "@/hooks/use-media-query";
import { useCalendarTheme } from '@/hooks/use-calendar-theme';

export const EventComponent = (props: EventProps<AppEvent>) => {
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