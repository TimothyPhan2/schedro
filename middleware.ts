import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - shared/* (shared calendar links)
     * - api/shared/* (shared calendar links)
     * - api/verify-shared-password/* (shared calendar links)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|shared|api/shared|api/verify-shared-password|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}