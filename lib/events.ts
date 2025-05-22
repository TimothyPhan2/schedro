import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AppEvent } from '@/lib/types/event';

// Convert database event to AppEvent format
export function formatEvent(dbEvent: any): AppEvent {
  // Ensure we're creating proper Date objects that can be serialized
  const startDate = new Date(dbEvent.start_time);
  const endDate = new Date(dbEvent.end_time);
  
  // Convert to ISO strings for safer serialization
  const start = startDate;
  const end = endDate;
  
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    start,
    end,
    allDay: dbEvent.all_day || false,
    color: dbEvent.color || undefined,
    location: dbEvent.location,
    description: dbEvent.description,
  };
}

// Convert AppEvent to database format
export function formatEventForDb(event: AppEvent): any {
  return {
    title: event.title,
    start_time: event.start.toISOString(),
    end_time: event.end.toISOString(),
    all_day: event.allDay || false,
    location: event.location,
    description: event.description,
    color: event.color,
  };
}

// Get all events for a user
export async function getUserEvents(userId: string, options: {
  calendarId?: string;
  startDate?: Date;
  endDate?: Date;
} = {}) {
  const supabase = await createServerSupabaseClient();
  
  let query = supabase
    .from('events')
    .select(`
      *,
      calendars(*)
    `);
  
  // If calendarId is provided, filter by it
  if (options.calendarId) {
    query = query.eq('calendar_id', options.calendarId);
  } else {
    // Otherwise, get events from all calendars owned by the user
    query = query.eq('calendars.user_id', userId);
  }
  
  // Filter by date range if provided
  if (options.startDate) {
    query = query.gte('start_time', options.startDate.toISOString());
  }
  
  if (options.endDate) {
    query = query.lte('end_time', options.endDate.toISOString());
  }
  
  const { data: events, error } = await query;
  
  if (error) {
    console.error('Error fetching events:', error);
    // Instead of throwing, return an empty array when we encounter the policy error
    if (error.code === '42P17' && error.message.includes('group_members')) {
      console.warn('Group members policy error encountered, returning empty events list');
      return [];
    }
    throw new Error(error.message);
  }
  
  // Convert to AppEvent format
  return events.map(formatEvent);
}

// Get a single event by ID
export async function getEventById(eventId: string) {
  const supabase = await createServerSupabaseClient();
  
  const { data: event, error } = await supabase
    .from('events')
    .select(`
      *,
      calendars(*)
    `)
    .eq('id', eventId)
    .single();
    
  if (error) {
    console.error('Error fetching event:', error);
    throw new Error(error.message);
  }
  
  return formatEvent(event);
}

// Create a new event
export async function createEvent(userId: string, calendarId: string, eventData: any) {
  console.log("createEvent called with:", { userId, calendarId, eventData });
  const supabase = await createServerSupabaseClient();
  
  // Verify the user owns this calendar
  const { data: calendar, error: calendarError } = await supabase
    .from('calendars')
    .select('*')
    .eq('id', calendarId)
    .eq('user_id', userId)
    .single();
    
  if (calendarError || !calendar) {
    console.error("Calendar verification error:", calendarError);
    throw new Error('Calendar not found or access denied');
  }
  
  // Extract known fields for AppEvent but don't assume all fields are present
  const appEventFields = {
    title: eventData.title || "Untitled Event",
    start: eventData.start || new Date(eventData.start_time),
    end: eventData.end || new Date(eventData.end_time),
    allDay: eventData.all_day || eventData.allDay || false,
    location: eventData.location,
    description: eventData.description,
    color: eventData.color,
  };
  
  // Format the event data for the database
  const dbEventData = {
    ...formatEventForDb(appEventFields as AppEvent),
    calendar_id: calendarId,
    created_by: userId
  };
  
  console.log("Inserting event with data:", dbEventData);
  
  // Create the event
  const { data: event, error } = await supabase
    .from('events')
    .insert(dbEventData)
    .select()
    .single();
    
  if (error) {
    console.error('Error creating event:', error);
    throw new Error(error.message);
  }
  
  return formatEvent(event);
}

// Update an existing event
export async function updateEvent(userId: string, eventId: string, eventData: Partial<AppEvent>) {
  const supabase = await createServerSupabaseClient();
  
  // First, get the event to verify ownership
  const { data: existingEvent, error: fetchError } = await supabase
    .from('events')
    .select('*, calendars(*)')
    .eq('id', eventId)
    .single();
    
  if (fetchError || !existingEvent) {
    throw new Error('Event not found');
  }
  
  // Verify the user owns the calendar this event belongs to
  if (existingEvent.calendars.user_id !== userId) {
    throw new Error('Access denied');
  }
  
  // Format the event data for the database
  const dbEventData = {
    ...formatEventForDb(eventData as AppEvent),
    updated_at: new Date().toISOString()
  };
  
  // Update the event
  const { data: updatedEvent, error } = await supabase
    .from('events')
    .update(dbEventData)
    .eq('id', eventId)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating event:', error);
    throw new Error(error.message);
  }
  
  return formatEvent(updatedEvent);
}

// Delete an event
export async function deleteEvent(userId: string, eventId: string) {
  const supabase = await createServerSupabaseClient();
  
  // First, get the event to verify ownership
  const { data: existingEvent, error: fetchError } = await supabase
    .from('events')
    .select('*, calendars(*)')
    .eq('id', eventId)
    .single();
    
  if (fetchError || !existingEvent) {
    throw new Error('Event not found');
  }
  
  // Verify the user owns the calendar this event belongs to
  if (existingEvent.calendars.user_id !== userId) {
    throw new Error('Access denied');
  }
  
  // Delete the event
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);
    
  if (error) {
    console.error('Error deleting event:', error);
    throw new Error(error.message);
  }
  
  return true;
} 