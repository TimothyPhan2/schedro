import { NextRequest, NextResponse } from 'next/server'
import { PermissionValidator } from '@/lib/permissions/validator'
import { createAnonymousSupabaseClient } from '@/lib/supabase/server'
import type { AppEvent } from '@/lib/types/event'

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