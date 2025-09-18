import React from 'react';
import { Badge, makeStyles, tokens } from '@fluentui/react-components';
import { 
  CheckmarkCircle20Filled,
  Warning20Filled,
  Clock20Regular,
  Building20Regular
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
});

interface BuildStatusBadgeProps {
  status: 'pending' | 'building' | 'success' | 'failed';
  size?: 'small' | 'medium' | 'large';
}

const BuildStatusBadge: React.FC<BuildStatusBadgeProps> = ({ 
  status, 
  size = 'medium' 
}) => {
  const styles = useStyles();

  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          appearance: 'filled' as const,
          color: 'success' as const,
          icon: <CheckmarkCircle20Filled />,
          text: 'Live',
        };
      case 'failed':
        return {
          appearance: 'filled' as const,
          color: 'danger' as const,
          icon: <Warning20Filled />,
          text: 'Failed',
        };
      case 'building':
        return {
          appearance: 'filled' as const,
          color: 'warning' as const,
          icon: <Building20Regular />,
          text: 'Building',
        };
      case 'pending':
      default:
        return {
          appearance: 'outline' as const,
          color: 'subtle' as const,
          icon: <Clock20Regular />,
          text: 'Pending',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge
      className={styles.badge}
      appearance={config.appearance}
      color={config.color}
      size={size}
    >
      {config.icon}
      {config.text}
    </Badge>
  );
};

export default BuildStatusBadge;