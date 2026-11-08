import { Home } from '../layouts/Home/Home';
import fs from 'fs';
import path from 'path';

export default function HomePage({ projectsData }) {
  return <Home projectsData={projectsData} />;
}

export async function getServerSideProps() {
  const tmpProjectsPath = path.join('/tmp', 'projects.json');
  let projectsData = null;
  try {
    if (fs.existsSync(tmpProjectsPath)) {
      projectsData = JSON.parse(fs.readFileSync(tmpProjectsPath, 'utf8'));
    }
  } catch (error) {
    console.warn('Could not read temporary projects on home:', error.message);
  }
  if (!projectsData) {
    const dataFilePath = path.join(process.cwd(), 'src', 'data', 'projects.json');
    const fileData = fs.readFileSync(dataFilePath, 'utf8');
    projectsData = JSON.parse(fileData);
  }
  return {
    props: {
      projectsData,
    },
  };
}
