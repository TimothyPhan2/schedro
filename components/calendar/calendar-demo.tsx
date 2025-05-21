'use client';

import { useState } from 'react';
import { CalendarView } from './calendar-view';
import type { AppEvent } from '@/lib/types/event';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EventColorScheme, useCalendarTheme } from '@/hooks/use-calendar-theme';

const demoEvents: AppEvent[] = [
  {
    id: 1,
    title: 'Team Meeting',
    start: new Date(new Date().setHours(10, 0, 0)),
    end: new Date(new Date().setHours(11, 30, 0)),
    location: 'Conference Room A'
  },
  {
    id: 2,
    title: 'Lunch with Clients',
    start: new Date(new Date().setHours(12, 30, 0)),
    end: new Date(new Date().setHours(14, 0, 0)),
    location: 'Riverside Cafe',
    color: '#f59e0b' // Amber color
  },
  {
    id: 3,
    title: 'Project Review',
    start: new Date(new Date().setHours(15, 0, 0)),
    end: new Date(new Date().setHours(16, 30, 0)),
    location: 'Virtual Meeting Room'
  },
  {
    id: 4,
    title: 'All-Day Conference',
    start: new Date(new Date().setHours(0, 0, 0)),
    end: new Date(new Date().setHours(23, 59, 0)),
    allDay: true,
    color: '#8b5cf6' // Purple color
  },
  {
    id: 5,
    title: 'Product Demo',
    start: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(11, 0, 0)),
    end: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(12, 0, 0)),
    location: 'Customer Office'
  },
  {
    id: 6,
    title: 'Strategy Planning',
    start: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(14, 0, 0)),
    end: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(16, 0, 0)),
    location: 'Meeting Room B',
    color: '#10b981' // Green color
  }
];

export function CalendarDemo() {
  const [events] = useState<AppEvent[]>(demoEvents);
  const { colorScheme } = useCalendarTheme();
  
  const handleEventClick = (event: AppEvent) => {
    alert(`Selected event: ${event.title}`);
  };
  
  const handleSlotSelect = (slotInfo: { start: Date; end: Date }) => {
    console.log('Selected slot:', { start: slotInfo.start, end: slotInfo.end });
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <CalendarView 
          events={events} 
          onSelectEvent={handleEventClick}
          onSelectSlot={handleSlotSelect}
          showThemeControls={true}
          defaultColorScheme={colorScheme}
        />
      </CardContent>
    </Card>
  );
} 