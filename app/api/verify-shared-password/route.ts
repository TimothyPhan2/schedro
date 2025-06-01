import { NextRequest, NextResponse } from 'next/server'
import { PermissionValidator } from '@/lib/permissions/validator'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    console.log('🔐 Password verification request:', { 
      token: token?.substring(0, 20) + '...', 
      hasPassword: !!password 
    })

    if (!token) {
      console.log('❌ No token provided')
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    if (!password) {
      console.log('❌ No password provided')
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    // Create server-side Supabase client and pass to PermissionValidator
    console.log('🔧 Creating Supabase client for validation...')
    const supabase = await createServerSupabaseClient()
    const validator = new PermissionValidator(supabase)
    
    console.log('🔍 Starting token validation with password...')
    const validation = await validator.validateToken(token, password)

    console.log('🔍 Password verification result:', { 
      isValid: validation.isValid,
      requiresPassword: validation.requiresPassword,
      error: validation.error 
    })

    return NextResponse.json({
      valid: validation.isValid,
      requiresPassword: validation.requiresPassword,
      error: validation.error
    })

  } catch (error) {
    console.error('💥 Password verification error:', error)
    return NextResponse.json(
      { error: 'An error occurred while verifying the password' },
      { status: 500 }
    )
  }
} 