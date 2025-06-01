import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getAuthenticatedUser } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { validateRequestBody } from '@/lib/validation/api-helpers';
import { updateEventSchema, idParamsSchema } from '@/lib/validation/schemas';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    // Get authenticated user securely
    const { user } = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    
    // Validate path parameters
    try {
      idParamsSchema.parse({ id });
    } catch {
      return NextResponse.json(
        { error: 'Invalid event ID format' },
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
      
    if (error || !event) {
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user securely
    const { user, supabase } = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    
    // Validate path parameters
    try {
      idParamsSchema.parse({ id });
    } catch {
      return NextResponse.json(
        { error: 'Invalid event ID format' },
        { status: 400 }
      );
    }
    
    // Validate request body with Zod schema
    const bodyValidation = await validateRequestBody(request, updateEventSchema);
    if (!bodyValidation.success) {
      return bodyValidation.response;
    }
    
    const updateData = bodyValidation.data;
    
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
    
    // Update the event with validated data
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user securely
    const { user, supabase } = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    
    // Validate path parameters
    try {
      idParamsSchema.parse({ id });
    } catch {
      return NextResponse.json(
        { error: 'Invalid event ID format' },
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