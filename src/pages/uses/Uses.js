import usesBackgroundPlaceholder from 'assets/uses-background-placeholder.jpg';
import usesBackground from 'assets/uses-background.mp4';
import { Footer } from 'components/Footer';
import { Link } from 'components/Link';
import { List, ListItem } from 'components/List';
import { Table, TableBody, TableCell, TableHeadCell, TableRow } from 'components/Table';
import {
  ProjectBackground,
  ProjectContainer,
  ProjectHeader,
  ProjectSection,
  ProjectSectionContent,
  ProjectSectionHeading,
  ProjectSectionText,
  ProjectTextRow,
} from 'layouts/Project';

import styles from './uses.module.css';

export const Uses = () => {
  return (
    <>
      <ProjectContainer className={styles.uses}>
        <ProjectBackground
          src={usesBackground}
          placeholder={usesBackgroundPlaceholder}
          opacity={0.7}
        />
        <ProjectHeader
          title="Uses"
          description="A somewhat comprehensive list of tools, apps, and more that I use on a daily basis to design and code things. And yeah, that is a Johnny Mnemonic GIF in the background."
        />

        <ProjectSection padding="none" className={styles.section}>
          <ProjectSectionContent>
            <ProjectTextRow width="m">
              <ProjectSectionHeading>Software Engineering</ProjectSectionHeading>
              <ProjectSectionText as="div">
                <List>
                  <ListItem>
                    <Link href="https://reactjs.org/">React</Link> is my front end
                    Javascript library of choice. The component-centric mental model is
                    the first thing that truly made sense to me as a designer. and if I
                    use react, I will definitely use{' '}
                    <Link href="https://nextjs.org/"> Next js.</Link>
                  </ListItem>
                  <ListItem>
                    <Link href="https://expressjs.com/">Express </Link> is my backend
                    framework of choice. Its simplicity and flexibility let me build
                    scalable APIs without unnecessary overhead. As my main tool, it’s
                    where I feel most efficient and creative when designing server-side
                    logic.
                  </ListItem>
                  <ListItem>
                    I’m also comfortable working with{' '}
                    <Link href="https://spring.io/">Spring</Link> for enterprise Java
                    applications,<Link href="https://laravel.com/"> Laravel</Link> for
                    PHP-based systems, and{' '}
                    <Link href="https://flask.palletsprojects.com/">Golang</Link> for best
                    performance services. These give me the versatility to adapt to
                    different project requirements
                  </ListItem>
                </List>
              </ProjectSectionText>
            </ProjectTextRow>
          </ProjectSectionContent>
        </ProjectSection>

        <ProjectSection padding="none" className={styles.section}>
          <ProjectSectionContent>
            <ProjectTextRow stretch width="m">
              <ProjectSectionHeading>System</ProjectSectionHeading>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableHeadCell>Operating system</TableHeadCell>
                    <TableCell>Debian Linux and Windows (dualboot)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHeadCell>IDE</TableHeadCell>
                    <TableCell>Vs Code, Netbeans, Collab</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHeadCell>DBMS Studio</TableHeadCell>
                    <TableCell>Datagrip</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </ProjectTextRow>
          </ProjectSectionContent>
        </ProjectSection>
      </ProjectContainer>
      <Footer />
    </>
  );
};
