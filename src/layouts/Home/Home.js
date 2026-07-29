import safedriveLarge from 'assets/Safedrive-start.jpg';
import safedriveCamera from 'assets/safedrive-camera.jpg';
import himasisLarge from 'assets/himasis-large.png';
import omahkopiLarge from 'assets/omah-kopi.png';
import tracktivLarge from 'assets/tracktiv-large.png';
import gamestackTexture2Placeholder from 'assets/gamestack-list-placeholder.jpg';
import gamestackTexturePlaceholder from 'assets/gamestack-login-placeholder.jpg';
import sprTexturePlaceholder from 'assets/spr-lesson-builder-dark-placeholder.jpg';
import chickenOrder from 'assets/ayam-potong-view.png';
import chickenBox from 'assets/ayam-potong-box.png';

import { Footer } from 'components/Footer';
import { Meta } from 'components/Meta';
import { Intro } from 'layouts/Home/Intro';
import { Profile } from 'layouts/Home/Profile';
import { ProjectSummary } from 'layouts/Home/ProjectSummary';
import { useEffect, useRef, useState } from 'react';
import styles from './Home.module.css';

const disciplines = ['Engineer', 'Architect'];

const imageMap = {
  safedriveLarge,
  safedriveCamera,
  himasisLarge,
  omahkopiLarge,
  tracktivLarge,
  gamestackTexture2Placeholder,
  gamestackTexturePlaceholder,
  sprTexturePlaceholder,
  chickenOrder,
  chickenBox,
};

const getProjectData = project => {
  return {
    ...project,
    model: {
      ...project.model,
      textures: project.model.textures.map(texture => {
        const srcObj = imageMap[texture.src] || { src: texture.src, width: 1920, height: 1080 };
        const placeholderObj = imageMap[texture.placeholder] || { src: texture.placeholder, width: 1920, height: 1080 };
        return {
          srcSet: [srcObj],
          placeholder: placeholderObj,
        };
      }),
    },
  };
};

export const Home = ({ projectsData = { web: [], mobile: [] } }) => {
  const [visibleSections, setVisibleSections] = useState([]);
  const [scrollIndicatorHidden, setScrollIndicatorHidden] = useState(false);
  const [activeWebIndex, setActiveWebIndex] = useState(0);
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);

  const intro = useRef();
  const webProjectRef = useRef();
  const mobileProjectRef = useRef();
  const details = useRef();

  useEffect(() => {
    const sections = [intro, webProjectRef, mobileProjectRef, details];

    const sectionObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const section = entry.target;
            observer.unobserve(section);
            if (visibleSections.includes(section)) return;
            setVisibleSections(prevSections => [...prevSections, section]);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );

    const indicatorObserver = new IntersectionObserver(
      ([entry]) => {
        setScrollIndicatorHidden(!entry.isIntersecting);
      },
      { rootMargin: '-100% 0px 0px 0px' }
    );

    sections.forEach(section => {
      sectionObserver.observe(section.current);
    });

    indicatorObserver.observe(intro.current);

    return () => {
      sectionObserver.disconnect();
      indicatorObserver.disconnect();
    };
  }, [visibleSections]);

  return (
    <div className={styles.home}>
      <Meta
        title="Software Enthusiast"
        description="Portfolio website of Hilman Ansory"
      />
      <Intro
        id="intro"
        sectionRef={intro}
        disciplines={disciplines}
        scrollIndicatorHidden={scrollIndicatorHidden}
      />
      {projectsData.web.filter(p => p.showOnHome !== false).length > 0 && (
        <ProjectSummary
          id="web-projects"
          sectionRef={webProjectRef}
          visible={visibleSections.includes(webProjectRef.current)}
          index={1}
          onNext={() => setActiveWebIndex(prev => (prev + 1) % projectsData.web.filter(p => p.showOnHome !== false).length)}
          onPrev={() =>
            setActiveWebIndex(
              prev => (prev - 1 + projectsData.web.filter(p => p.showOnHome !== false).length) % projectsData.web.filter(p => p.showOnHome !== false).length
            )
          }
          currentIndex={activeWebIndex + 1}
          totalProjects={projectsData.web.filter(p => p.showOnHome !== false).length}
          {...getProjectData(projectsData.web.filter(p => p.showOnHome !== false)[activeWebIndex])}
        />
      )}

      {projectsData.mobile.filter(p => p.showOnHome !== false).length > 0 && (
        <ProjectSummary
          id="mobile-projects"
          alternate
          sectionRef={mobileProjectRef}
          visible={visibleSections.includes(mobileProjectRef.current)}
          index={2}
          onNext={() =>
            setActiveMobileIndex(prev => (prev + 1) % projectsData.mobile.filter(p => p.showOnHome !== false).length)
          }
          onPrev={() =>
            setActiveMobileIndex(
              prev => (prev - 1 + projectsData.mobile.filter(p => p.showOnHome !== false).length) % projectsData.mobile.filter(p => p.showOnHome !== false).length
            )
          }
          currentIndex={activeMobileIndex + 1}
          totalProjects={projectsData.mobile.filter(p => p.showOnHome !== false).length}
          {...getProjectData(projectsData.mobile.filter(p => p.showOnHome !== false)[activeMobileIndex])}
        />
      )}

      <Profile
        sectionRef={details}
        visible={visibleSections.includes(details.current)}
        id="details"
      />

      <Footer />
    </div>
  );
};
