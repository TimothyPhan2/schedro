import crypto from 'crypto';
import { TokenError, TOKEN_ERROR_CODES } from '@/lib/tokens/types';

/**
 * Secure cryptographic utilities for token generation and validation
 */
export class SecureCrypto {
  private static readonly DEFAULT_RANDOM_BYTES = 32;
  private static readonly HMAC_ALGORITHM = 'sha256';
  private static readonly MIN_SECRET_KEY_LENGTH = 32;

  /**
   * Generate cryptographically secure random bytes
   * @param bytes Number of random bytes to generate (default: 32)
   * @returns Hex-encoded random string
   */
  static generateSecureRandom(bytes: number = this.DEFAULT_RANDOM_BYTES): string {
    if (bytes <= 0 || !Number.isInteger(bytes)) {
      throw new TokenError(
        'Random bytes count must be a positive integer',
        TOKEN_ERROR_CODES.INVALID_CALENDAR_ID,
        { providedBytes: bytes }
      );
    }

    try {
      return crypto.randomBytes(bytes).toString('hex');
    } catch (error) {
      throw new TokenError(
        'Failed to generate secure random bytes',
        TOKEN_ERROR_CODES.INVALID_CALENDAR_ID,
        { originalError: error }
      );
    }
  }

  /**
   * Generate HMAC signature for data integrity
   * @param data Data to sign
   * @param secretKey Secret key for HMAC
   * @param length Length of returned signature (default: full length)
   * @returns Hex-encoded HMAC signature
   */
  static generateHMAC(
    data: string, 
    secretKey: string, 
    length?: number
  ): string {
    if (!data || typeof data !== 'string') {
      throw new TokenError(
        'Data must be a non-empty string',
        TOKEN_ERROR_CODES.INVALID_CALENDAR_ID,
        { providedData: data }
      );
    }

    this.validateSecretKey(secretKey);

    try {
      const hmac = crypto
        .createHmac(this.HMAC_ALGORITHM, secretKey)
        .update(data, 'utf8')
        .digest('hex');

      return length ? hmac.substring(0, length) : hmac;
    } catch (error) {
      throw new TokenError(
        'Failed to generate HMAC signature',
        TOKEN_ERROR_CODES.INVALID_CHECKSUM,
        { originalError: error }
      );
    }
  }

  /**
   * Perform timing-safe string comparison to prevent timing attacks
   * @param provided User-provided string
   * @param expected Expected string
   * @returns True if strings match, false otherwise
   */
  static timingSafeEqual(provided: string, expected: string): boolean {
    if (typeof provided !== 'string' || typeof expected !== 'string') {
      return false;
    }

    // Ensure both strings are the same length to prevent timing attacks
    if (provided.length !== expected.length) {
      return false;
    }

    try {
      return crypto.timingSafeEqual(
        Buffer.from(provided, 'utf8'),
        Buffer.from(expected, 'utf8')
      );
    } catch (error) {
      // If comparison fails for any reason, assume not equal
      return false;
    }
  }

  /**
   * Safely encode string to Base64URL (URL-safe base64)
   * @param input String to encode
   * @returns Base64URL encoded string
   */
  static encodeBase64URL(input: string): string {
    if (typeof input !== 'string') {
      throw new TokenError(
        'Input must be a string',
        TOKEN_ERROR_CODES.INVALID_CALENDAR_ID,
        { providedInput: input }
      );
    }

    try {
      return Buffer.from(input, 'utf8').toString('base64url');
    } catch (error) {
      throw new TokenError(
        'Failed to encode string to Base64URL',
        TOKEN_ERROR_CODES.MALFORMED_CALENDAR_ID,
        { originalError: error, input }
      );
    }
  }

  /**
   * Safely decode Base64URL string
   * @param encoded Base64URL encoded string
   * @returns Decoded string
   */
  static decodeBase64URL(encoded: string): string {
    if (typeof encoded !== 'string') {
      throw new TokenError(
        'Encoded input must be a string',
        TOKEN_ERROR_CODES.INVALID_TOKEN_FORMAT,
        { providedInput: encoded }
      );
    }

    try {
      return Buffer.from(encoded, 'base64url').toString('utf8');
    } catch (error) {
      throw new TokenError(
        'Failed to decode Base64URL string',
        TOKEN_ERROR_CODES.MALFORMED_CALENDAR_ID,
        { originalError: error, encoded }
      );
    }
  }

  /**
   * Validate secret key meets security requirements
   * @param secretKey Secret key to validate
   * @throws TokenError if key is invalid
   */
  private static validateSecretKey(secretKey: string): void {
    if (!secretKey) {
      throw new TokenError(
        'Secret key is required',
        TOKEN_ERROR_CODES.MISSING_SECRET_KEY
      );
    }

    if (typeof secretKey !== 'string') {
      throw new TokenError(
        'Secret key must be a string',
        TOKEN_ERROR_CODES.WEAK_SECRET_KEY,
        { providedType: typeof secretKey }
      );
    }

    if (secretKey.length < this.MIN_SECRET_KEY_LENGTH) {
      throw new TokenError(
        `Secret key must be at least ${this.MIN_SECRET_KEY_LENGTH} characters long`,
        TOKEN_ERROR_CODES.WEAK_SECRET_KEY,
        { 
          providedLength: secretKey.length, 
          minimumLength: this.MIN_SECRET_KEY_LENGTH 
        }
      );
    }
  }

  /**
   * Validate if a string contains only hexadecimal characters
   * @param input String to validate
   * @param expectedLength Expected length (optional)
   * @returns True if valid hex string
   */
  static isValidHex(input: string, expectedLength?: number): boolean {
    if (typeof input !== 'string') {
      return false;
    }

    if (expectedLength && input.length !== expectedLength) {
      return false;
    }

    return /^[0-9a-f]+$/i.test(input);
  }

  /**
   * Get environment variable with validation
   * @param name Environment variable name
   * @returns Environment variable value
   * @throws TokenError if variable is missing
   */
  static getRequiredEnvVar(name: string): string {
    const value = process.env[name];
    
    if (!value) {
      throw new TokenError(
        `Required environment variable ${name} is not set`,
        TOKEN_ERROR_CODES.MISSING_SECRET_KEY,
        { variableName: name }
      );
    }

    return value;
  }
} 