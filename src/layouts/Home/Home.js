import safedriveLarge from 'assets/Safedrive-start.jpg';
import safedriveCamera from 'assets/safedrive-camera.jpg';
import himasisLarge from 'assets/himasis-large.png';
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
import { usePlayAudio } from '../../hooks/usePlayAudio';
import LoadingScreen from 'components/LoadingScreen';

const disciplines = ['Engineer', 'Developer', 'Architect', 'Analyst'];

export const Home = () => {
  const [visibleSections, setVisibleSections] = useState([]);
  const [scrollIndicatorHidden, setScrollIndicatorHidden] = useState(false);
  const intro = useRef();
  const projectOne = useRef();
  const projectTwo = useRef();
  const projectThree = useRef();
  const projectFour = useRef();
  const details = useRef();

  const [loaded, setLoaded] = useState(false);
  const { play } = usePlayAudio();

  const handleStart = () => {
    play(); // ✅ gesture valid
    setLoaded(true); // hilangkan loading screen
  };
  useEffect(() => {
    const sections = [intro, projectOne, projectTwo, projectThree, projectFour, details];

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
      {!loaded && <LoadingScreen onStart={handleStart} />}

      <Meta
        title="Designer + Developer"
        description="Design portfolio of Hilman Ansory"
      />
      <Intro
        id="intro"
        sectionRef={intro}
        disciplines={disciplines}
        scrollIndicatorHidden={scrollIndicatorHidden}
      />
      <ProjectSummary
        id="project-1"
        sectionRef={projectOne}
        visible={visibleSections.includes(projectOne.current)}
        index={1}
        title="hacktiv8 course path"
        description="Build a platform to help customer make a decission for buying course in hacktiv8 with AI Assistence from IBM Granite"
        buttonText="View project"
        buttonLink="https://github.com/manry-hub/Tracktiv8"
        model={{
          type: 'laptop',
          alt: 'Displaying the home page of the website.',
          textures: [
            {
              srcSet: [tracktivLarge, tracktivLarge],
              placeholder: sprTexturePlaceholder,
            },
          ],
        }}
      />
      <ProjectSummary
        id="project-2"
        alternate
        sectionRef={projectTwo}
        visible={visibleSections.includes(projectTwo.current)}
        index={2}
        title="Driver Safety Detection"
        description="design and development app to help driver safety with React Native"
        buttonText="View Project"
        buttonLink="https://github.com/manry-hub/SafeDrive"
        model={{
          type: 'phone',
          alt: 'App login screen',
          textures: [
            {
              srcSet: [safedriveCamera],
              placeholder: gamestackTexturePlaceholder,
            },
            {
              srcSet: [safedriveLarge],
              placeholder: gamestackTexture2Placeholder,
            },
          ],
        }}
      />
      <ProjectSummary
        id="project-3"
        // alternate
        sectionRef={projectThree}
        visible={visibleSections.includes(projectThree.current)}
        index={3}
        title="Organization Profile"
        description="Improve the UI and UX appearance of the old Himasis website and develop it regularly"
        buttonText="View Project"
        buttonLink="https://github.com/manry-hub/himasis.org"
        model={{
          type: 'laptop',
          alt: 'landing page',
          textures: [
            {
              srcSet: [himasisLarge],
              placeholder: gamestackTexturePlaceholder,
            },
          ],
        }}
      />
      <ProjectSummary
        id="project-4"
        alternate
        sectionRef={projectFour}
        visible={visibleSections.includes(projectFour.current)}
        index={4}
        title="Chicken Distributor Ordering"
        description="design and development e-commerce app to make selling chickens to the right target with html css js and PWA"
        buttonText="View Website"
        buttonLink="https://web-distributor-ordering.vercel.app"
        model={{
          type: 'phone',
          alt: 'App login screen',
          textures: [
            {
              srcSet: [chickenBox],
              placeholder: gamestackTexture2Placeholder,
            },
            {
              srcSet: [chickenOrder],
              placeholder: gamestackTexturePlaceholder,
            },
          ],
        }}
      />

      <Profile
        sectionRef={details}
        visible={visibleSections.includes(details.current)}
        id="details"
      />
      <Footer />
    </div>
  );
};
