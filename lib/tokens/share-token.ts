import { SecureCrypto } from '@/lib/utils/crypto';
import {
  TokenComponents,
  TokenValidationResult,
  TokenGenerationOptions,
  TokenConfig,
  TokenError,
  TOKEN_ERROR_CODES,
  type TokenErrorCode
} from './types';

/**
 * Secure token manager for shareable calendar links
 * 
 * Features:
 * - Cryptographically secure token generation
 * - HMAC-based integrity verification
 * - URL-safe encoding
 * - Timing attack resistance
 * - Comprehensive validation
 */
export class ShareTokenManager {
  private static readonly CONFIG: TokenConfig = {
    PREFIX: 'cal',
    HMAC_LENGTH: 8,
    RANDOM_BYTES: 32,
    MIN_SECRET_KEY_LENGTH: 32,
  } as const;

  private static readonly TOKEN_SEPARATOR = '_';
  private static readonly SECRET_KEY_ENV = 'TOKEN_SECRET_KEY';

  /**
   * Generate a secure shareable token for a calendar
   * 
   * @param options Token generation options
   * @returns Secure token string
   * @throws TokenError if generation fails
   * 
   * @example
   * ```typescript
   * const token = ShareTokenManager.generate({ calendarId: 'abc-123' });
   * // Returns: "cal_YWJjLTEyMw_a1b2c3...64chars..._f7a8b9c0"
   * ```
   */
  static generate(options: TokenGenerationOptions): string {
    this.validateCalendarId(options.calendarId);

    const prefix = options.prefix || this.CONFIG.PREFIX;
    
    try {
      // Step 1: Encode calendar ID safely for URLs
      const encodedCalendarId = SecureCrypto.encodeBase64URL(options.calendarId);
      
      // Step 2: Generate cryptographically secure random component
      const randomComponent = SecureCrypto.generateSecureRandom(this.CONFIG.RANDOM_BYTES);
      
      // Step 3: Create payload for HMAC signing
      const payload = this.createPayload(prefix, encodedCalendarId, randomComponent);
      
      // Step 4: Generate HMAC checksum for integrity
      const secretKey = this.getSecretKey();
      const checksum = SecureCrypto.generateHMAC(payload, secretKey, this.CONFIG.HMAC_LENGTH);
      
      // Step 5: Assemble final token
      return `${payload}${this.TOKEN_SEPARATOR}${checksum}`;
      
    } catch (error) {
      if (error instanceof TokenError) {
        throw error;
      }
      
      throw new TokenError(
        'Failed to generate share token',
        TOKEN_ERROR_CODES.INVALID_CALENDAR_ID,
        { 
          originalError: error,
          calendarId: options.calendarId 
        }
      );
    }
  }

  /**
   * Validate and parse a share token
   * 
   * @param token Token to validate
   * @returns Validation result with extracted data
   * 
   * @example
   * ```typescript
   * const result = ShareTokenManager.validate('cal_YWJjLTEyMw_..._f7a8b9c0');
   * if (result.isValid) {
   *   console.log('Calendar ID:', result.calendarId);
   *   console.log('Random component:', result.randomComponent);
   * }
   * ```
   */
  static validate(token: string): TokenValidationResult {
    try {
      // Step 1: Basic format validation
      const components = this.parseTokenComponents(token);
      
      // Step 2: Validate prefix
      if (components.prefix !== this.CONFIG.PREFIX) {
        return this.createValidationError(
          'Invalid token prefix',
          TOKEN_ERROR_CODES.INVALID_PREFIX,
          { hasValidFormat: true, hasValidChecksum: false, hasValidPrefix: false }
        );
      }
      
      // Step 3: Extract and validate calendar ID
      let calendarId: string;
      try {
        calendarId = SecureCrypto.decodeBase64URL(components.encodedCalendarId);
      } catch {
        return this.createValidationError(
          'Invalid calendar ID encoding',
          TOKEN_ERROR_CODES.MALFORMED_CALENDAR_ID,
          { hasValidFormat: true, hasValidChecksum: false, hasValidPrefix: true }
        );
      }
      
      // Step 4: Validate random component format
      const expectedRandomLength = this.CONFIG.RANDOM_BYTES * 2; // hex encoding doubles length
      if (!SecureCrypto.isValidHex(components.randomComponent, expectedRandomLength)) {
        return this.createValidationError(
          'Invalid random component format',
          TOKEN_ERROR_CODES.INVALID_TOKEN_FORMAT,
          { hasValidFormat: false, hasValidChecksum: false, hasValidPrefix: true }
        );
      }
      
      // Step 5: Verify HMAC checksum
      const payload = this.createPayload(
        components.prefix,
        components.encodedCalendarId,
        components.randomComponent
      );
      
      const secretKey = this.getSecretKey();
      const expectedChecksum = SecureCrypto.generateHMAC(payload, secretKey, this.CONFIG.HMAC_LENGTH);
      
      const isValidChecksum = SecureCrypto.timingSafeEqual(
        components.checksum,
        expectedChecksum
      );
      
      if (!isValidChecksum) {
        return this.createValidationError(
          'Invalid token checksum',
          TOKEN_ERROR_CODES.INVALID_CHECKSUM,
          { hasValidFormat: true, hasValidChecksum: false, hasValidPrefix: true }
        );
      }
      
      // Success: Token is valid
      return {
        isValid: true,
        calendarId,
        randomComponent: components.randomComponent,
        details: {
          hasValidFormat: true,
          hasValidChecksum: true,
          hasValidPrefix: true,
        }
      };
      
    } catch (error) {
      return this.createValidationError(
        error instanceof TokenError ? error.message : 'Token validation failed',
        TOKEN_ERROR_CODES.INVALID_TOKEN_FORMAT,
        { hasValidFormat: false, hasValidChecksum: false, hasValidPrefix: false }
      );
    }
  }

  /**
   * Extract calendar ID from token without full validation
   * Useful for efficient database lookups
   * 
   * @param token Token to extract from
   * @returns Calendar ID or null if extraction fails
   */
  static extractCalendarId(token: string): string | null {
    try {
      const parts = token.split(this.TOKEN_SEPARATOR);
      if (parts.length < 4) return null;
      
      const [prefix, encodedCalendarId] = parts;
      if (prefix !== this.CONFIG.PREFIX) return null;
      
      return SecureCrypto.decodeBase64URL(encodedCalendarId);
    } catch {
      return null;
    }
  }

  /**
   * Extract random component from token for database lookups
   * 
   * @param token Token to extract from
   * @returns Random component or null if extraction fails
   */
  static extractRandomComponent(token: string): string | null {
    try {
      const parts = token.split(this.TOKEN_SEPARATOR);
      if (parts.length < 4) return null;
      
      const randomComponent = parts[2];
      const expectedLength = this.CONFIG.RANDOM_BYTES * 2;
      
      if (SecureCrypto.isValidHex(randomComponent, expectedLength)) {
        return randomComponent;
      }
      
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Check if a token has the correct format (without cryptographic validation)
   * Useful for early validation before expensive operations
   * 
   * @param token Token to check
   * @returns True if format is correct
   */
  static hasValidFormat(token: string): boolean {
    if (typeof token !== 'string') return false;
    
    const parts = token.split(this.TOKEN_SEPARATOR);
    if (parts.length !== 4) return false;
    
    const [prefix, encodedCalendarId, randomComponent, checksum] = parts;
    
    // Check prefix
    if (prefix !== this.CONFIG.PREFIX) return false;
    
    // Check encoded calendar ID (basic base64url format)
    if (!/^[A-Za-z0-9_-]+$/.test(encodedCalendarId)) return false;
    
    // Check random component (hex)
    const expectedRandomLength = this.CONFIG.RANDOM_BYTES * 2;
    if (!SecureCrypto.isValidHex(randomComponent, expectedRandomLength)) return false;
    
    // Check checksum (hex)
    if (!SecureCrypto.isValidHex(checksum, this.CONFIG.HMAC_LENGTH)) return false;
    
    return true;
  }

  // Private helper methods

  private static validateCalendarId(calendarId: string): void {
    if (!calendarId || typeof calendarId !== 'string') {
      throw new TokenError(
        'Calendar ID must be a non-empty string',
        TOKEN_ERROR_CODES.INVALID_CALENDAR_ID,
        { providedCalendarId: calendarId }
      );
    }

    if (calendarId.trim() !== calendarId) {
      throw new TokenError(
        'Calendar ID cannot have leading or trailing whitespace',
        TOKEN_ERROR_CODES.INVALID_CALENDAR_ID,
        { providedCalendarId: calendarId }
      );
    }
  }

  private static getSecretKey(): string {
    return SecureCrypto.getRequiredEnvVar(this.SECRET_KEY_ENV);
  }

  private static createPayload(
    prefix: string,
    encodedCalendarId: string,
    randomComponent: string
  ): string {
    return `${prefix}${this.TOKEN_SEPARATOR}${encodedCalendarId}${this.TOKEN_SEPARATOR}${randomComponent}`;
  }

  private static parseTokenComponents(token: string): TokenComponents {
    if (typeof token !== 'string') {
      throw new TokenError(
        'Token must be a string',
        TOKEN_ERROR_CODES.INVALID_TOKEN_FORMAT,
        { providedToken: typeof token }
      );
    }

    const parts = token.split(this.TOKEN_SEPARATOR);
    
    if (parts.length !== 4) {
      throw new TokenError(
        `Token must have exactly 4 parts separated by '${this.TOKEN_SEPARATOR}'`,
        TOKEN_ERROR_CODES.INVALID_TOKEN_FORMAT,
        { providedParts: parts.length, expectedParts: 4 }
      );
    }

    const [prefix, encodedCalendarId, randomComponent, checksum] = parts;

    return {
      prefix,
      encodedCalendarId,
      randomComponent,
      checksum,
    };
  }

  private static createValidationError(
    message: string,
    code: TokenErrorCode,
    details: { hasValidFormat: boolean; hasValidChecksum: boolean; hasValidPrefix: boolean }
  ): TokenValidationResult {
    return {
      isValid: false,
      error: message,
      details,
    };
  }
} 