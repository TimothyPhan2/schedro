import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { getCalendarById, updateCalendar, deleteCalendar } from '@/lib/calendars';
import { validateRequestBody } from '@/lib/validation/api-helpers';
import { updateCalendarSchema, idParamsSchema } from '@/lib/validation/schemas';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Get authenticated user securely
  const { user } = await getAuthenticatedUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { id } = await params;
  
  // Validate path parameters
  try {
    idParamsSchema.parse({ id });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid calendar ID format' },
      { status: 400 }
    );
  }
  
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
  { params }: { params: Promise<{ id: string }> }
) {
  // Get authenticated user securely
  const { user } = await getAuthenticatedUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { id } = await params;
  
  // Validate path parameters
  try {
    idParamsSchema.parse({ id });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid calendar ID format' },
      { status: 400 }
    );
  }

  // Validate request body with Zod schema
  const bodyValidation = await validateRequestBody(request, updateCalendarSchema);
  if (!bodyValidation.success) {
    return bodyValidation.response;
  }

  const updateData = bodyValidation.data;

  try {
    const updatedCalendar = await updateCalendar(user.id, id, {
      ...updateData,
      description: updateData.description || undefined
    });
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
  { params }: { params: Promise<{ id: string }> }
) {
  // Get authenticated user securely
  const { user } = await getAuthenticatedUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { id } = await params;
  
  // Validate path parameters
  try {
    idParamsSchema.parse({ id });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid calendar ID format' },
      { status: 400 }
    );
  }
  
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