'use client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-context';
import { DashboardMetrics } from '@/components/dashboard/metrics';
import { CalendarList } from '@/components/dashboard/calendar-list';
import { Calendar } from '@/lib/calendars';
import { PlusIcon, CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { useDeleteCalendar } from '@/hooks/use-delete-calendar';
import { DeleteCalendarDialog } from '@/components/calendar/delete-calendar-dialog';

// Define your types
interface DashboardData {
  metrics: {
    totalCalendars: number;
    sharedCalendars: number;
    upcomingEvents: number;
    lastWeekChange: number;
  };
  calendars: Array<Calendar & { eventCount?: number }>;
}

export default function DashboardClient({ 
  dashboardData
}: { 
  dashboardData: DashboardData
}) {
  const { user } = useAuth();
  const { 
    isDialogOpen, 
    isDeleting, 
    openDeleteDialog, 
    closeDeleteDialog, 
    confirmDelete 
  } = useDeleteCalendar();

  // Empty state component for when there are no calendars
  const EmptyCalendarState = () => (
    <div className="flex flex-col items-center justify-center py-12 md:py-16 px-4 border rounded-lg bg-muted/10">
      <CalendarIcon className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mb-4" />
      <h3 className="text-lg md:text-xl font-medium mb-2 text-center">No calendars yet</h3>
      <p className="text-sm md:text-base text-muted-foreground text-center max-w-md mb-6 px-2">
        Get started by creating your first calendar to organize your events and schedule.
      </p>
      <Link href="/calendar/new" passHref>
        <Button className="flex items-center gap-1" size="lg">
          <PlusIcon className="h-4 w-4" />
          Create Calendar
        </Button>
      </Link>
    </div>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      {/* Simplified mobile-optimized header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-start sm:space-y-0 mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          {user && (
            <p className="text-sm md:text-base text-muted-foreground">
              Welcome back! Here&apos;s your calendar overview.
            </p>
          )}
        </div>
        
        {/* Mobile-optimized action button */}
        <div className="w-full sm:w-auto">
          <Link href="/calendar/new" passHref className="block">
            <Button className="flex items-center justify-center gap-1 w-full sm:w-auto" size="sm">
              <PlusIcon className="h-4 w-4" />
              <span>New Calendar</span>
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Use CSS Grid to reorder sections on mobile */}
      <div className="grid grid-cols-1 gap-6 md:gap-8">
        {/* Metrics Section - appears second on mobile (order-2), first on desktop (md:order-1) */}
        <section className="order-2 md:order-1">
          <DashboardMetrics 
            totalCalendars={dashboardData.metrics.totalCalendars}
            sharedCalendars={dashboardData.metrics.sharedCalendars}
            upcomingEvents={dashboardData.metrics.upcomingEvents}
            lastWeekChange={dashboardData.metrics.lastWeekChange}
          />
        </section>
        
        {/* Calendars Section - appears first on mobile (order-1), second on desktop (md:order-2) */}
        <section className="order-1 md:order-2">
          <div className="mb-4 md:mb-6 flex justify-between items-center">
            <h2 className="text-xl md:text-2xl font-bold">My Calendars</h2>
          </div>
          
          {dashboardData.calendars.length > 0 ? (
            <CalendarList 
              calendars={dashboardData.calendars} 
              onDelete={openDeleteDialog}
            />
          ) : (
            <EmptyCalendarState />
          )}
        </section>
      </div>

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