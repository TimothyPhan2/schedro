import { ShareTokenManager } from '@/lib/tokens/share-token'
import { SharedLinksDatabase } from '@/lib/database/shared-links'
import { 
  PermissionValidationResult, 
  SharedLinkPermission, 
  PermissionLevel,
  PermissionError,
  PermissionErrorCodes 
} from './types'

export class PermissionValidator {
  private database: SharedLinksDatabase

  constructor() {
    this.database = new SharedLinksDatabase()
  }

  /**
   * Validates a shared calendar token and returns permission details
   */
  async validateToken(
    token: string, 
    providedPassword?: string
  ): Promise<PermissionValidationResult> {
    try {
      // Step 1: Validate token format and extract calendar ID using static methods
      const tokenValidation = ShareTokenManager.validate(token)
      if (!tokenValidation.isValid) {
        return {
          isValid: false,
          error: 'Invalid token format'
        }
      }

      const calendarId = ShareTokenManager.extractCalendarId(token)
      if (!calendarId) {
        return {
          isValid: false,
          error: 'Unable to extract calendar ID from token'
        }
      }

      // Step 2: Find shared link by token and validate
      const { record, validation } = await this.database.findByToken(token, providedPassword)
      
      if (!record || !validation.isValid) {
        if (validation.requiresPassword) {
          return {
            isValid: false,
            requiresPassword: true,
            error: 'Password required for this shared link'
          }
        }
        
        return {
          isValid: false,
          error: 'Shared link not found or has been revoked'
        }
      }

      // Step 3: Check expiry (already handled in findByToken, but double-check)
      if (record.expiresAt && record.expiresAt < new Date()) {
        return {
          isValid: false,
          error: 'Shared link has expired'
        }
      }

      // Step 4: Build permission object
      const permission: SharedLinkPermission = {
        calendarId: record.calendarId,
        level: record.permissions as PermissionLevel,
        token,
        isPasswordProtected: !!record.passwordHash,
        expiresAt: record.expiresAt
      }

      return {
        isValid: true,
        permission
      }

    } catch (error) {
      console.error('Permission validation error:', error)
      return {
        isValid: false,
        error: 'An error occurred while validating permissions'
      }
    }
  }

  /**
   * Check if a user has edit access to a calendar (either through auth or shared link)
   */
  hasEditAccess(
    permission?: SharedLinkPermission, 
    isAuthenticated: boolean = false
  ): boolean {
    // Authenticated users always have edit access to their own calendars
    if (isAuthenticated) {
      return true
    }

    // Shared link users need edit permission
    return permission?.level === 'edit'
  }

  /**
   * Check if a user has view access to a calendar (either through auth or shared link)
   */
  hasViewAccess(
    permission?: SharedLinkPermission, 
    isAuthenticated: boolean = false
  ): boolean {
    // Authenticated users always have view access
    if (isAuthenticated) {
      return true
    }

    // Shared link users need either view or edit permission
    return permission?.level === 'view' || permission?.level === 'edit'
  }

  /**
   * Extracts calendar ID from token for routing purposes
   */
  extractCalendarIdFromToken(token: string): string | null {
    try {
      return ShareTokenManager.extractCalendarId(token)
    } catch {
      return null
    }
  }

  /**
   * Validates permissions for a specific action
   */
  validateAction(
    action: 'view' | 'edit',
    permission?: SharedLinkPermission,
    isAuthenticated: boolean = false
  ): boolean {
    if (action === 'view') {
      return this.hasViewAccess(permission, isAuthenticated)
    }
    
    if (action === 'edit') {
      return this.hasEditAccess(permission, isAuthenticated)
    }

    return false
  }

  /**
   * Throws PermissionError if action is not allowed
   */
  requirePermission(
    action: 'view' | 'edit',
    permission?: SharedLinkPermission,
    isAuthenticated: boolean = false
  ): void {
    if (!this.validateAction(action, permission, isAuthenticated)) {
      throw new PermissionError(
        `Insufficient permissions for ${action} access`,
        PermissionErrorCodes.INSUFFICIENT_PERMISSIONS,
        { action, hasPermission: permission, isAuthenticated }
      )
    }
  }
} 