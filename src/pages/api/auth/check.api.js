import { parseCookies, verifyToken } from 'utils/auth';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.auth_token;

  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ authenticated: false });
  }

  return res.status(200).json({ authenticated: true, user: payload });
}
