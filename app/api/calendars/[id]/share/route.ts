import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/supabase/server'
import { getCalendarById } from '@/lib/calendars'
import { createSharedLinksDatabase } from '@/lib/database/shared-links'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔗 Starting shared link creation...')
    
    // Step 1: Check authentication and get server-side Supabase client
    const { user, supabase } = await getAuthenticatedUser()
    if (!user) {
      console.error('❌ Authentication failed: No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('✅ User authenticated:', user.id)

    const { id } = await params
    console.log('📋 Calendar ID:', id)
    
    // Step 2: Verify user owns the calendar
    try {
      const calendar = await getCalendarById(user.id, id)
      if (!calendar) {
        console.error('❌ Calendar not found or unauthorized for user:', user.id, 'calendar:', id)
        return NextResponse.json({ error: 'Calendar not found or unauthorized' }, { status: 404 })
      }
      console.log('✅ Calendar found:', calendar.name)
    } catch (error) {
      console.error('❌ Error fetching calendar:', error)
      return NextResponse.json({ error: 'Calendar not found or unauthorized' }, { status: 404 })
    }

    // Step 3: Parse request body
    const body = await request.json()
    const { password, permissions = 'view', expiresIn } = body
    console.log('📝 Request params:', { 
      hasPassword: !!password, 
      permissions, 
      expiresIn 
    })

    // Step 4: Calculate expiry date
    let expiresAt: Date | undefined = undefined
    if (expiresIn) {
      expiresAt = new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000) // expiresIn is in days
      console.log('⏰ Expiry date set to:', expiresAt.toISOString())
    }

    // Step 5: Create shared link using server-side Supabase client
    console.log('🔧 Creating shared links database instance with authenticated client...')
    const sharedLinksDb = createSharedLinksDatabase(supabase)
    
    console.log('🎲 Generating shared link...')
    const result = await sharedLinksDb.createSharedLink({
      calendarId: id,
      userId: user.id,
      permissions: permissions as 'view' | 'edit',
      password,
      expiresAt
    })
    console.log('✅ Shared link created successfully!')

    const baseUrl = process.env.NEXTAUTH_URL || `http://localhost:3000`
    const shareUrl = `${baseUrl}/shared/calendar/${result.token}`
    console.log('🔗 Share URL generated:', shareUrl)

    return NextResponse.json({
      success: true,
      token: result.token,
      shareUrl,
      permissions,
      passwordProtected: !!password,
      expiresAt
    })

  } catch (error) {
    console.error('💥 Error creating shared link:', error)
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json(
      { 
        error: 'Failed to create shared link',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
} 