import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';

// ---------------------------------------------------------------------------
// Firebase Admin (optional — verifies ID tokens when service account is set)
// ---------------------------------------------------------------------------
const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const hasServiceAccount = !!(saPath && fs.existsSync(saPath));
const isProduction = process.env.NODE_ENV === 'production';

if (hasServiceAccount) {
  try {
    if (getApps().length === 0) {
      const serviceAccount = JSON.parse(fs.readFileSync(saPath!, 'utf-8'));
      initializeApp({ credential: cert(serviceAccount) });
      console.log('[Auth] Firebase Admin initialized — ID tokens will be verified');
    }
  } catch (e) {
    console.warn('[Auth] Failed to initialize Firebase Admin:', (e as Error).message);
  }
} else if (isProduction && !process.env.API_SECRET) {
  console.error(
    '[Auth] PRODUCTION MISCONFIGURED: set GOOGLE_APPLICATION_CREDENTIALS (service account file) or API_SECRET. Protected /api routes will return 503 until configured.'
  );
} else {
  console.log(
    '[Auth] Dev mode — Bearer tokens accepted when present. Set GOOGLE_APPLICATION_CREDENTIALS for full verification.'
  );
}

// ---------------------------------------------------------------------------
// Simple in-memory rate limiter (per IP)
// ---------------------------------------------------------------------------
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

const RATE_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const RATE_MAX = Number(process.env.RATE_LIMIT_MAX || 60);

function clientKey(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

export function rateLimit(req: Request, res: Response, next: NextFunction) {
  // Never rate-limit health checks (used by Docker/k8s probes)
  if (req.path === '/health' || req.originalUrl === '/api/health') {
    return next();
  }

  const key = clientKey(req);
  const now = Date.now();
  let bucket = rateBuckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + RATE_WINDOW_MS };
    rateBuckets.set(key, bucket);
  }

  bucket.count += 1;

  res.setHeader('X-RateLimit-Limit', String(RATE_MAX));
  res.setHeader('X-RateLimit-Remaining', String(Math.max(0, RATE_MAX - bucket.count)));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

  if (bucket.count > RATE_MAX) {
    return res.status(429).json({
      error: 'Too many requests. Please slow down and try again shortly.',
    });
  }

  next();
}

setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateBuckets) {
    if (now >= bucket.resetAt) rateBuckets.delete(key);
  }
}, 5 * 60_000).unref?.();

// ---------------------------------------------------------------------------
// Auth gate for protected API routes
// ---------------------------------------------------------------------------
function adminReady(): boolean {
  return hasServiceAccount && getApps().length > 0;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const apiSecret = process.env.API_SECRET;
  const providedKey = (req.headers['x-api-key'] as string | undefined) || '';

  // Shared secret path (server-to-server or locked-down demos)
  if (apiSecret) {
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (providedKey === apiSecret || bearerToken === apiSecret) {
      (req as any).uid = 'api-secret-user';
      return next();
    }
  }

  // Production hard requirement: verify Firebase tokens or use API_SECRET
  if (isProduction && !adminReady() && !apiSecret) {
    return res.status(503).json({
      error:
        'Server authentication is not configured. Set GOOGLE_APPLICATION_CREDENTIALS or API_SECRET on the host.',
    });
  }

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Missing authorization token. Sign in and retry, or provide x-api-key.',
    });
  }

  const token = authHeader.slice(7);

  // Full verification when Firebase Admin is available
  if (adminReady()) {
    try {
      const decoded = await getAuth().verifyIdToken(token);
      (req as any).uid = decoded.uid;
      (req as any).email = decoded.email;
      return next();
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  // Development only: accept any non-empty Bearer (Firebase client auth still required in UI)
  if (!isProduction) {
    (req as any).uid = 'dev-user';
    return next();
  }

  // Production without Admin but with API_SECRET that did not match above
  return res.status(401).json({ error: 'Invalid credentials' });
}
