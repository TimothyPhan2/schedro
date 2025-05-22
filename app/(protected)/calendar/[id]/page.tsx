import CalendarClient from '@/components/calendar/client';
import { getCalendarData } from '@/lib/utils/data-fetch';
import { getAuthenticatedUser } from '@/lib/supabase/server';

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Get authenticated user
  const { user } = await getAuthenticatedUser();
  
  // If user is not authenticated, handle accordingly
  if (!user) {
    return <div>Please log in to view this calendar</div>;
  }
  const { id } = await params;
  
  // Make sure params is properly awaited before accessing its properties
  const calendarId = id;
  
  if (!calendarId) {
    throw new Error("Calendar ID is required");
  }

  try {
    const calendarData = await getCalendarData(user.id, calendarId);

    // Ensure calendar exists in the returned data
    if (!calendarData?.calendar) {
      return <div>Calendar not found or you don't have access</div>;
    }

    // Ensure events array is defined, even if empty
    const events = calendarData.events || [];

    return (
      <CalendarClient 
        calendarData={{
          calendar: calendarData.calendar,
          events: events
        }} 
        calendarId={calendarId} 
      />
    );
  } catch (error) {
    console.error("Error loading calendar:", error);
    return <div>Failed to load calendar. Please try again later.</div>;
  }
}