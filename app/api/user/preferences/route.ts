import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';

// GET - Fetch user preferences
export async function GET() {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user preferences
    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // If no preferences found, return defaults
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          preferences: null,
          hasPreferences: false
        });
      }
      throw error;
    }

    return NextResponse.json({
      preferences,
      hasPreferences: true
    });

  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user preferences' },
      { status: 500 }
    );
  }
}

// PUT - Update user preferences
export async function PUT(request: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields and clean the data
    const updateData = {
      user_id: user.id,
      display_name: body.display_name || null,
      avatar_url: body.avatar_url || null,
      bio: body.bio || null,
      timezone: body.timezone || 'UTC',
      locale: body.locale || 'en-US',
      date_format: body.date_format || 'MM/dd/yyyy',
      time_format: body.time_format || '12h',
      default_view: body.default_view || 'week',
      start_of_week: typeof body.start_of_week === 'number' ? body.start_of_week : 1,
      show_weekends: body.show_weekends !== false,
      show_declined_events: body.show_declined_events === true,
      compact_view: body.compact_view === true,
      default_event_duration: body.default_event_duration || 60,
      default_event_color: body.default_event_color || '#3b82f6',
      enable_event_reminders: body.enable_event_reminders !== false,
      default_reminder_minutes: body.default_reminder_minutes || 15,
      email_notifications: body.email_notifications !== false,
      calendar_invitations: body.calendar_invitations !== false,
      event_reminders: body.event_reminders !== false,
      shared_calendar_updates: body.shared_calendar_updates !== false,
      allow_public_profile: body.allow_public_profile === true,
      default_calendar_visibility: body.default_calendar_visibility || 'private',
      theme: body.theme || 'system',
      sidebar_collapsed: body.sidebar_collapsed === true,
      enable_animations: body.enable_animations !== false,
      high_contrast: body.high_contrast === true,
      large_text: body.large_text === true,
      reduced_motion: body.reduced_motion === true,
      updated_at: new Date().toISOString()
    };

    // Try to update existing preferences first
    const { data: existingPrefs } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let result;
    if (existingPrefs) {
      // Update existing preferences
      const { data, error } = await supabase
        .from('user_preferences')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Create new preferences
      const { data, error } = await supabase
        .from('user_preferences')
        .insert(updateData)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }

    return NextResponse.json({
      message: 'Preferences updated successfully',
      preferences: result
    });

  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update user preferences' },
      { status: 500 }
    );
  }
} 