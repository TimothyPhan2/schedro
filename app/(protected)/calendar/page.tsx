import { getAuthenticatedUser } from '@/lib/supabase/server';
import { getUserCalendars } from '@/lib/calendars';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import CalendarListClient from '@/components/calendar/calendar-list-client';

export default async function CalendarPage() {
  const { user } = await getAuthenticatedUser();

  if (!user) {
    return <div>Please log in to view your calendars</div>;
  }

  try {
    // Get all calendars for the user
    const calendars = await getUserCalendars(user.id);
    
    // Get event counts for each calendar
    const supabase = await createServerSupabaseClient();
    const eventCountMap: Record<string, number> = {};
    
    if (calendars.length > 0) {
      const { data: allEvents, error: countError } = await supabase
        .from('events')
        .select('calendar_id')
        .in('calendar_id', calendars.map(cal => cal.id));
        
      if (countError) {
        console.error('Error fetching event counts:', countError);
      } else {
        // Count events per calendar
        (allEvents || []).forEach(event => {
          eventCountMap[event.calendar_id] = (eventCountMap[event.calendar_id] || 0) + 1;
        });
      }
    }
    
    // Map event counts to calendars
    const calendarsWithEventCount = calendars.map(calendar => ({
      ...calendar,
      eventCount: eventCountMap[calendar.id] || 0
    }));

    return <CalendarListClient calendars={calendarsWithEventCount} />;
  } catch (error) {
    console.error('Error fetching calendars:', error);
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error Loading Calendars</h1>
          <p className="text-muted-foreground">
            There was an issue loading your calendars. Please try again later.
          </p>
        </div>
      </div>
    );
  }
} 