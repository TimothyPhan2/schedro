import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { PermissionValidator } from '@/lib/permissions/validator'

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {
          // No-op in middleware context
        },
      },
    }
  )

  // Handle shared calendar routes
  const isSharedRoute = request.nextUrl.pathname.startsWith('/shared/') || 
                       request.nextUrl.pathname.startsWith('/api/shared/')

  if (isSharedRoute) {
    return await handleSharedRoute(request, supabaseResponse)
  }

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  // IMPORTANT: Handle refresh token errors gracefully
  let user = null;
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser;
  } catch (error: unknown) {
    // Handle specific auth errors gracefully
    const err = error as { code?: string; message?: string };
    if (err?.code === 'refresh_token_not_found' || 
        err?.message?.includes('refresh_token_not_found') ||
        err?.message?.includes('Invalid Refresh Token')) {
      console.log('Refresh token not found or invalid, clearing session and redirecting to login');
      // Clear any stale cookies and redirect to login
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      const response = NextResponse.redirect(url)
      
      // Clear auth cookies to prevent further issues
      response.cookies.delete('sb-access-token')
      response.cookies.delete('sb-refresh-token')
      
      return response
    }
    
    // For other auth errors, log them but don't crash
    console.error('Auth error in middleware:', error);
    user = null;
  }

  if (
    !user &&
    request.nextUrl.pathname !== '/' &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/register') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}

/**
 * Handle shared calendar routes with permission validation
 */
async function handleSharedRoute(
  request: NextRequest, 
  supabaseResponse: NextResponse
): Promise<NextResponse> {
  try {
    // Extract token from URL path or query parameter
    const token = extractTokenFromRequest(request)
    
    if (!token) {
      return NextResponse.redirect(new URL('/shared/invalid', request.url))
    }

    // Create Supabase client for validation
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            // No-op in middleware context
          },
        },
      }
    )

    // Validate the token
    const validator = new PermissionValidator(supabase)
    const password = request.nextUrl.searchParams.get('password') || undefined
    const validation = await validator.validateToken(token, password)

    if (!validation.isValid) {
      // Handle different validation errors
      if (validation.requiresPassword) {
        return NextResponse.redirect(
          new URL(`/shared/password?token=${token}`, request.url)
        )
      }

      return NextResponse.redirect(
        new URL(`/shared/invalid?error=${encodeURIComponent(validation.error || 'Unknown error')}`, request.url)
      )
    }

    // Add permission context to headers for downstream use
    const response = NextResponse.next({ request })
    
    // Copy cookies from supabase response
    const supabaseCookies = supabaseResponse.cookies.getAll()
    supabaseCookies.forEach(cookie => {
      response.cookies.set(cookie.name, cookie.value, cookie)
    })

    // Set permission context headers
    response.headers.set('x-shared-calendar-id', validation.permission!.calendarId)
    response.headers.set('x-shared-calendar-owner-id', validation.permission!.calendarOwnerId)
    response.headers.set('x-shared-permission-level', validation.permission!.level)
    response.headers.set('x-shared-token', token)
    response.headers.set('x-has-edit-access', validator.hasEditAccess(validation.permission).toString())
    response.headers.set('x-has-view-access', validator.hasViewAccess(validation.permission).toString())

    return response

  } catch (error) {
    console.error('Error handling shared route:', error)
    return NextResponse.redirect(new URL('/shared/error', request.url))
  }
}

/**
 * Extract token from request URL path or query parameters
 */
function extractTokenFromRequest(request: NextRequest): string | null {
  // Try extracting from path: /shared/calendar/[token]
  const pathSegments = request.nextUrl.pathname.split('/')
  if (pathSegments.length >= 4 && pathSegments[1] === 'shared' && pathSegments[2] === 'calendar') {
    return pathSegments[3]
  }

  // Try extracting from API path: /api/shared/[token]/...
  if (pathSegments.length >= 4 && pathSegments[1] === 'api' && pathSegments[2] === 'shared') {
    return pathSegments[3]
  }

  // Try extracting from query parameter
  return request.nextUrl.searchParams.get('token')
}