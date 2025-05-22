'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CalendarView } from '@/components/calendar/calendar-view';
import { Calendar } from '@/lib/calendars';
import { AppEvent } from '@/lib/types/event';
import { ArrowLeft, Share2, Edit, Trash } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface CalendarData {
  calendar: Calendar;
  events: AppEvent[];
}

export default function CalendarClient({
  calendarData,
  calendarId
}: {
  calendarData: CalendarData;
  calendarId: string;
}) {
  const router = useRouter();
  const { calendar, events } = calendarData;

  const handleDeleteCalendar = async () => {
    if (window.confirm('Are you sure you want to delete this calendar? All events will be deleted.')) {
      try {
        const response = await fetch(`/api/calendars/${calendarId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete calendar');
        }
        
        // Redirect to dashboard after successful deletion
        router.push('/dashboard');
      } catch (err) {
        console.error('Error deleting calendar:', err);
        alert('Failed to delete calendar. Please try again later.');
      }
    }
  };

  const handleSelectEvent = (event: AppEvent) => {
    // Open event details modal or navigate to event page
    console.log('Selected event:', event);
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    // Open create event modal or navigate to create event page
    console.log('Selected slot:', slotInfo);
  };

  // Convert string view to valid View type
  const getValidView = (view?: string) => {
    switch (view) {
      case 'day': return 'day';
      case 'month': return 'month';
      case 'agenda': return 'agenda';
      default: return 'week';
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              <span className="ml-1">Back</span>
            </Link>
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Link href={`/calendar/${calendarId}/edit`} passHref>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1 text-destructive hover:bg-destructive/10"
            onClick={handleDeleteCalendar}
          >
            <Trash className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
      
      <div className="mt-6">
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">
                    {calendar.name}
                </CardTitle>
            </CardHeader>
            <CardDescription>
                {calendar.description}
            </CardDescription>
            <CardContent>
                <CalendarView 
                    events={events}
                    onSelectEvent={handleSelectEvent}
                    onSelectSlot={handleSelectSlot}
                    defaultView={getValidView(calendar.default_view)}
                />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}