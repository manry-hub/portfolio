import fs from 'fs';
import path from 'path';
import { parseCookies, verifyToken } from 'utils/auth';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Adjust as needed for images
    },
  },
};

const isAuthenticated = (req) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.auth_token;
  if (!token) return false;
  return !!verifyToken(token);
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (!isAuthenticated(req)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ message: 'No image data provided' });
    }

    // The imageBase64 should be in the format: data:image/webp;base64,.....
    const matches = imageBase64.match(/^data:(.*?);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ message: 'Invalid image data' });
    }

    const imageBuffer = Buffer.from(matches[2], 'base64');
    
    // Ensure public/uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `img-${Date.now()}.webp`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, imageBuffer);

    const fileUrl = `/uploads/${filename}`;
    
    return res.status(200).json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('Upload Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
