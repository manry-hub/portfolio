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

export const Environtment = () => {
  return (
    <>
      <ProjectContainer className={styles.uses}>
        <ProjectBackground
          src={usesBackground}
          placeholder={usesBackgroundPlaceholder}
          opacity={0.7}
        />
        <ProjectHeader
          title="Environtment"
          description="A somewhat comprehensive list of tools, apps, and more that I use on a daily basis to  code things. And yeah, "
        />

        <ProjectSection padding="none" className={styles.section}>
          <ProjectSectionContent>
            <ProjectTextRow width="m">
              <ProjectSectionHeading>Technologies I Use</ProjectSectionHeading>
              <ProjectSectionText as="div">
                <List>
                  <ListItem>
                    <Link href="https://reactjs.org/">React</Link> is my front end
                    Javascript library of choice. The component-centric mental model is
                    the first thing that truly made sense to me. and if I use react, I
                    will definitely use <Link href="https://nextjs.org/"> Next js.</Link>
                  </ListItem>
                  <ListItem>
                    For backend development, I primarily work with
                    <Link href="https://laravel.com/"> Laravel</Link> is my go-to
                    framework for rapid and well-structured product development,{' '}
                    <Link href="https://spring.io/">Spring</Link> for enterprise-grade
                    Java applications that require reliability and maintainability, and{' '}
                    <Link href="https://nestjs.com/">NestJS</Link> for scalable Node.js
                    services with a clean modular architecture. These give me the
                    versatility to adapt to different project requirements
                  </ListItem>
                </List>
              </ProjectSectionText>
            </ProjectTextRow>
          </ProjectSectionContent>
        </ProjectSection>

        <ProjectSection padding="none" className={styles.section}>
          <ProjectSectionContent>
            <ProjectTextRow stretch width="m">
              <ProjectSectionHeading>My Setup</ProjectSectionHeading>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableHeadCell>Operating system</TableHeadCell>
                    <TableCell>Debian Linux and Windows (dualboot)</TableCell>
                  </TableRow>
                  {/* <TableRow>
                    <TableHeadCell>Design Architecture</TableHeadCell>
                    <TableCell>Clean, Layered, Monolith, Microservice</TableCell>
                  </TableRow> */}
                  <TableRow>
                    <TableHeadCell>Tools</TableHeadCell>
                    <TableCell>
                      VsCode, Antigravity, Intellij Idea, Datagrip, Sparx Architecture
                      Enterprise, Worksblue etc.
                    </TableCell>
                  </TableRow>
                  {/* <TableRow>
                    <TableHeadCell>DBMS</TableHeadCell>
                    <TableCell>PostgreSQL, MySQL, MongoDB, etc. </TableCell>
                  </TableRow> */}
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
