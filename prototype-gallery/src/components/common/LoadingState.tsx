import React from 'react';
import { makeStyles, tokens, Skeleton, SkeletonItem } from '@fluentui/react-components';

const useStyles = makeStyles({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: tokens.spacingVerticalL,
    padding: `${tokens.spacingVerticalM} 0`,
  },
  card: {
    padding: tokens.spacingVerticalM,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  preview: {
    marginBottom: tokens.spacingVerticalM,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  '@media (max-width: 768px)': {
    gridTemplateColumns: '1fr',
    gap: tokens.spacingVerticalM,
  },
});

interface LoadingStateProps {
  count?: number;
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ count = 6 }) => {
  const styles = useStyles();

  return (
    <div className={styles.grid}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={styles.card}>
          <Skeleton className={styles.preview}>
            <SkeletonItem style={{ height: '160px', width: '100%' }} />
          </Skeleton>
          <div className={styles.content}>
            <Skeleton>
              <SkeletonItem style={{ height: '16px', width: '80%' }} />
            </Skeleton>
            <Skeleton>
              <SkeletonItem style={{ height: '12px', width: '60%' }} />
            </Skeleton>
            <Skeleton>
              <SkeletonItem style={{ height: '14px', width: '90%' }} />
            </Skeleton>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingState;