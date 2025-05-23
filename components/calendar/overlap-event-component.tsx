'use client';

import { type EventProps } from 'react-big-calendar';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useCalendarTheme } from '@/hooks/use-calendar-theme';
import type { AppEvent } from '@/lib/types/event';

interface OverlapEventComponentProps extends EventProps<AppEvent> {
  onEventClick: (event: AppEvent) => void;
}

export function OverlapEventComponent({ 
  event, 
  title,
  onEventClick 
}: OverlapEventComponentProps) {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)");
  const { getEventStyle } = useCalendarTheme();

  // Get styles for this event
  const eventStyle = getEventStyle(event.color);
  
  // Simple event component without overlap handling
  return (
    <div 
      className="rbc-event-content font-medium truncate px-2 py-1 cursor-pointer hover:opacity-80 transition-opacity"
      style={eventStyle}
      onClick={() => onEventClick(event)}
    >
      <div className="truncate text-sm">{title}</div>
      {!isMobile && event.location && (
        <div className="text-xs opacity-75 truncate">{event.location}</div>
      )}
      {isTablet && !event.location && (
        <div className="text-xs opacity-80">
          {new Date(event.start).toLocaleTimeString([], { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })}
        </div>
      )}
    </div>
  );
} 