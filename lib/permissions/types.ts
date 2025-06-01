export type PermissionLevel = 'view' | 'edit'

export interface SharedLinkPermission {
  calendarId: string
  level: PermissionLevel
  token: string
  isPasswordProtected: boolean
  expiresAt: Date | null
}

export interface PermissionValidationResult {
  isValid: boolean
  permission?: SharedLinkPermission
  error?: string
  requiresPassword?: boolean
}

export interface PermissionContext {
  isAuthenticated: boolean
  userId?: string
  sharedLink?: SharedLinkPermission
  hasEditAccess: boolean
  hasViewAccess: boolean
}

export class PermissionError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'PermissionError'
  }
}

export const PermissionErrorCodes = {
  INVALID_TOKEN: 'INVALID_TOKEN',
  EXPIRED_LINK: 'EXPIRED_LINK',
  PASSWORD_REQUIRED: 'PASSWORD_REQUIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  CALENDAR_NOT_FOUND: 'CALENDAR_NOT_FOUND',
  DATABASE_ERROR: 'DATABASE_ERROR'
} as const 