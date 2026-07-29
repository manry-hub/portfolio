import { signToken, serializeAuthCookie } from 'utils/auth';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username, password } = req.body;
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';

  if (username === adminUsername && password === adminPassword) {
    const token = signToken({ username });
    res.setHeader('Set-Cookie', serializeAuthCookie(token));
    return res.status(200).json({ success: true, message: 'Authenticated successfully' });
  }

  return res.status(401).json({ success: false, message: 'Invalid credentials' });
}
