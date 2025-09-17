import React from 'react';
import { makeStyles, tokens, Text } from '@fluentui/react-components';
import { Prototype } from '../../types/prototype';
import PrototypeCard from './PrototypeCard';
import EmptyState from '../common/EmptyState';

const useStyles = makeStyles({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: tokens.spacingVerticalL,
    padding: `${tokens.spacingVerticalM} 0`,
  },
  '@media (max-width: 768px)': {
    grid: {
      gridTemplateColumns: '1fr',
      gap: tokens.spacingVerticalM,
    } as any,
  } as any,
});

interface PrototypeGridProps {
  prototypes: Prototype[];
  emptyMessage?: string;
  emptySubtitle?: string;
  emptyType?: 'search' | 'favorites' | 'prototypes' | 'default';
}

const PrototypeGrid: React.FC<PrototypeGridProps> = ({ 
  prototypes, 
  emptyMessage = "No prototypes found",
  emptySubtitle,
  emptyType = 'default'
}) => {
  const styles = useStyles();

  if (prototypes.length === 0) {
    return (
      <EmptyState 
        message={emptyMessage} 
        subtitle={emptySubtitle}
        type={emptyType}
      />
    );
  }

  return (
    <div className={styles.grid}>
      {prototypes.map(prototype => (
        <PrototypeCard key={prototype.id} prototype={prototype} />
      ))}
    </div>
  );
};

export default PrototypeGrid;