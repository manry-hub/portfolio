import { clearAuthCookie } from 'utils/auth';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  res.setHeader('Set-Cookie', clearAuthCookie());
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
}
