/**
 * JWT utility functions
 * Note: This is a simple JWT decoder for client-side use.
 * In production, tokens should be validated server-side.
 */

export interface JWTPayload {
  sub: string;
  type?: string;
  exp?: number;
  iat?: number;
}

/**
 * Decode JWT token (without verification - client-side only)
 * For production, tokens should be verified server-side
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as JWTPayload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  // Check if token expires within the next 5 minutes (buffer)
  const expirationTime = payload.exp * 1000; // Convert to milliseconds
  const bufferTime = 5 * 60 * 1000; // 5 minutes
  return Date.now() >= expirationTime - bufferTime;
}

/**
 * Get user ID from token
 */
export function getUserIdFromToken(token: string): number | null {
  const payload = decodeJWT(token);
  if (!payload || !payload.sub) {
    return null;
  }
  return parseInt(payload.sub, 10);
}
