# Share Token System Setup

## Environment Configuration

The share token system requires a secret key for HMAC-based token signing. Add the following to your `.env` file:

```bash
# Share Token Security Key
# CRITICAL: Keep this secret and never commit to version control
# Generate using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
TOKEN_SECRET_KEY=your-256-bit-secret-key-here-minimum-32-characters-required
```

## Generating a Secure Secret Key

Run this command in your terminal to generate a cryptographically secure key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as your `TOKEN_SECRET_KEY` value.

## Security Requirements

- **Minimum Length**: 32 characters (256 bits)
- **Randomness**: Must be cryptographically secure
- **Secrecy**: Never commit to version control or share publicly
- **Rotation**: Consider rotating periodically for enhanced security

## Usage Example

```typescript
import { ShareTokenManager } from '@/lib/tokens/share-token';

// Generate a token
const token = ShareTokenManager.generate({ calendarId: 'your-calendar-id' });
console.log('Share URL:', `${process.env.NEXT_PUBLIC_APP_URL}/share/${token}`);

// Validate a token
const result = ShareTokenManager.validate(token);
if (result.isValid) {
  console.log('Calendar ID:', result.calendarId);
  console.log('Random component for DB:', result.randomComponent);
} else {
  console.error('Invalid token:', result.error);
}
```

## Token Format

Generated tokens follow this structure:
```
cal_YWJjLTEyMw_a1b2c3d4e5f6789012345678901234567890abcdef123456789012345678901234_f7a8b9c0
├── prefix (cal)
├── encoded calendar ID (Base64URL)
├── random component (32 bytes hex)
└── HMAC checksum (8 characters)
```

## Next Steps

1. Add `TOKEN_SECRET_KEY` to your `.env` file
2. Restart your development server
3. The token system is ready for use in API routes and components 