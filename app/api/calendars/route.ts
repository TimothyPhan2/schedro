import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { getUserCalendars, createCalendar } from '@/lib/calendars';
import { validateRequestBody } from '@/lib/validation/api-helpers';
import { createCalendarSchema } from '@/lib/validation/schemas';

// GET /api/calendars - Fetch all calendars for the authenticated user
export async function GET() {
  // Get authenticated user securely
  const { user } = await getAuthenticatedUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const calendars = await getUserCalendars(user.id);
    return NextResponse.json(calendars);
  } catch (error) {
    console.error('Error fetching calendars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendars' },
      { status: 500 }
    );
  }
}

// POST /api/calendars - Create a new calendar
export async function POST(request: Request) {
  // Get authenticated user securely
  const { user } = await getAuthenticatedUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Validate request body with Zod schema
  const bodyValidation = await validateRequestBody(request, createCalendarSchema);
  if (!bodyValidation.success) {
    return bodyValidation.response;
  }

  const calendarData = bodyValidation.data;

  try {
    const calendar = await createCalendar(user.id, {
      ...calendarData,
      description: calendarData.description || undefined
    });
    return NextResponse.json(calendar, { status: 201 });
  } catch (error) {
    console.error('Error creating calendar:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar' },
      { status: 500 }
    );
  }
} 