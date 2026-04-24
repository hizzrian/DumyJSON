import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'auth-token';
const SESSION_MAX_AGE = 60 * 60; // 1 hour in seconds

/**
 * Set the auth token cookie (server-side only)
 */
export async function setAuthToken(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

/**
 * Get the auth token from cookie (server-side only)
 */
export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

/**
 * Remove the auth token cookie (server-side only)
 */
export async function removeAuthToken() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
