import React, { useState } from 'react';
import { Button, Text, makeStyles, tokens } from '@fluentui/react-components';
import { Branch24Regular } from '@fluentui/react-icons';
import { useGitHubAuth } from '../../hooks/useGitHubAuth';

const useStyles = makeStyles({
  authButton: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  statusText: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    marginLeft: tokens.spacingHorizontalS,
  },
});

interface GitHubAuthButtonProps {
  onAuthSuccess?: () => void;
  size?: 'small' | 'medium' | 'large';
  appearance?: 'primary' | 'secondary' | 'outline' | 'subtle' | 'transparent';
}

const GitHubAuthButton: React.FC<GitHubAuthButtonProps> = ({
  onAuthSuccess,
  size = 'medium',
  appearance = 'outline',
}) => {
  const { isAuthenticated, authenticate, loading } = useGitHubAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const styles = useStyles();

  const handleAuth = async () => {
    if (isAuthenticated) return;
    
    try {
      setIsAuthenticating(true);
      const success = await authenticate();
      if (success && onAuthSuccess) {
        onAuthSuccess();
      }
    } catch (error) {
      console.error('Authentication failed:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (loading) {
    return (
      <Button
        size={size}
        appearance="subtle"
        disabled
        icon={<Branch24Regular />}
      >
        Checking GitHub connection...
      </Button>
    );
  }

  if (isAuthenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button
          size={size}
          appearance="subtle"
          disabled
          icon={<Branch24Regular />}
          className={styles.authButton}
        >
          GitHub Connected
        </Button>
      </div>
    );
  }

  return (
    <Button
      size={size}
      appearance={appearance}
      icon={<Branch24Regular />}
      onClick={handleAuth}
      disabled={isAuthenticating}
      className={styles.authButton}
    >
      {isAuthenticating ? 'Connecting to GitHub...' : 'Connect GitHub'}
    </Button>
  );
};

export default GitHubAuthButton;