import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoginButton from './LoginButton';
import { makeStyles, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  container: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colorNeutralBackground1,
    flex: 1,
  },
  loginCard: {
    padding: tokens.spacingVerticalXXL,
    textAlign: 'center',
    maxWidth: '400px',
  },
  title: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: tokens.spacingVerticalL,
    color: tokens.colorNeutralForeground1,
  },
  subtitle: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground2,
    marginBottom: tokens.spacingVerticalXXL,
  }
});

const AuthGuard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const styles = useStyles();

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.loginCard}>
          <h1 className={styles.title}>Microsoft Prototype Gallery</h1>
          <p className={styles.subtitle}>
            Discover and share prototypes securely within Microsoft
          </p>
          <LoginButton />
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default AuthGuard;