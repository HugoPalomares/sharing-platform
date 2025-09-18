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
  message?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  icon?: React.ReactElement;
  type?: 'search' | 'favorites' | 'prototypes' | 'default';
  action?: React.ReactElement;
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
  title,
  subtitle,
  description,
  icon,
  type = 'default',
  action
}) => {
  const styles = useStyles();
  const displayIcon = icon || getIconForType(type);
  const displayTitle = title || message;
  const displayDescription = description || subtitle;

  return (
    <div className={styles.container}>
      <div className={styles.icon}>{displayIcon}</div>
      {displayTitle && <Text className={styles.message}>{displayTitle}</Text>}
      {displayDescription && <Text className={styles.subtitle}>{displayDescription}</Text>}
      {action && <div style={{ marginTop: tokens.spacingVerticalL }}>{action}</div>}
    </div>
  );
};

export default EmptyState;