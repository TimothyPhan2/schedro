import { NextRequest, NextResponse } from 'next/server'
import { PermissionValidator } from '@/lib/permissions/validator'
import { createAnonymousSupabaseClient } from '@/lib/supabase/server'
import type { AppEvent } from '@/lib/types/event'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string; eventId: string }> }
) {
  try {
    const { token, eventId } = await params
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const password = searchParams.get('password') || undefined

    // Create server-side Supabase client and pass to PermissionValidator
    const supabase = await createAnonymousSupabaseClient()
    const validator = new PermissionValidator(supabase)
    const validation = await validator.validateToken(token, password)

    if (!validation.isValid || !validation.permission) {
      return NextResponse.json(
        { error: 'Unauthorized access to this calendar' },
        { status: 401 }
      )
    }

    // Check if user has edit permissions
    if (validation.permission.level !== 'edit') {
      return NextResponse.json(
        { error: 'Insufficient permissions to edit events' },
        { status: 403 }
      )
    }

    // Verify the event belongs to the shared calendar
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .eq('calendar_id', validation.permission.calendarId)
      .single()

    if (fetchError || !existingEvent) {
      return NextResponse.json(
        { error: 'Event not found or access denied' },
        { status: 404 }
      )
    }

    // Validate required fields
    const { title, start_time, end_time, all_day = false, location = '', description = '' } = body

    if (!title || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Missing required fields: title, start_time, end_time' },
        { status: 400 }
      )
    }

    // Update the event
    const { data: event, error } = await supabase
      .from('events')
      .update({
        title,
        start_time,
        end_time,
        all_day,
        location,
        description,
      })
      .eq('id', eventId)
      .eq('calendar_id', validation.permission.calendarId)
      .select()
      .single()

    if (error) {
      console.error('Error updating shared calendar event:', error)
      return NextResponse.json(
        { error: 'Failed to update event' },
        { status: 500 }
      )
    }

    // Transform to AppEvent format
    const formattedEvent: AppEvent = {
      id: event.id,
      title: event.title,
      start: new Date(event.start_time),
      end: new Date(event.end_time),
      allDay: event.all_day || false,
      color: event.color || '#3b82f6',
      location: event.location || '',
      description: event.description || '',
    }

    return NextResponse.json(formattedEvent)

  } catch (error) {
    console.error('Error updating shared calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ token: string; eventId: string }> }
) {
  try {
    const { token, eventId } = await params
    const { searchParams } = new URL(request.url)
    const password = searchParams.get('password') || undefined

    // Create server-side Supabase client and pass to PermissionValidator
    const supabase = await createAnonymousSupabaseClient()
    const validator = new PermissionValidator(supabase)
    const validation = await validator.validateToken(token, password)

    if (!validation.isValid || !validation.permission) {
      return NextResponse.json(
        { error: 'Unauthorized access to this calendar' },
        { status: 401 }
      )
    }

    // Check if user has edit permissions
    if (validation.permission.level !== 'edit') {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete events' },
        { status: 403 }
      )
    }

    // Verify the event belongs to the shared calendar and delete it
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)
      .eq('calendar_id', validation.permission.calendarId)

    if (error) {
      console.error('Error deleting shared calendar event:', error)
      return NextResponse.json(
        { error: 'Failed to delete event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting shared calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
} 