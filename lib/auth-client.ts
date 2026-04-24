// Client-side auth utilities (safe for browser use)

const SESSION_COOKIE_NAME = 'auth-token';

/**
 * Get the auth token from document.cookie (client-side only)
 */
export function getClientToken(doc: Document): string | null {
  const value = `; ${doc.cookie}`;
  const parts = value.split(`; ${SESSION_COOKIE_NAME}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}
