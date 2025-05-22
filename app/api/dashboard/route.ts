import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { getDashboardData } from '@/lib/utils/data-fetch';

export async function GET(request: Request) {
  
  
  // Get authenticated user securely
  const { user } = await getAuthenticatedUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Get userId from query params or use authenticated user id
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId') || user.id;
  
  // Verify user is requesting their own data
  if (userId !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  try {
    const dashboardData = await getDashboardData(userId);
    
    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
} 