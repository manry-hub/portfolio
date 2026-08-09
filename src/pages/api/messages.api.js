import fs from 'fs';
import path from 'path';
import { parseCookies, verifyToken } from 'utils/auth';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'messages.json');

// Helper to authenticate
const isAuthenticated = req => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.auth_token;
  if (!token) return false;
  const user = verifyToken(token);
  return !!user;
};

// Helper to read data
const readData = () => {
  try {
    const fileData = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

// Helper to write data
const writeData = data => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
};

/**
 * Strip HTML tags to prevent stored XSS.
 */
function stripHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim();
}

export default function handler(req, res) {
  // Allow public access for POST (submitting a new message)
  // Protect GET and DELETE for admin dashboard only
  if (req.method !== 'POST' && !isAuthenticated(req)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const data = readData();

    switch (req.method) {
      case 'GET':
        // Protected: Return all messages
        return res.status(200).json(data);

      case 'POST': {
        // Public: Add a new message
        const rawEmail = req.body.email || '';
        const rawMessage = req.body.message || '';

        const email = stripHtml(String(rawEmail));
        const message = stripHtml(String(rawMessage));

        if (!email || !message) {
          return res.status(400).json({ message: 'Email and message are required' });
        }
        if (email.length > 512) {
          return res.status(400).json({ message: 'Email is too long' });
        }
        if (message.length > 4096) {
          return res.status(400).json({ message: 'Message is too long' });
        }

        const newMessage = {
          id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          email,
          message,
          date: new Date().toISOString(),
        };

        data.push(newMessage);
        writeData(data);

        return res.status(201).json({ message: 'Message saved successfully' });
      }

      case 'DELETE': {
        // Protected: Delete a message by ID
        const { id } = req.body;

        if (!id || typeof id !== 'string') {
          return res.status(400).json({ message: 'Invalid message ID' });
        }

        const filteredData = data.filter(msg => msg.id !== id);
        writeData(filteredData);

        return res.status(200).json({ message: 'Message deleted successfully', data: filteredData });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
