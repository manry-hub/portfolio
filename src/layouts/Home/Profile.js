import profileImgPlaceholder from 'assets/profile-placeholder.jpg';
import profileKatakana from 'assets/katakana-profile.svg?url';
import { Button } from 'components/Button';
import { DecoderText } from 'components/DecoderText';
import { Divider } from 'components/Divider';
import { Heading } from 'components/Heading';
import { Image } from 'components/Image';
import { Link } from 'components/Link';
import { Section } from 'components/Section';
import { Text } from 'components/Text';
import { Transition } from 'components/Transition';
import { Fragment, useState } from 'react';
import { media } from 'utils/style';
import styles from './Profile.module.css';

import profileImgLarge from 'assets/profile-large.jpg';
import profileImg from 'assets/profile.jpg';

const ProfileText = ({ visible, titleId }) => (
  <Fragment>
    <Heading className={styles.title} data-visible={visible} level={3} id={titleId}>
      <DecoderText text="Hi there" start={visible} delay={500} />
    </Heading>
    {/* I’m Hilman,with a passion for creating dynamic and user-friendly websites. Currently
      focused on building skills in <Link>software engineering</Link>, I am experienced
      with technologies like Express, Next js, Laravel, etc. Although my main focus is on
      software engineering. */}
    <Text className={styles.description} data-visible={visible} size="l" as="p">
      I’m Hilman,with a passion for creating dynamic and user-friendly websites. Currently
      focused on building skills in{' '}
      <Link href="https://open.spotify.com/user/31jva75tq4nziw65avn7xgv3b73q">
        software engineering
      </Link>
      , I am experienced with technologies like <b>Express, Next js, Spring, etc. </b>
      Although my main focus is on software engineering.
    </Text>
    {/*  I still have a strong interest in <Link>data engineering </Link>and enjoy
      integrating data-driven insights into my projects. I thrive in collaborative
      environments, always eager to learn new skills, and excited to contribute to
      innovative web development projects. */}
    <Text className={styles.description} data-visible={visible} size="l" as="p">
      I still have a strong interest in{' '}
      <Link href="https://open.spotify.com/user/31jva75tq4nziw65avn7xgv3b73q">
        data engineering{' '}
      </Link>
      and enjoy integrating data-driven insights into my projects. I thrive in
      collaborative environments, always eager to learn new skills, and excited to
      contribute to innovative web development projects.
    </Text>
  </Fragment>
);

export const Profile = ({ id, visible, sectionRef }) => {
  const [focused, setFocused] = useState(false);
  const titleId = `${id}-title`;

  return (
    <Section
      className={styles.profile}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      as="section"
      id={id}
      ref={sectionRef}
      aria-labelledby={titleId}
      tabIndex={-1}
    >
      <Transition in={visible || focused} timeout={0}>
        {visible => (
          <div className={styles.content}>
            <div className={styles.column}>
              <ProfileText visible={visible} titleId={titleId} />
              <Button
                secondary
                className={styles.button}
                data-visible={visible}
                href="/contact"
                icon="send"
              >
                Send me a message
              </Button>
            </div>
            <div className={styles.column}>
              <div className={styles.tag} aria-hidden>
                <Divider
                  notchWidth="64px"
                  notchHeight="8px"
                  collapsed={!visible}
                  collapseDelay={1000}
                />
                <div className={styles.tagText} data-visible={visible}>
                  About Me
                </div>
              </div>
              <div className={styles.image}>
                <Image
                  reveal
                  delay={100}
                  placeholder={profileImgPlaceholder}
                  srcSet={[profileImg, profileImg]}
                  sizes={`(max-width: ${media.mobile}px) 100vw, 480px`}
                  alt="Me standing in front of the Torii on Miyajima, an island off the coast of Hiroshima in Japan"
                />
                <svg
                  aria-hidden="true"
                  width="135"
                  height="765"
                  viewBox="0 0 135 765"
                  className={styles.svg}
                  data-visible={visible}
                >
                  <use href={`${profileKatakana}#katakana-profile`} />
                </svg>
              </div>
            </div>
          </div>
        )}
      </Transition>
    </Section>
  );
};
