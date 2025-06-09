'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CalendarView } from '@/components/calendar/calendar-view';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { Calendar } from '@/lib/calendars';
import { AppEvent } from '@/lib/types/event';
import { ArrowLeft, Share2, Trash } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useEvent } from '@/hooks/use-event';
import { EventModal } from '@/components/calendar/event-modal';
import { useDeleteCalendar } from '@/hooks/use-delete-calendar';
import { DeleteCalendarDialog } from '@/components/calendar/delete-calendar-dialog';
import { ShareCalendarDialog } from '@/components/calendar/share-calendar-dialog';

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
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  
  const { 
    isModalOpen, 
    selectedEvent, 
    defaultDate, 
    defaultCalendarId, 
    createEvent, 
    closeModal, 
    deleteEvent 
  } = useEvent();
  const { 
    isDialogOpen, 
    isDeleting, 
    openDeleteDialog, 
    closeDeleteDialog, 
    confirmDelete 
  } = useDeleteCalendar();

  const handleDeleteCalendar = () => {
    openDeleteDialog(calendarId);
  };

  const handleShareCalendar = () => {
    setIsShareDialogOpen(true);
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

  const handleFabClick = () => {
    // Create event with current date and calendar pre-selected
    const today = new Date();
    createEvent(today, calendarId);
  };

  // Handle modal close and refresh
  const handleModalClose = () => {
    closeModal();
    // Force a page refresh to show the new event
    router.refresh();
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
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleShareCalendar}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>

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
                    defaultView={getValidView(calendar.default_view)}
                    calendarId={calendarId}
                />
            </CardContent>
        </Card>
      </div>

      {/* Floating Action Button for mobile event creation */}
      <FloatingActionButton onClick={handleFabClick} />

      {/* Event Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        selectedEvent={selectedEvent}
        defaultDate={defaultDate}
        defaultCalendarId={defaultCalendarId || calendarId}
        onDelete={deleteEvent}
      />

      {/* Delete Calendar Dialog */}
      <DeleteCalendarDialog
        isOpen={isDialogOpen}
        isDeleting={isDeleting}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
      />

      {/* Share Calendar Dialog */}
      <ShareCalendarDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        calendarId={calendarId}
        calendarName={calendar.name}
      />
    </div>
  );
}