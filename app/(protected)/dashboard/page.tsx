'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-context';
import { CalendarDemo } from '@/components/calendar/calendar-demo';
import type { AppEvent } from '@/lib/types/event';
import { addHours, startOfDay, addDays } from 'date-fns';

// Sample events for demonstration
const now = new Date();
const todayStart = startOfDay(now);

const sampleEvents: AppEvent[] = [
  {
    id: 1,
    title: 'Meeting with Team A',
    start: addHours(todayStart, 10), // Today at 10:00 AM
    end: addHours(todayStart, 11),   // Today at 11:00 AM
  },
  {
    id: 2,
    title: 'Lunch with Client',
    start: addHours(todayStart, 13), // Today at 1:00 PM
    end: addHours(todayStart, 14),   // Today at 2:00 PM
  },
  {
    id: 3,
    title: 'Project Deadline',
    start: addDays(todayStart, 2), // Day after tomorrow, all day
    end: addDays(todayStart, 2),
    allDay: true,
  },
  {
    id: 4,
    title: 'Dentist Appointment',
    start: addHours(addDays(todayStart, -1), 15), // Yesterday at 3:00 PM
    end: addHours(addDays(todayStart, -1), 16),   // Yesterday at 4:00 PM
  },
];

export default function DashboardPage() {
  const { user, signOut } = useAuth();

  const handleSelectEvent = (event: AppEvent) => {
    alert(`Selected event: ${event.title}`);
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date; }) => {
    alert(
      `Selected slot: \nStart: ${slotInfo.start.toLocaleString()} \nEnd: ${slotInfo.end.toLocaleString()}`
    );
    // Here you would typically open a modal to create a new event
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {user && <p className="text-muted-foreground">Welcome, {user.email}!</p>}
        </div>
        <Button onClick={signOut} variant="outline">Logout</Button>
      </div>
      
      <div className="mt-8">
        <CalendarDemo />
        
        {/* Original calendar implementation - uncomment to restore
        <CalendarView 
          events={sampleEvents} 
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
        />
        */}
      </div>
    </div>
  );
} 