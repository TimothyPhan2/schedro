import { NextResponse } from 'next/server';
import { createServerSupabaseClient, getAuthenticatedUser } from '@/lib/supabase/server';
import { getUserCalendars, createCalendar } from '@/lib/calendars';

// GET /api/calendars - Fetch all calendars for the authenticated user
export async function GET(request: Request) {
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
  
  try {
    const calendarData = await request.json();
    
    if (!calendarData.name) {
      return NextResponse.json(
        { error: 'Calendar name is required' },
        { status: 400 }
      );
    }
    
    const calendar = await createCalendar(user.id, {
      name: calendarData.name,
      description: calendarData.description,
      default_view: calendarData.default_view || 'week',
      is_primary: calendarData.is_primary
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