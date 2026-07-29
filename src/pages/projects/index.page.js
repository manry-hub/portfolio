import { useState } from 'react';
import { Button } from 'components/Button';
import { Input } from 'components/Input';
import { Footer } from 'components/Footer';
import { Meta } from 'components/Meta';
import {
  ProjectBackground,
  ProjectContainer,
  ProjectHeader,
  ProjectSection,
  ProjectSectionContent,
} from 'layouts/Project';
import fs from 'fs';
import path from 'path';
import styles from './projects.module.css';

import usesBackgroundPlaceholder from 'assets/uses-background-placeholder.jpg';
import usesBackground from 'assets/uses-background.mp4';

export default function Projects({ allProjects }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const maxPerPage = 6;

  const filteredProjects = allProjects.filter(project => {
    const query = searchQuery.toLowerCase();
    return (
      project.title.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredProjects.length / maxPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * maxPerPage,
    currentPage * maxPerPage
  );

  const handleSearch = e => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to page 1 on new search
  };

  return (
    <>
      <Meta
        title="Projects Catalog"
        description="A complete showcase of all my projects."
      />
      <ProjectContainer className={styles.project}>
        <ProjectBackground
          src={usesBackground}
          placeholder={usesBackgroundPlaceholder}
          opacity={0.7}
        />
        <ProjectHeader
          title="Projects Catalog"
          description="A comprehensive collection of my web and mobile works."
          className={styles.headerLeft}
        />

        <ProjectSection padding="none">
          <ProjectSectionContent>
            <div className={styles.searchContainer}>
              <Input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                label="Search projects by title or description..."
              />
            </div>
            <div className={styles.grid}>
              {paginatedProjects.map(project => (
                <a
                  key={project.id}
                  href={project.buttonLink || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.card}
                >
                  <div className={styles.content}>
                    <h3 className={styles.title}>{project.title}</h3>
                    <p className={styles.description}>{project.description}</p>
                    <div className={styles.buttonWrap}>
                      <Button secondary as="span" iconEnd="arrowRight">
                        {project.buttonText || 'View Project'}
                      </Button>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <Button
                  secondary
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  icon="arrowLeft"
                ></Button>
                <span style={{ fontSize: 'var(--fontSizeBodyM)' }}>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  secondary
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  icon="arrowRight"
                ></Button>
              </div>
            )}
          </ProjectSectionContent>
        </ProjectSection>
      </ProjectContainer>
      <Footer />
    </>
  );
}

export async function getServerSideProps() {
  const dataFilePath = path.join(process.cwd(), 'src', 'data', 'projects.json');
  const fileData = fs.readFileSync(dataFilePath, 'utf8');
  const parsedData = JSON.parse(fileData);

  // Combine both web and mobile projects into a single flat array
  const allProjects = [...(parsedData.web || []), ...(parsedData.mobile || [])];

  return {
    props: {
      allProjects,
    },
  };
}
