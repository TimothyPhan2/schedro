import { headers } from 'next/headers'
import { NextRequest } from 'next/server'
import { PermissionContext, SharedLinkPermission, PermissionLevel } from './types'

/**
 * Extract permission context from middleware headers in App Router
 */
export async function getPermissionContext(): Promise<PermissionContext> {
  const headersList = await headers()
  
  // Check if this is a shared link request
  const calendarId = headersList.get('x-shared-calendar-id')
  const permissionLevel = headersList.get('x-shared-permission-level') as PermissionLevel | null
  const token = headersList.get('x-shared-token')
  const hasEditAccess = headersList.get('x-has-edit-access') === 'true'
  const hasViewAccess = headersList.get('x-has-view-access') === 'true'

  if (calendarId && permissionLevel && token) {
    // This is a shared link request
    const sharedLink: SharedLinkPermission = {
      calendarId,
      level: permissionLevel,
      token,
      isPasswordProtected: false, // We don't need to expose this in context
      expiresAt: null // We don't need to expose this in context
    }

    return {
      isAuthenticated: false,
      sharedLink,
      hasEditAccess,
      hasViewAccess
    }
  }

  // This is an authenticated request or public access
  return {
    isAuthenticated: true, // Assume authenticated if not shared link
    hasEditAccess: true,   // Authenticated users have full access
    hasViewAccess: true
  }
}

/**
 * Extract permission context from request headers in API routes
 */
export function getPermissionContextFromRequest(request: NextRequest): PermissionContext {
  // Check if this is a shared link request
  const calendarId = request.headers.get('x-shared-calendar-id')
  const permissionLevel = request.headers.get('x-shared-permission-level') as PermissionLevel | null
  const token = request.headers.get('x-shared-token')
  const hasEditAccess = request.headers.get('x-has-edit-access') === 'true'
  const hasViewAccess = request.headers.get('x-has-view-access') === 'true'

  if (calendarId && permissionLevel && token) {
    // This is a shared link request
    const sharedLink: SharedLinkPermission = {
      calendarId,
      level: permissionLevel,
      token,
      isPasswordProtected: false,
      expiresAt: null
    }

    return {
      isAuthenticated: false,
      sharedLink,
      hasEditAccess,
      hasViewAccess
    }
  }

  // This is an authenticated request or public access
  return {
    isAuthenticated: true,
    hasEditAccess: true,
    hasViewAccess: true
  }
}

/**
 * Validate if the current context allows a specific action
 */
export function validateContextAction(
  context: PermissionContext,
  action: 'view' | 'edit'
): boolean {
  if (action === 'view') {
    return context.hasViewAccess
  }
  
  if (action === 'edit') {
    return context.hasEditAccess
  }

  return false
}

/**
 * Require permission for an action, throws error if not allowed
 */
export function requireContextPermission(
  context: PermissionContext,
  action: 'view' | 'edit'
): void {
  if (!validateContextAction(context, action)) {
    throw new Error(`Insufficient permissions for ${action} access`)
  }
} 