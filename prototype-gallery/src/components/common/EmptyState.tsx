import React from 'react';
import { makeStyles, tokens, Text } from '@fluentui/react-components';
import { DocumentRegular, Heart24Regular, Person24Regular, Search24Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
    textAlign: 'center',
    minHeight: '300px',
  },
  icon: {
    fontSize: '48px',
    color: tokens.colorNeutralForeground3,
    marginBottom: tokens.spacingVerticalL,
  },
  message: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground2,
    maxWidth: '300px',
    lineHeight: tokens.lineHeightBase300,
  },
  subtitle: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    marginTop: tokens.spacingVerticalS,
    maxWidth: '400px',
  },
});

interface EmptyStateProps {
  message: string;
  subtitle?: string;
  icon?: React.ReactElement;
  type?: 'search' | 'favorites' | 'prototypes' | 'default';
}

const getIconForType = (type: EmptyStateProps['type']) => {
  switch (type) {
    case 'search':
      return <Search24Regular />;
    case 'favorites':
      return <Heart24Regular />;
    case 'prototypes':
      return <Person24Regular />;
    default:
      return <DocumentRegular />;
  }
};

const EmptyState: React.FC<EmptyStateProps> = ({ 
  message,
  subtitle,
  icon,
  type = 'default'
}) => {
  const styles = useStyles();
  const displayIcon = icon || getIconForType(type);

  return (
    <div className={styles.container}>
      <div className={styles.icon}>{displayIcon}</div>
      <Text className={styles.message}>{message}</Text>
      {subtitle && <Text className={styles.subtitle}>{subtitle}</Text>}
    </div>
  );
};

export default EmptyState;