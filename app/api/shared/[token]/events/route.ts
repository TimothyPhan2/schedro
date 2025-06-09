import { NextRequest, NextResponse } from 'next/server'
import { PermissionValidator } from '@/lib/permissions/validator'
import { createAnonymousSupabaseClient } from '@/lib/supabase/server'
import type { AppEvent } from '@/lib/types/event'

interface CreateEventFunctionResult {
  success: boolean
  event?: {
    id: string
    title: string
    start_time: string
    end_time: string
    all_day: boolean
    color: string
    location: string
    description: string
  }
  error?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
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

    // Get events for the calendar using Supabase
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('calendar_id', validation.permission.calendarId)
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Error fetching shared calendar events:', error)
      return NextResponse.json(
        { error: 'Failed to fetch calendar events' },
        { status: 500 }
      )
    }

    // Transform database events to AppEvent format
    const formattedEvents: AppEvent[] = (events || []).map(event => ({
      id: event.id,
      title: event.title,
      start: new Date(event.start_time),
      end: new Date(event.end_time),
      allDay: event.all_day || false,
      color: event.color || '#3b82f6',
      location: event.location || '',
      description: event.description || '',
    }))

    // Return data in the format expected by SharedCalendarView
    return NextResponse.json({ 
      events: formattedEvents,
      calendarId: validation.permission.calendarId,
      permissions: validation.permission.level,
      isPasswordProtected: validation.permission.isPasswordProtected,
      expiresAt: validation.permission.expiresAt?.toISOString() || null
    })

  } catch (error) {
    console.error('Error fetching shared calendar events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const password = searchParams.get('password') || undefined

    // Create server-side Supabase client for calling the function
    const supabase = await createAnonymousSupabaseClient()

    // Validate required fields
    const { title, start_time, end_time, all_day = false, location = '', description = '' } = body

    if (!title || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Missing required fields: title, start_time, end_time' },
        { status: 400 }
      )
    }

    // Call the database function to create the event
    const { data: result, error } = await supabase
      .rpc('create_shared_event', {
        p_token: token,
        p_title: title,
        p_start_time: start_time,
        p_end_time: end_time,
        p_all_day: all_day,
        p_location: location,
        p_description: description,
        p_color: '#3b82f6',
        p_password: password
      })

    if (error) {
      console.error('Error calling create_shared_event function:', error)
      return NextResponse.json(
        { error: 'Failed to create event' },
        { status: 500 }
      )
    }

    // Parse the JSON result from the function
    const functionResult = result as CreateEventFunctionResult

    if (!functionResult.success || !functionResult.event) {
      return NextResponse.json(
        { error: functionResult.error || 'Failed to create event' },
        { status: 400 }
      )
    }

    const event = functionResult.event

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
    console.error('Error creating shared calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
} 