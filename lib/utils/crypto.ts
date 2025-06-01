import { TokenError, TOKEN_ERROR_CODES } from '@/lib/tokens/types';

/**
 * Secure cryptographic utilities for token generation and validation
 * Uses only Web Crypto API and modern browser APIs for universal compatibility
 */
export class SecureCrypto {
  private static readonly DEFAULT_RANDOM_BYTES = 32;
  private static readonly HMAC_ALGORITHM = 'SHA-256';
  private static readonly MIN_SECRET_KEY_LENGTH = 32;

  /**
   * Generate cryptographically secure random bytes
   * @param bytes Number of random bytes to generate (default: 32)
   * @returns Hex-encoded random string
   */
  static async generateSecureRandom(bytes: number = this.DEFAULT_RANDOM_BYTES): Promise<string> {
    if (bytes <= 0 || !Number.isInteger(bytes)) {
      throw new TokenError(
        'Random bytes count must be a positive integer',
        TOKEN_ERROR_CODES.INVALID_CALENDAR_ID,
        { providedBytes: bytes }
      );
    }

    try {
      const randomBytes = new Uint8Array(bytes);
      
      if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
        globalThis.crypto.getRandomValues(randomBytes);
      } else {
        throw new Error('Web Crypto API not available');
      }
      
      return Array.from(randomBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
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
  static async generateHMAC(
    data: string, 
    secretKey: string, 
    length?: number
  ): Promise<string> {
    if (!data || typeof data !== 'string') {
      throw new TokenError(
        'Data must be a non-empty string',
        TOKEN_ERROR_CODES.INVALID_CALENDAR_ID,
        { providedData: data }
      );
    }

    this.validateSecretKey(secretKey);

    try {
      const keyData = new TextEncoder().encode(secretKey);
      const messageData = new TextEncoder().encode(data);

      if (!globalThis.crypto?.subtle) {
        throw new Error('Web Crypto API subtle not available');
      }

      const cryptoKey = await globalThis.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: this.HMAC_ALGORITHM },
        false,
        ['sign']
      );
      
      const hmacResult = await globalThis.crypto.subtle.sign('HMAC', cryptoKey, messageData);
      const hmacBytes = new Uint8Array(hmacResult);

      const hexString = Array.from(hmacBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      return length ? hexString.substring(0, length) : hexString;
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
  static async timingSafeEqual(provided: string, expected: string): Promise<boolean> {
    if (typeof provided !== 'string' || typeof expected !== 'string') {
      return false;
    }

    // Ensure both strings are the same length to prevent timing attacks
    if (provided.length !== expected.length) {
      return false;
    }

    try {
      const providedBytes = new TextEncoder().encode(provided);
      const expectedBytes = new TextEncoder().encode(expected);

      // Manual constant-time comparison
      let result = 0;
      for (let i = 0; i < providedBytes.length; i++) {
        result |= providedBytes[i] ^ expectedBytes[i];
      }
      return result === 0;
    } catch {
      // If comparison fails for any reason, assume not equal
      return false;
    }
  }

  /**
   * Safely encode string to Base64URL (URL-safe base64) using Web Crypto API
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
      // Use TextEncoder for proper Unicode handling
      const bytes = new TextEncoder().encode(input);
      
      // Convert to base64 using native method compatible with all environments
      const base64 = this.bytesToBase64(bytes);
      
      // Make it URL-safe
      return base64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    } catch (error) {
      throw new TokenError(
        'Failed to encode string to Base64URL',
        TOKEN_ERROR_CODES.MALFORMED_CALENDAR_ID,
        { originalError: error, input }
      );
    }
  }

  /**
   * Safely decode Base64URL string using Web Crypto API
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
      // Convert Base64URL back to regular base64
      let base64 = encoded
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      
      // Add padding if needed
      const padLength = (4 - (base64.length % 4)) % 4;
      base64 += '='.repeat(padLength);
      
      // Decode using native method
      const bytes = this.base64ToBytes(base64);
      
      // Convert back to string
      return new TextDecoder().decode(bytes);
    } catch (error) {
      throw new TokenError(
        'Failed to decode Base64URL string',
        TOKEN_ERROR_CODES.INVALID_TOKEN_FORMAT,
        { originalError: error, encoded }
      );
    }
  }

  /**
   * Convert Uint8Array to base64 string using only Web APIs
   * @param bytes Byte array to convert
   * @returns Base64 encoded string
   */
  private static bytesToBase64(bytes: Uint8Array): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    
    for (let i = 0; i < bytes.length; i += 3) {
      const byte1 = bytes[i];
      const byte2 = bytes[i + 1] || 0;
      const byte3 = bytes[i + 2] || 0;
      
      const bitmap = (byte1 << 16) | (byte2 << 8) | byte3;
      
      result += chars.charAt((bitmap >> 18) & 63);
      result += chars.charAt((bitmap >> 12) & 63);
      result += i + 1 < bytes.length ? chars.charAt((bitmap >> 6) & 63) : '=';
      result += i + 2 < bytes.length ? chars.charAt(bitmap & 63) : '=';
    }
    
    return result;
  }

  /**
   * Convert base64 string to Uint8Array using only Web APIs
   * @param base64 Base64 encoded string
   * @returns Decoded byte array
   */
  private static base64ToBytes(base64: string): Uint8Array {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const charToIndex = new Map();
    
    for (let i = 0; i < chars.length; i++) {
      charToIndex.set(chars[i], i);
    }
    
    // Remove padding
    base64 = base64.replace(/=/g, '');
    
    const resultLength = Math.floor((base64.length * 3) / 4);
    const result = new Uint8Array(resultLength);
    
    let resultIndex = 0;
    
    for (let i = 0; i < base64.length; i += 4) {
      const char1 = charToIndex.get(base64[i]) || 0;
      const char2 = charToIndex.get(base64[i + 1]) || 0;
      const char3 = charToIndex.get(base64[i + 2]) || 0;
      const char4 = charToIndex.get(base64[i + 3]) || 0;
      
      const bitmap = (char1 << 18) | (char2 << 12) | (char3 << 6) | char4;
      
      if (resultIndex < result.length) result[resultIndex++] = (bitmap >> 16) & 0xFF;
      if (resultIndex < result.length) result[resultIndex++] = (bitmap >> 8) & 0xFF;
      if (resultIndex < result.length) result[resultIndex++] = bitmap & 0xFF;
    }
    
    return result;
  }

  /**
   * Create a hash of the provided data using Web Crypto API
   * @param data String data to hash
   * @param algorithm Hash algorithm to use (default: SHA-256)
   * @returns Hex-encoded hash
   */
  static async createHash(data: string, algorithm: string = 'SHA-256'): Promise<string> {
    if (!data || typeof data !== 'string') {
      throw new TokenError(
        'Data must be a non-empty string',
        TOKEN_ERROR_CODES.INVALID_CALENDAR_ID,
        { providedData: data }
      );
    }

    try {
      if (!globalThis.crypto?.subtle) {
        throw new Error('Web Crypto API subtle not available');
      }

      const dataBytes = new TextEncoder().encode(data);
      const hashBuffer = await globalThis.crypto.subtle.digest(algorithm, dataBytes);
      const hashBytes = new Uint8Array(hashBuffer);

      return Array.from(hashBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (error) {
      throw new TokenError(
        `Failed to create ${algorithm} hash`,
        TOKEN_ERROR_CODES.INVALID_CHECKSUM,
        { originalError: error, algorithm }
      );
    }
  }

  /**
   * Validate that a secret key meets minimum requirements
   * @param secretKey Secret key to validate
   * @throws TokenError if key is invalid
   */
  private static validateSecretKey(secretKey: string): void {
    if (!secretKey || typeof secretKey !== 'string') {
      throw new TokenError(
        'Secret key must be a non-empty string',
        TOKEN_ERROR_CODES.INVALID_CALENDAR_ID,
        { providedKey: secretKey }
      );
    }

    if (secretKey.length < this.MIN_SECRET_KEY_LENGTH) {
      throw new TokenError(
        `Secret key must be at least ${this.MIN_SECRET_KEY_LENGTH} characters long`,
        TOKEN_ERROR_CODES.INVALID_CALENDAR_ID,
        { 
          providedLength: secretKey.length,
          requiredLength: this.MIN_SECRET_KEY_LENGTH
        }
      );
    }
  }

  /**
   * Check if a string is a valid hex string
   * @param input String to validate
   * @param expectedLength Expected length (optional)
   * @returns True if valid hex, false otherwise
   */
  static isValidHex(input: string, expectedLength?: number): boolean {
    if (typeof input !== 'string') return false;
    
    const hexRegex = /^[0-9a-fA-F]+$/;
    const isValid = hexRegex.test(input);
    
    if (expectedLength && input.length !== expectedLength) {
      return false;
    }
    
    return isValid;
  }
} 