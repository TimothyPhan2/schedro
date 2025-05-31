/**
 * Token system type definitions for secure shareable calendar links
 */

export interface TokenComponents {
  /** Token type prefix (e.g., 'cal' for calendar tokens) */
  prefix: string;
  /** Base64URL-encoded calendar ID */
  encodedCalendarId: string;
  /** Cryptographically secure random component (hex) */
  randomComponent: string;
  /** HMAC checksum for integrity verification */
  checksum: string;
}

export interface TokenValidationResult {
  /** Whether the token is valid */
  isValid: boolean;
  /** Original calendar ID extracted from token */
  calendarId?: string;
  /** Random component for database lookup */
  randomComponent?: string;
  /** Error message if validation failed */
  error?: string;
  /** Additional validation details for debugging */
  details?: {
    hasValidFormat: boolean;
    hasValidChecksum: boolean;
    hasValidPrefix: boolean;
  };
  /** Whether the link requires a password for access */
  requiresPassword?: boolean;
}

export interface TokenGenerationOptions {
  /** Calendar ID to generate token for */
  calendarId: string;
  /** Optional custom prefix (defaults to 'cal') */
  prefix?: string;
}

export interface TokenConfig {
  /** Token prefix for calendar share tokens */
  readonly PREFIX: string;
  /** Length of HMAC checksum in characters */
  readonly HMAC_LENGTH: number;
  /** Number of random bytes to generate */
  readonly RANDOM_BYTES: number;
  /** Minimum required length for secret key */
  readonly MIN_SECRET_KEY_LENGTH: number;
}

export class TokenError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'TokenError';
  }
}

export const TOKEN_ERROR_CODES = {
  INVALID_CALENDAR_ID: 'INVALID_CALENDAR_ID',
  MISSING_SECRET_KEY: 'MISSING_SECRET_KEY',
  WEAK_SECRET_KEY: 'WEAK_SECRET_KEY',
  INVALID_TOKEN_FORMAT: 'INVALID_TOKEN_FORMAT',
  INVALID_PREFIX: 'INVALID_PREFIX',
  INVALID_CHECKSUM: 'INVALID_CHECKSUM',
  MALFORMED_CALENDAR_ID: 'MALFORMED_CALENDAR_ID',
} as const;

export type TokenErrorCode = typeof TOKEN_ERROR_CODES[keyof typeof TOKEN_ERROR_CODES];

// Shared Link Types

export type SharedLinkPermission = 'view' | 'edit';

export interface SharedLinkData {
  calendarId: string;
  userId: string | null;
  permissions: SharedLinkPermission;
  passwordHash: string | null;
  expiresAt: Date | null;
}

export interface SharedLinkCreateOptions {
  calendarId: string;
  userId: string | null;
  permissions?: SharedLinkPermission;
  password?: string;
  expiresAt?: Date;
} 