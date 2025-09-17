import React from 'react';
import { makeStyles, tokens, Button } from '@fluentui/react-components';
import { SignOut24Regular, Person24Regular } from '@fluentui/react-icons';
import { useAuth } from '../../contexts/AuthContext';

const useStyles = makeStyles({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    backgroundColor: tokens.colorNeutralBackground2,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.colorNeutralStroke2,
    '@media (max-width: 768px)': {
      padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    },
  },
  title: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    margin: 0,
    '@media (max-width: 768px)': {
      fontSize: tokens.fontSizeBase300,
    },
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    '@media (max-width: 768px)': {
      gap: tokens.spacingHorizontalS,
    },
  },
  userName: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    '@media (max-width: 480px)': {
      display: 'none', // Hide username on very small screens
    },
  },
});

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const styles = useStyles();

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Microsoft Prototype Gallery</h1>
      <div className={styles.userSection}>
        <Person24Regular />
        <span className={styles.userName}>{user?.name}</span>
        <Button
          appearance="subtle"
          icon={<SignOut24Regular />}
          onClick={logout}
        >
          Sign out
        </Button>
      </div>
    </header>
  );
};

export default Header;