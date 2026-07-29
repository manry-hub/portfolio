import crypto from 'crypto';

const SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development_only';

// Base64URL encoding/decoding for JWT
const base64url = (str) => {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

const decodeBase64url = (str) => {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
};

/**
 * Creates a JWT-like signed token.
 */
export const signToken = (payload, expiresInSeconds = 86400) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  
  const payloadWithExp = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payloadWithExp));
  
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(signatureInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
    
  return `${signatureInput}.${signature}`;
};

/**
 * Verifies a JWT-like token. Returns the payload if valid, null otherwise.
 */
export const verifyToken = (token) => {
  if (!token) return null;
  
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  
  const [encodedHeader, encodedPayload, signature] = parts;
  
  const expectedSignature = crypto
    .createHmac('sha256', SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
    
  if (signature !== expectedSignature) return null;
  
  try {
    const payload = JSON.parse(decodeBase64url(encodedPayload));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch (err) {
    return null;
  }
};

/**
 * Parses cookies from a request string
 */
export const parseCookies = (cookieString) => {
  if (!cookieString) return {};
  
  return cookieString
    .split(';')
    .reduce((res, c) => {
      const [key, val] = c.split('=').map(i => i.trim());
      if (key && val !== undefined) {
        try {
          res[key] = decodeURIComponent(val);
        } catch (e) {
          res[key] = val;
        }
      }
      return res;
    }, {});
};

/**
 * Creates a serialized cookie string for setting HttpOnly auth cookie
 */
export const serializeAuthCookie = (token) => {
  const isProd = process.env.NODE_ENV === 'production';
  const maxAge = 86400; // 1 day
  return `auth_token=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Strict${isProd ? '; Secure' : ''}`;
};

export const clearAuthCookie = () => {
  return `auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`;
};
