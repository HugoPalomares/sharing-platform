import React from 'react';
import { Button } from '@fluentui/react-components';
import { Person24Regular } from '@fluentui/react-icons';
import { useAuth } from '../../contexts/AuthContext';

const LoginButton: React.FC = () => {
  const { login } = useAuth();

  return (
    <Button
      appearance="primary"
      size="large"
      icon={<Person24Regular />}
      onClick={login}
    >
      Sign in with Microsoft
    </Button>
  );
};

export default LoginButton;