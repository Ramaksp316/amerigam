import crypto from 'crypto';

/**
 * Generates a secure, unguessable string of alphanumeric characters
 */
function generateSecureRandomString(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded confusing chars like 0, O, 1, I
  let result = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  return result;
}

/**
 * Generates a unique Amerigam User ID.
 * Format: AMG-U-XXXXXXXX (8 chars)
 */
export function generateAmerigamUserId(): string {
  return `AMG-U-${generateSecureRandomString(8)}`;
}

/**
 * Generates a unique Event Registration ID.
 * Format: AMG-R-YYYY-XXXXXX (YYYY = current year, 6 chars)
 */
export function generateRegistrationId(): string {
  const year = new Date().getFullYear();
  return `AMG-R-${year}-${generateSecureRandomString(6)}`;
}

/**
 * Generates a unique Certificate ID.
 * Format: AMG-C-YYYY-XXXXXX (YYYY = current year, 6 chars)
 */
export function generateCertificateId(): string {
  const year = new Date().getFullYear();
  return `AMG-C-${year}-${generateSecureRandomString(6)}`;
}
