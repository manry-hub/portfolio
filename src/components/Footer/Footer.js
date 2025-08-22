import { Text } from 'components/Text';
import { classes } from 'utils/style';
import styles from './Footer.module.css';

export const Footer = ({ className }) => (
  <footer className={classes(styles.footer, className)}>
    <Text size="s" align="center" style={{ display: 'flex', alignItems: 'center' }}>
      <span className={styles.date}></span>
      <span> Built with inspired by Hamish Williams.</span>
    </Text>
  </footer>
);
