import { NextResponse } from 'next/server';
import { createServerSupabaseClient, getAuthenticatedUser } from '@/lib/supabase/server';
import { getCalendarById, updateCalendar, deleteCalendar } from '@/lib/calendars';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Get authenticated user securely
  const { user } = await getAuthenticatedUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { id } = params;
  
  try {
    const calendar = await getCalendarById(user.id, id);
    return NextResponse.json(calendar);
  } catch (error) {
    console.error('Error fetching calendar:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Get authenticated user securely
  const { user } = await getAuthenticatedUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { id } = params;
  
  try {
    const updateData = await request.json();
    const updatedCalendar = await updateCalendar(user.id, id, updateData);
    return NextResponse.json(updatedCalendar);
  } catch (error) {
    console.error('Error updating calendar:', error);
    return NextResponse.json(
      { error: 'Failed to update calendar' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Get authenticated user securely
  const { user } = await getAuthenticatedUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { id } = params;
  
  try {
    await deleteCalendar(user.id, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting calendar:', error);
    return NextResponse.json(
      { error: 'Failed to delete calendar' },
      { status: 500 }
    );
  }
} 