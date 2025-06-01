import { Calendar, getCalendarById } from '@/lib/calendars';
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUserCalendars } from '@/lib/calendars';
import { addDays } from 'date-fns';
import { getUserEvents } from '../events';

interface DashboardData {
  metrics: {
    totalCalendars: number;
    sharedCalendars: number;
    upcomingEvents: number;
    lastWeekChange: number;
  };
  calendars: Array<Calendar & { eventCount?: number }>;
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const supabase = await createServerSupabaseClient();
  try {
    // Get all calendars for the user
    const calendars = await getUserCalendars(userId);
    
    // Get count of shared calendars (currently not implemented)
    const sharedCalendars = 0;
    
    // Calculate upcoming events (next 7 days)
    const now = new Date();
    const nextWeek = addDays(now, 7);
    
    let upcomingEvents = [];
    // Create a map to count events per calendar
    const eventCountMap = new Map<string, number>();
    
    if (calendars.length > 0) {
      // Get upcoming events
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id, calendar_id')
        .gte('start_time', now.toISOString())
        .lte('start_time', nextWeek.toISOString())
        .in('calendar_id', calendars.map(cal => cal.id));
      
      if (eventsError) {
        console.error('Error fetching upcoming events:', eventsError);
      } else {
        upcomingEvents = events || [];
      }
      
      // Get event counts for each calendar
      const { data: allEvents, error: countError } = await supabase
        .from('events')
        .select('calendar_id')
        .in('calendar_id', calendars.map(cal => cal.id));
        
      if (countError) {
        console.error('Error fetching event counts:', countError);
      } else {
        // Count events per calendar
        (allEvents || []).forEach(event => {
          eventCountMap.set(event.calendar_id, (eventCountMap.get(event.calendar_id) || 0) + 1);
        });
      }
    }
    
    // Map event counts to calendars
    const calendarsWithEventCount = calendars.map(calendar => ({
      ...calendar,
      eventCount: eventCountMap.get(calendar.id) || 0
    }));
    
    return {
      metrics: {
        totalCalendars: calendars.length,
        sharedCalendars,
        upcomingEvents: upcomingEvents.length || 0,
        lastWeekChange: 0 // This would need to be calculated with historical data
      },
      calendars: calendarsWithEventCount
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Return default data structure to prevent UI errors
    return {
      metrics: {
        totalCalendars: 0,
        sharedCalendars: 0,
        upcomingEvents: 0,
        lastWeekChange: 0
      },
      calendars: []
    };
  }
}

export async function getCalendarData(userId: string, calendarId: string) {
  try {
      // Use Promise.all for parallel execution (already good)
      const [calendar, events] = await Promise.all([
          getCalendarById(userId, calendarId),
          getUserEvents(userId, { calendarId })
      ])
      
      // Validate calendar ownership/access
      if (!calendar) {
          throw new Error('Calendar not found or access denied');
      }
      
      return {
          calendar,
          events: events || []
      }
  } catch (error) {
      console.error('Error fetching calendar data:', error);
      // Re-throw the error so it can be caught by error boundary
      throw new Error(error instanceof Error ? error.message : 'Failed to load calendar data');
  }
}