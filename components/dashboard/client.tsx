
'use client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-context';
import { DashboardMetrics } from '@/components/dashboard/metrics';
import { CalendarList } from '@/components/dashboard/calendar-list';
import { Calendar } from '@/lib/calendars';
import { PlusIcon, CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleDeleteCalendar = async (calendarId: string) => {
    if (!user) return;
    
    if (window.confirm('Are you sure you want to delete this calendar? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/calendars/${calendarId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete calendar');
        }
        
        // Refresh the page to get updated data
        router.refresh();
      } catch (err) {
        console.error('Error deleting calendar:', err);
        alert('Failed to delete calendar. Please try again later.');
      }
    }
  };

  // Empty state component for when there are no calendars
  const EmptyCalendarState = () => (
    <div className="flex flex-col items-center justify-center py-16 border rounded-lg bg-muted/10">
      <CalendarIcon className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-xl font-medium mb-2">No calendars yet</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Get started by creating your first calendar to organize your events and schedule.
      </p>
      <Link href="/calendar/new" passHref>
        <Button className="flex items-center gap-1">
          <PlusIcon className="h-4 w-4" />
          Create Calendar
        </Button>
      </Link>
    </div>
  );

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {user && <p className="text-muted-foreground">Welcome, {user.email}!</p>}
        </div>
        <div className="flex gap-2">
          <Link href="/calendar/new" passHref>
            <Button className="flex items-center gap-1">
              <PlusIcon className="h-4 w-4" />
              New Calendar
            </Button>
          </Link>
          <Button onClick={signOut} variant="outline">Logout</Button>
        </div>
      </div>
      
      <div className="mb-8">
        <DashboardMetrics 
          totalCalendars={dashboardData.metrics.totalCalendars}
          sharedCalendars={dashboardData.metrics.sharedCalendars}
          upcomingEvents={dashboardData.metrics.upcomingEvents}
          lastWeekChange={dashboardData.metrics.lastWeekChange}
        />
      </div>
      
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Calendars</h2>
      </div>
      
      {dashboardData.calendars.length > 0 ? (
        <CalendarList 
          calendars={dashboardData.calendars} 
          onDelete={handleDeleteCalendar}
        />
      ) : (
        <EmptyCalendarState />
      )}
    </div>
  );
}