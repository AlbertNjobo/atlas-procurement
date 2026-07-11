import { auth } from './firebase';

/**
 * Authenticated fetch helper for /api/* routes.
 * Sends Firebase ID token when the user is signed in.
 * Optionally sends x-api-key when VITE_API_SECRET is set (matches server API_SECRET).
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const user = auth.currentUser;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (user) {
    const token = await user.getIdToken();
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Optional shared secret for public deploys (pair with server API_SECRET)
  const apiSecret =
    (typeof import.meta !== 'undefined' &&
      (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_API_SECRET) ||
    undefined;
  if (apiSecret) {
    headers['x-api-key'] = apiSecret;
  }

  return fetch(url, { ...options, headers });
}
