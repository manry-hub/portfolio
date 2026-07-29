import fs from 'fs';
import path from 'path';
import { parseCookies, verifyToken } from 'utils/auth';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'projects.json');

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
  const fileData = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(fileData);
};

// Helper to write data
const writeData = data => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
};

// --- Input Validation & Sanitization ---

const ALLOWED_CATEGORIES = ['web', 'mobile'];
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_BUTTON_TEXT_LENGTH = 50;
const MAX_BUTTON_LINK_LENGTH = 500;
const ALLOWED_MODEL_TYPES = ['laptop', 'phone'];

/**
 * Strip HTML tags to prevent stored XSS.
 */
function stripHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim();
}

/**
 * Validate and sanitize a single project object.
 * Returns { valid, project, error }.
 */
function sanitizeProject(raw) {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, error: 'Invalid project data' };
  }

  const title = stripHtml(String(raw.title || ''));
  const description = stripHtml(String(raw.description || ''));
  const buttonText = stripHtml(String(raw.buttonText || 'View Project'));
  const buttonLink = String(raw.buttonLink || '').trim();

  if (!title || title.length === 0) {
    return { valid: false, error: 'Title is required' };
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return { valid: false, error: `Title must be under ${MAX_TITLE_LENGTH} characters` };
  }
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return { valid: false, error: `Description must be under ${MAX_DESCRIPTION_LENGTH} characters` };
  }
  if (buttonText.length > MAX_BUTTON_TEXT_LENGTH) {
    return { valid: false, error: `Button text must be under ${MAX_BUTTON_TEXT_LENGTH} characters` };
  }
  if (buttonLink.length > MAX_BUTTON_LINK_LENGTH) {
    return { valid: false, error: `Button link must be under ${MAX_BUTTON_LINK_LENGTH} characters` };
  }

  // Validate model
  let model = { type: 'laptop', alt: '', textures: [{ src: '', placeholder: '' }] };
  if (raw.model && typeof raw.model === 'object') {
    const modelType = ALLOWED_MODEL_TYPES.includes(raw.model.type) ? raw.model.type : 'laptop';
    const modelAlt = stripHtml(String(raw.model.alt || ''));

    let textures = [{ src: '', placeholder: '' }];
    if (Array.isArray(raw.model.textures)) {
      textures = raw.model.textures.slice(0, 5).map(t => ({
        src: String(t?.src || '').trim().slice(0, 500),
        placeholder: String(t?.placeholder || '').trim().slice(0, 500),
      }));
    }

    model = { type: modelType, alt: modelAlt, textures };
  }

  const project = {
    id: raw.id ? String(raw.id).trim().slice(0, 50) : `project-${Date.now()}`,
    title,
    description,
    buttonText,
    buttonLink,
    showOnHome: raw.showOnHome === false ? false : true,
    model,
  };

  return { valid: true, project };
}

function validateCategory(category) {
  return ALLOWED_CATEGORIES.includes(category);
}

// --- API Handler ---

export default function handler(req, res) {
  if (req.method !== 'GET' && !isAuthenticated(req)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const data = readData();

    switch (req.method) {
      case 'GET':
        return res.status(200).json(data);

      case 'POST': {
        const category = req.body.category;
        if (!validateCategory(category) || !data[category]) {
          return res.status(400).json({ message: 'Invalid category. Must be "web" or "mobile".' });
        }

        const { valid, project, error } = sanitizeProject(req.body.project);
        if (!valid) {
          return res.status(400).json({ message: error });
        }

        data[category].push(project);
        writeData(data);
        return res.status(201).json({ message: 'Project created', data });
      }

      case 'PUT': {
        const oldCategory = req.body.oldCategory;
        const newCategory = req.body.newCategory;

        if (!validateCategory(oldCategory) || !validateCategory(newCategory)) {
          return res.status(400).json({ message: 'Invalid category. Must be "web" or "mobile".' });
        }
        if (!data[oldCategory] || !data[newCategory]) {
          return res.status(400).json({ message: 'Invalid category' });
        }

        const { valid, project, error } = sanitizeProject(req.body.project);
        if (!valid) {
          return res.status(400).json({ message: error });
        }

        // Remove from old category
        data[oldCategory] = data[oldCategory].filter(p => p.id !== project.id);

        // Add to new category
        data[newCategory].push(project);

        writeData(data);
        return res.status(200).json({ message: 'Project updated', data });
      }

      case 'DELETE': {
        const { id, category } = req.body;

        if (!id || typeof id !== 'string') {
          return res.status(400).json({ message: 'Invalid project ID' });
        }
        if (!validateCategory(category) || !data[category]) {
          return res.status(400).json({ message: 'Invalid category' });
        }

        data[category] = data[category].filter(p => p.id !== id);
        writeData(data);
        return res.status(200).json({ message: 'Project deleted', data });
      }

      case 'PATCH': {
        const { category, projects } = req.body;

        if (!validateCategory(category) || !data[category]) {
          return res.status(400).json({ message: 'Invalid category' });
        }
        if (!Array.isArray(projects)) {
          return res.status(400).json({ message: 'Invalid payload: projects must be an array' });
        }

        // Validate that reorder only contains existing project IDs (no injection)
        const existingIds = new Set(data[category].map(p => p.id));
        const incomingIds = new Set(projects.map(p => p?.id));

        if (existingIds.size !== incomingIds.size) {
          return res.status(400).json({ message: 'Reorder must contain all existing projects' });
        }
        for (const id of incomingIds) {
          if (!existingIds.has(id)) {
            return res.status(400).json({ message: `Unknown project ID: ${id}` });
          }
        }

        // Sanitize each project in the reorder
        const sanitized = [];
        for (const raw of projects) {
          const result = sanitizeProject(raw);
          if (!result.valid) {
            return res.status(400).json({ message: result.error });
          }
          sanitized.push(result.project);
        }

        data[category] = sanitized;
        writeData(data);
        return res.status(200).json({ message: 'Projects reordered', data });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
