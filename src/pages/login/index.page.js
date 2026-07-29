import { Button } from 'components/Button';
import { Heading } from 'components/Heading';
import { Input } from 'components/Input';
import { Meta } from 'components/Meta';
import { Section } from 'components/Section';
import { Text } from 'components/Text';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styles from './login.module.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Section className={styles.login}>
      <Meta title="Login" description="Login to dashboard" />
      
      <Heading level={2} as="h1">
        Dashboard Access
      </Heading>
      <Text>Please sign in to manage your portfolio.</Text>

      <form className={styles.form} onSubmit={handleLogin}>
        <Input
          id="username"
          label="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Input
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        {error && (
          <Text style={{ color: 'rgb(var(--rgbError))' }}>
            {error}
          </Text>
        )}

        <Button
          className={styles.button}
          type="submit"
          loading={isLoading}
          loadingText="Authenticating"
          iconEnd="arrowRight"
        >
          Sign In
        </Button>
      </form>
    </Section>
  );
}
