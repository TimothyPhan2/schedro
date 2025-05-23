'use client';

import { CalendarList } from '@/components/dashboard/calendar-list';
import { Calendar } from '@/lib/calendars';
import { useDeleteCalendar } from '@/hooks/use-delete-calendar';
import { DeleteCalendarDialog } from '@/components/calendar/delete-calendar-dialog';

interface CalendarListClientProps {
  calendars: Array<Calendar & { eventCount?: number }>;
}

export default function CalendarListClient({ calendars }: CalendarListClientProps) {
  const { 
    isDialogOpen, 
    isDeleting, 
    openDeleteDialog, 
    closeDeleteDialog, 
    confirmDelete 
  } = useDeleteCalendar();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Calendars</h1>
        <p className="text-muted-foreground">
          Manage and view all your calendars in one place.
        </p>
      </div>
      <CalendarList calendars={calendars} onDelete={openDeleteDialog} />
      
      {/* Delete Calendar Dialog */}
      <DeleteCalendarDialog
        isOpen={isDialogOpen}
        isDeleting={isDeleting}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
      />
    </div>
  );
} 