import { signToken, serializeAuthCookie } from 'utils/auth';
import crypto from 'crypto';

// In-memory rate limiter
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function isRateLimited(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record) return false;

  // Clean up expired window
  if (now - record.windowStart > WINDOW_MS) {
    loginAttempts.delete(ip);
    return false;
  }

  return record.count >= MAX_ATTEMPTS;
}

function recordAttempt(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now - record.windowStart > WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, windowStart: now });
  } else {
    record.count += 1;
  }
}

// Timing-safe string comparison
function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Compare against self to maintain constant time
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const clientIp = getClientIp(req);

  // Check rate limit
  if (isRateLimited(clientIp)) {
    return res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again in 15 minutes.',
    });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';

  const usernameMatch = safeCompare(username, adminUsername);
  const passwordMatch = safeCompare(password, adminPassword);

  if (usernameMatch && passwordMatch) {
    // Reset attempts on successful login
    loginAttempts.delete(clientIp);
    const token = signToken({ username });
    res.setHeader('Set-Cookie', serializeAuthCookie(token));
    return res.status(200).json({ success: true, message: 'Authenticated successfully' });
  }

  // Record failed attempt
  recordAttempt(clientIp);
  const record = loginAttempts.get(clientIp);
  const remaining = MAX_ATTEMPTS - (record?.count || 0);

  return res.status(401).json({
    success: false,
    message: `Invalid credentials. ${remaining > 0 ? `${remaining} attempts remaining.` : 'Account temporarily locked.'}`,
  });
}
