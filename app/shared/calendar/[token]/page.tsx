import { notFound, redirect } from 'next/navigation'
import { PermissionValidator } from '@/lib/permissions/validator'
import { SharedCalendarView } from '@/app/components/shared/SharedCalendarView'
import { createServerSupabaseClient } from '@/lib/supabase/server'

interface SharedCalendarPageProps {
  params: Promise<{
    token: string
  }>
  searchParams: Promise<{
    password?: string
  }>
}

export default async function SharedCalendarPage({ 
  params, 
  searchParams 
}: SharedCalendarPageProps) {
  // Await params and searchParams for Next.js 15 compatibility
  const { token } = await params
  const { password } = await searchParams

  console.log('🔍 Shared calendar access attempt:', { 
    token: token.substring(0, 20) + '...', 
    hasPassword: !!password 
  })

  let validation
  
  try {
    // Create server-side Supabase client and pass to PermissionValidator
    const supabase = await createServerSupabaseClient()
    const validator = new PermissionValidator(supabase)
    validation = await validator.validateToken(token, password)

    console.log('🔍 Validation result:', { 
      isValid: validation.isValid, 
      requiresPassword: validation.requiresPassword,
      hasPermission: !!validation.permission,
      error: validation.error 
    })

  } catch (error) {
    console.error('💥 Error loading shared calendar:', error)
    // Redirect to invalid page with generic error
    redirect(`/shared/invalid?error=${encodeURIComponent('An error occurred while loading the calendar')}`)
  }

  // Handle redirects outside try-catch block per Next.js best practices
  if (!validation.isValid && validation.requiresPassword) {
    console.log('🔐 Redirecting to password page')
    redirect(`/shared/password?token=${encodeURIComponent(token)}`)
  }

  if (!validation.isValid || !validation.permission) {
    console.log('❌ Validation failed, redirecting to invalid page')
    // Redirect to invalid page with specific error message
    const errorMessage = validation.error || 'This shared calendar link is not valid'
    redirect(`/shared/invalid?error=${encodeURIComponent(errorMessage)}`)
  }

  console.log('✅ Access granted, showing calendar')
  return (
    <SharedCalendarView 
      permission={validation.permission}
      token={token}
    />
  )
} 