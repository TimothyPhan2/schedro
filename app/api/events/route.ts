import { NextResponse } from 'next/server';
import { createServerSupabaseClient, getAuthenticatedUser } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getUserEvents, createEvent } from '@/lib/events';
import { getCalendarById } from '@/lib/calendars';
import { validateRequestBody, validateQueryParams } from '@/lib/validation/api-helpers';
import { createEventSchema, eventQuerySchema } from '@/lib/validation/schemas';

// GET /api/events - Fetch all events for the authenticated user
export async function GET(request: Request) {
  // Get authenticated user securely
  const { user } = await getAuthenticatedUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Validate query parameters
  const queryValidation = validateQueryParams(request, eventQuerySchema);
  if (!queryValidation.success) {
    return queryValidation.response;
  }

  const { calendarId, startDate, endDate } = queryValidation.data;

  // Build options object
  const options: {
    calendarId?: string;
    startDate?: Date;
    endDate?: Date;
  } = {};

  if (calendarId) {
    // Verify user owns or has access to this calendar
    try {
      await getCalendarById(user.id, calendarId);
      options.calendarId = calendarId;
    } catch {
      return NextResponse.json({ error: 'Calendar not found or access denied' }, { status: 403 });
    }
  }

  if (startDate) {
    options.startDate = new Date(startDate);
  }

  if (endDate) {
    options.endDate = new Date(endDate);
  }

  try {
    const events = await getUserEvents(user.id, options);
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST /api/events - Create a new event
export async function POST(request: Request) {
  // Get authenticated user securely
  const { user } = await getAuthenticatedUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Validate request body with Zod schema
  const bodyValidation = await validateRequestBody(request, createEventSchema);
  if (!bodyValidation.success) {
    return bodyValidation.response;
  }

  const eventData = bodyValidation.data;

  try {
    // Handle both calendarId (API) and calendar_id (DB) field names for flexibility
    const calendarId = eventData.calendarId || eventData.calendar_id;

    // Verify user owns the calendar
    try {
      await getCalendarById(user.id, calendarId);
    } catch {
      return NextResponse.json({ error: 'Calendar access denied' }, { status: 403 });
    }

    console.log("Creating event with validated data:", {
      ...eventData,
      calendarId,
    });

    // Create the event with validated data
    const event = await createEvent(user.id, calendarId, eventData);
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

// PATCH /api/events - Update an existing event
export async function PATCH(request: Request) {
  try {
    // Get authenticated user securely
    const { user } = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const eventData = await request.json();
    const { id, ...updateData } = eventData;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }
    
    const supabase = await createServerSupabaseClient();
    
    // First, get the event to verify ownership
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('*, calendars(*)')
      .eq('id', id)
      .single();
      
    if (fetchError || !existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Verify the user owns the calendar this event belongs to
    if (existingEvent.calendars.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Update the event
    const { data: updatedEvent, error } = await supabase
      .from('events')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating event:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    // Revalidate the events path to update any cached data
    revalidatePath('/api/events');
    revalidatePath(`/api/events/${id}`);
    
    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error in PATCH /api/events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/events?id=<event_id> - Delete an event
export async function DELETE(request: Request) {
  try {
    // Get authenticated user securely
    const { user } = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }
    
    const supabase = await createServerSupabaseClient();
    
    // First, get the event to verify ownership
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('*, calendars(*)')
      .eq('id', id)
      .single();
      
    if (fetchError || !existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Verify the user owns the calendar this event belongs to
    if (existingEvent.calendars.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Delete the event
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting event:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    // Revalidate the events path to update any cached data
    revalidatePath('/api/events');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 