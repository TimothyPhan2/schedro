import CalendarClient from '@/components/calendar/client';
import { getCalendarData } from '@/lib/utils/data-fetch';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { Suspense } from 'react';
import CalendarLoading from './loading';

// Revalidate this page every 5 minutes
export const revalidate = 300;

// Separate component for calendar content that can be streamed
async function CalendarContent({ 
  userId, 
  calendarId 
}: { 
  userId: string; 
  calendarId: string; 
}) {
  const calendarData = await getCalendarData(userId, calendarId);

  // Ensure calendar exists in the returned data
  if (!calendarData?.calendar) {
    return <div>Calendar not found or you don&apos;t have access</div>;
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
}

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Get authenticated user first (this should be fast)
  const { user } = await getAuthenticatedUser();
  
  // If user is not authenticated, handle accordingly
  if (!user) {
    return <div>Please log in to view this calendar</div>;
  }
  
  const { id } = await params;
  const calendarId = id;
  
  if (!calendarId) {
    throw new Error("Calendar ID is required");
  }

  return (
    <div>
      {/* Show loading state while calendar data loads */}
      <Suspense fallback={<CalendarLoading />}>
        <CalendarContent userId={user.id} calendarId={calendarId} />
      </Suspense>
    </div>
  );
}