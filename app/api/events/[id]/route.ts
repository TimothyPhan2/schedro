import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getAuthenticatedUser } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    // Get authenticated user securely
  const { user } = await getAuthenticatedUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
    
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }
    
    // Get the event and include calendar data
    const { data: event, error } = await supabase
      .from('events')
      .select(`
        *,
        calendars(*)
      `)
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching event:', error);
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Verify the user has access to this event
    if (event.calendars.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error in GET /api/events/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id] - Update an existing event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user securely
    const { user, supabase } = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }
    
    const updateData = await request.json();
    
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
    
    // Format the data for updating
    const eventData = {
      title: updateData.title,
      description: updateData.description || null,
      start_time: updateData.start_time,
      end_time: updateData.end_time,
      location: updateData.location || null,
      all_day: updateData.all_day || false,
      calendar_id: updateData.calendar_id,
      group_id: updateData.group_id || null,
      color: updateData.color || null,
      updated_at: new Date().toISOString()
    };
    
    // Update the event
    const { data: updatedEvent, error } = await supabase
      .from('events')
      .update(eventData)
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
    console.error('Error in PUT /api/events/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Delete an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user securely
    const { user, supabase } = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }
    
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
    console.error('Error in DELETE /api/events/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 