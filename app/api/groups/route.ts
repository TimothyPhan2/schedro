import { NextResponse } from 'next/server';
import { createServerSupabaseClient, getAuthenticatedUser } from '@/lib/supabase/server';

// GET /api/groups - Fetch all groups for the authenticated user
export async function GET(request: Request) {
  // Get authenticated user securely
  const { user, supabase } = await getAuthenticatedUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Since groups functionality is not implemented yet, return an empty array
    // This prevents 500 errors while groups are being developed
    return NextResponse.json([]);
    
    /* 
    // Original implementation - commented out until groups are implemented
    const { data: groups, error } = await supabase
      .from('groups')
      .select('*')
      .eq('user_id', user.id);
    
    if (error) {
      throw error;
    }
    
    // If no groups found, return an empty array rather than 404
    // This prevents the calendar from showing an error
    return NextResponse.json(groups || []);
    */
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}

// POST /api/groups - Create a new group
export async function POST(request: Request) {
  // Get authenticated user securely
  const { user, supabase } = await getAuthenticatedUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Since groups functionality is not implemented yet, return a mock response
    // This prevents 500 errors while groups are being developed
    return NextResponse.json({ id: 'mock-group-id', name: 'Placeholder Group' }, { status: 201 });
    
    /*
    // Original implementation - commented out until groups are implemented
    const groupData = await request.json();
    
    if (!groupData.name) {
      return NextResponse.json(
        { error: 'Group name is required' },
        { status: 400 }
      );
    }
    
    if (!groupData.color) {
      groupData.color = '#3366FF'; // Default color if not specified
    }
    
    const { data: group, error } = await supabase
      .from('groups')
      .insert({
        name: groupData.name,
        color: groupData.color,
        user_id: user.id,
        description: groupData.description || null
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json(group, { status: 201 });
    */
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    );
  }
} 