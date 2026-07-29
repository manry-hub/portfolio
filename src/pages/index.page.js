import { Home } from '../layouts/Home/Home';
import fs from 'fs';
import path from 'path';

export default function HomePage({ projectsData }) {
  return <Home projectsData={projectsData} />;
}

export async function getServerSideProps() {
  const dataFilePath = path.join(process.cwd(), 'src', 'data', 'projects.json');
  const fileData = fs.readFileSync(dataFilePath, 'utf8');
  return {
    props: {
      projectsData: JSON.parse(fileData),
    },
  };
}
