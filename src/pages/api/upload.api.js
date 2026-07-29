import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { parseCookies, verifyToken } from 'utils/auth';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '3mb', // Reduced from 10mb
    },
  },
};

const ALLOWED_MIME_TYPES = ['image/webp', 'image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

const isAuthenticated = req => {
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

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ message: 'No image data provided' });
    }

    // Parse and validate base64 data URI
    const matches = imageBase64.match(/^data:([\w/+-]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ message: 'Invalid image data format' });
    }

    const mimeType = matches[1].toLowerCase();
    const base64Data = matches[2];

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return res.status(400).json({
        message: `Invalid file type: ${mimeType}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
      });
    }

    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Validate file size
    if (imageBuffer.length > MAX_FILE_SIZE_BYTES) {
      return res.status(400).json({
        message: `File too large. Maximum size is ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB`,
      });
    }

    // Validate magic bytes (file signature)
    const isValidImage = validateMagicBytes(imageBuffer, mimeType);
    if (!isValidImage) {
      return res.status(400).json({ message: 'File content does not match declared type' });
    }

    // Ensure public/uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Use unpredictable filename
    const uniqueId = crypto.randomUUID();
    const ext = mimeType === 'image/jpeg' || mimeType === 'image/jpg' ? 'jpg' : mimeType.split('/')[1];
    const filename = `${uniqueId}.${ext}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, imageBuffer);

    const fileUrl = `/uploads/${filename}`;

    return res.status(200).json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('Upload Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

/**
 * Validate file magic bytes against declared MIME type.
 */
function validateMagicBytes(buffer, mimeType) {
  if (buffer.length < 4) return false;

  switch (mimeType) {
    case 'image/png':
      // PNG: 89 50 4E 47
      return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;

    case 'image/jpeg':
    case 'image/jpg':
      // JPEG: FF D8 FF
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;

    case 'image/gif':
      // GIF: 47 49 46 38
      return buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38;

    case 'image/webp':
      // WebP: 52 49 46 46 ... 57 45 42 50 (RIFF....WEBP)
      return (
        buffer.length >= 12 &&
        buffer[0] === 0x52 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x46 &&
        buffer[8] === 0x57 &&
        buffer[9] === 0x45 &&
        buffer[10] === 0x42 &&
        buffer[11] === 0x50
      );

    default:
      return false;
  }
}
