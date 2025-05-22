import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Database } from './database.types';

export type Calendar = Database['public']['Tables']['calendars']['Row'];

// Get all calendars for a user
export async function getUserCalendars(userId: string, options: {
  isPrimary?: boolean;
} = {}) {
  const supabase = await createServerSupabaseClient();
  
  let query = supabase
    .from('calendars')
    .select('*')
    .eq('user_id', userId);
  
  // Filter by is_primary if provided
  if (options.isPrimary) {
    query = query.eq('is_primary', true);
  }
  
  const { data: calendars, error } = await query;
  
  if (error) {
    console.error('Error fetching calendars:', error);
    throw new Error(error.message);
  }
  
  return calendars;
}

// Get a single calendar by ID
export async function getCalendarById(userId: string, calendarId: string) {
  const supabase = await  createServerSupabaseClient();
  
  const { data: calendar, error } = await supabase
    .from('calendars')
    .select('*')
    .eq('id', calendarId)
    .eq('user_id', userId)
    .single();
    
  if (error) {
    console.error('Error fetching calendar:', error);
    throw new Error(error.message);
  }
  
  return calendar;
}

// Get the primary calendar for a user
export async function getPrimaryCalendar(userId: string) {
  const supabase = await createServerSupabaseClient();
  
  const { data: calendar, error } = await supabase
    .from('calendars')
    .select('*')
    .eq('user_id', userId)
    .eq('is_primary', true)
    .single();
    
  if (error) {
    console.error('Error fetching primary calendar:', error);
    throw new Error(error.message);
  }
  
  return calendar;
}

// Create a new calendar
export async function createCalendar(userId: string, calendarData: {
  name: string;
  description?: string;
  default_view?: string;
  is_primary?: boolean;
}) {
  const supabase = await createServerSupabaseClient();
  
  // Check if this is the first calendar for the user
  const { data: existingCalendars, error: countError } = await supabase
    .from('calendars')
    .select('id')
    .eq('user_id', userId);
  
  if (countError) {
    console.error('Error checking existing calendars:', countError);
    throw new Error(countError.message);
  }
  
  // If this is the first calendar, make it primary
  const shouldBePrimary = calendarData.is_primary || existingCalendars.length === 0;
  
  // If setting this calendar as primary, unset any existing primary calendar
  if (shouldBePrimary && existingCalendars.length > 0) {
    const { error: updateError } = await supabase
      .from('calendars')
      .update({ is_primary: false })
      .eq('user_id', userId)
      .eq('is_primary', true);
    
    if (updateError) {
      console.error('Error updating existing primary calendar:', updateError);
      throw new Error(updateError.message);
    }
  }
  
  // Create the calendar
  const { data: calendar, error } = await supabase
    .from('calendars')
    .insert({
      name: calendarData.name,
      description: calendarData.description,
      default_view: calendarData.default_view || 'week',
      is_primary: shouldBePrimary,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating calendar:', error);
    throw new Error(error.message);
  }
  
  return calendar;
}

// Update an existing calendar
export async function updateCalendar(userId: string, calendarId: string, updateData: Partial<Calendar>) {
  const supabase = await createServerSupabaseClient();
  
  // First, get the calendar to verify ownership
  const { data: existingCalendar, error: fetchError } = await supabase
    .from('calendars')
    .select('*')
    .eq('id', calendarId)
    .eq('user_id', userId)
    .single();
    
  if (fetchError || !existingCalendar) {
    throw new Error('Calendar not found or access denied');
  }
  
  // If setting this calendar as primary, unset any existing primary calendar
  if (updateData.is_primary) {
    const { error: updateError } = await supabase
      .from('calendars')
      .update({ is_primary: false })
      .eq('user_id', userId)
      .eq('is_primary', true)
      .neq('id', calendarId);
    
    if (updateError) {
      console.error('Error updating existing primary calendar:', updateError);
      throw new Error(updateError.message);
    }
  }
  
  // Update the calendar
  const { data: updatedCalendar, error } = await supabase
    .from('calendars')
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', calendarId)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating calendar:', error);
    throw new Error(error.message);
  }
  
  return updatedCalendar;
}

// Delete a calendar
export async function deleteCalendar(userId: string, calendarId: string) {
  const supabase = await createServerSupabaseClient();
  
  // First, get the calendar to verify ownership
  const { data: existingCalendar, error: fetchError } = await supabase
    .from('calendars')
    .select('*')
    .eq('id', calendarId)
    .eq('user_id', userId)
    .single();
    
  if (fetchError || !existingCalendar) {
    throw new Error('Calendar not found or access denied');
  }
  
  // Don't allow deletion of the primary calendar if there are other calendars
  if (existingCalendar.is_primary) {
    const { data: otherCalendars, error: countError } = await supabase
      .from('calendars')
      .select('id')
      .eq('user_id', userId)
      .neq('id', calendarId);
    
    if (countError) {
      console.error('Error checking other calendars:', countError);
      throw new Error(countError.message);
    }
    
    if (otherCalendars.length > 0) {
      throw new Error('Cannot delete primary calendar. Please set another calendar as primary first.');
    }
  }
  
  // Delete the calendar
  const { error } = await supabase
    .from('calendars')
    .delete()
    .eq('id', calendarId);
    
  if (error) {
    console.error('Error deleting calendar:', error);
    throw new Error(error.message);
  }
  
  return true;
} 