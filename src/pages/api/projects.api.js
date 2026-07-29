import fs from 'fs';
import path from 'path';
import { parseCookies, verifyToken } from 'utils/auth';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'projects.json');

// Helper to authenticate
const isAuthenticated = (req) => {
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
const writeData = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
};

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
        const newProject = req.body.project;
        const category = req.body.category; // 'web' or 'mobile'
        
        if (!data[category]) {
          return res.status(400).json({ message: 'Invalid category' });
        }
        
        // Generate a new ID if not provided
        if (!newProject.id) {
          newProject.id = `project-${Date.now()}`;
        }
        
        data[category].push(newProject);
        writeData(data);
        return res.status(201).json({ message: 'Project created', data });
      }

      case 'PUT': {
        const updatedProject = req.body.project;
        const oldCategory = req.body.oldCategory;
        const newCategory = req.body.newCategory;

        if (!data[oldCategory] || !data[newCategory]) {
          return res.status(400).json({ message: 'Invalid category' });
        }

        // Remove from old category
        data[oldCategory] = data[oldCategory].filter((p) => p.id !== updatedProject.id);
        
        // Add to new category
        data[newCategory].push(updatedProject);

        writeData(data);
        return res.status(200).json({ message: 'Project updated', data });
      }

      case 'DELETE': {
        const { id, category } = req.body;

        if (!data[category]) {
          return res.status(400).json({ message: 'Invalid category' });
        }

        data[category] = data[category].filter((p) => p.id !== id);
        writeData(data);
        return res.status(200).json({ message: 'Project deleted', data });
      }

      case 'PATCH': {
        const { category, projects } = req.body;

        if (!data[category] || !Array.isArray(projects)) {
          return res.status(400).json({ message: 'Invalid payload' });
        }

        data[category] = projects;
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
