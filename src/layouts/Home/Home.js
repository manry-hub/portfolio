import gamestackTexture2Placeholder from 'assets/gamestack-list-placeholder.jpg';

import gamestackTexturePlaceholder from 'assets/gamestack-login-placeholder.jpg';

import sliceTexturePlaceholder from 'assets/slice-app-placeholder.jpg';

import sprTexturePlaceholder from 'assets/spr-lesson-builder-dark-placeholder.jpg';

import hmsPreview from 'assets/hms-preview.png';
import cicd from 'assets/cicd.png';
import algoVE from 'assets/algo-ve-preview.png';
import blockchain from 'assets/blockchain.png';
import algoVE2 from 'assets/algoVE2.png';
import stockDash from 'assets/stock-dashboard.png';
import stockDash2 from 'assets/stockDash2.png';
import { Footer } from 'components/Footer';
import { Meta } from 'components/Meta';
import { Intro } from 'layouts/Home/Intro';
import { Profile } from 'layouts/Home/Profile';
import { ProjectSummary } from 'layouts/Home/ProjectSummary';
import { useEffect, useRef, useState } from 'react';
import styles from './Home.module.css';

const disciplines = ['Software', 'Data'];

export const Home = () => {
  const [visibleSections, setVisibleSections] = useState([]);
  const [scrollIndicatorHidden, setScrollIndicatorHidden] = useState(false);
  const intro = useRef();
  const projectOne = useRef();
  const projectTwo = useRef();
  const projectThree = useRef();
  const details = useRef();

  useEffect(() => {
    const sections = [intro, projectOne, projectTwo, projectThree, details];

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
        title="Hostel Management System"
        description="A platform for students to address all their hostel issues with their hostel warden"
        buttonText="View project"
        buttonLink="https://github.com/mayankjain25/Hostel-Management-System"
        model={{
          type: 'laptop',
          alt: 'Displaying the home page of the website.',
          textures: [
            {
              srcSet: [hmsPreview, hmsPreview],
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
        title="Stocks Dashboard"
        description="A dashboard to display some of the top performing stocks in the Indian market"
        buttonText="View website"
        buttonLink="http://stock-dashboard.kiitians.com/"
        model={{
          type: 'phone',
          alt: 'App login screen',
          textures: [
            {
              srcSet: [stockDash],
              placeholder: gamestackTexturePlaceholder,
            },
            {
              srcSet: [stockDash2],
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
        title="Blockchain Based FIR Registration System"
        description="A blockchain based FIR registration system to ensure transparency and security of the data to facilitate and safeguard the interests of the victim."
        buttonText="Visit repository"
        buttonLink="https://github.com/mayankjain25/Blockchain-Based-FIR-System"
        model={{
          type: 'laptop',
          alt: 'landing page',
          textures: [
            {
              srcSet: [blockchain],
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
