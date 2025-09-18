import React from 'react';
import { makeStyles, tokens, Text } from '@fluentui/react-components';
import { Prototype, RealPrototype } from '../../types/prototype';
import PrototypeCard from './PrototypeCard';
import RealPrototypeCard from './RealPrototypeCard';
import LoadingState from '../common/LoadingState';
import EmptyState from '../common/EmptyState';
import AddPrototypeDialog from '../prototypes/AddPrototypeDialog';

const useStyles = makeStyles({
  container: {
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacingVerticalL,
    '@media (max-width: 768px)': {
      flexDirection: 'column',
      gap: tokens.spacingVerticalM,
      alignItems: 'stretch',
    },
  },
  title: {
    fontSize: tokens.fontSizeHero700,
    fontWeight: tokens.fontWeightSemibold,
    margin: 0,
  },
  subtitle: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground2,
    marginTop: tokens.spacingVerticalXS,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: tokens.spacingVerticalL,
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: tokens.spacingVerticalM,
    },
  },
  section: {
    marginBottom: tokens.spacingVerticalXXL,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacingVerticalL,
  },
  sectionTitle: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
    margin: 0,
  },
  sectionCount: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    marginLeft: tokens.spacingHorizontalS,
  },
});

interface EnhancedPrototypeGridProps {
  title: string;
  subtitle?: string;
  mockPrototypes?: Prototype[];
  realPrototypes?: RealPrototype[];
  loading?: boolean;
  showAddButton?: boolean;
  showManagement?: boolean;
  onAddSuccess?: () => void;
}

const EnhancedPrototypeGrid: React.FC<EnhancedPrototypeGridProps> = ({
  title,
  subtitle,
  mockPrototypes = [],
  realPrototypes = [],
  loading = false,
  showAddButton = false,
  showManagement = false,
  onAddSuccess,
}) => {
  const styles = useStyles();

  const hasRealPrototypes = realPrototypes.length > 0;
  const hasMockPrototypes = mockPrototypes.length > 0;
  const hasAnyPrototypes = hasRealPrototypes || hasMockPrototypes;

  if (loading) {
    return <LoadingState message="Loading prototypes..." />;
  }

  if (!hasAnyPrototypes && !showAddButton) {
    return (
      <EmptyState
        title="No prototypes found"
        description="There are no prototypes to display."
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <Text className={styles.subtitle}>{subtitle}</Text>}
        </div>
        {showAddButton && (
          <AddPrototypeDialog onSuccess={onAddSuccess} />
        )}
      </div>

      {/* Real Prototypes Section */}
      {hasRealPrototypes && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Your Prototypes
              <span className={styles.sectionCount}>({realPrototypes.length})</span>
            </h2>
          </div>
          <div className={styles.grid}>
            {realPrototypes.map((prototype) => (
              <RealPrototypeCard
                key={prototype.id}
                prototype={prototype}
                showManagement={showManagement}
              />
            ))}
          </div>
        </div>
      )}

      {/* Mock Prototypes Section */}
      {hasMockPrototypes && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {hasRealPrototypes ? 'Gallery Examples' : 'Prototypes'}
              <span className={styles.sectionCount}>({mockPrototypes.length})</span>
            </h2>
          </div>
          <div className={styles.grid}>
            {mockPrototypes.map((prototype) => (
              <PrototypeCard
                key={prototype.id}
                prototype={prototype}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state with add button */}
      {!hasAnyPrototypes && showAddButton && (
        <EmptyState
          title="Create your first prototype"
          description="Connect a GitHub repository to publish your React or static site as a live prototype."
          action={<AddPrototypeDialog onSuccess={onAddSuccess} />}
        />
      )}
    </div>
  );
};

export default EnhancedPrototypeGrid;