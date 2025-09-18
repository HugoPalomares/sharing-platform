import React, { useMemo } from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';
import SectionTabs from '../components/common/SectionTabs';
import SearchBar from '../components/common/SearchBar';
import EnhancedPrototypeGrid from '../components/gallery/EnhancedPrototypeGrid';
import { getUserPrototypes } from '../data/mockPrototypes';
import { useAuth } from '../contexts/AuthContext';
import { useSearch } from '../hooks/useSearch';
import { usePrototypes } from '../hooks/usePrototypes';

const useStyles = makeStyles({
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: tokens.spacingHorizontalL,
    '@media (max-width: 768px)': {
      padding: tokens.spacingHorizontalM,
    },
  },
  content: {
    flex: 1,
    overflow: 'auto',
    paddingTop: tokens.spacingVerticalM,
    '@media (max-width: 768px)': {
      paddingTop: tokens.spacingVerticalS,
    },
  }
});

const MyPrototypes: React.FC = () => {
  const { user } = useAuth();
  const { prototypes: realPrototypes, loading, refetch } = usePrototypes();
  const styles = useStyles();

  // Get mock prototypes for current user
  const userMockPrototypes = user ? getUserPrototypes(user.id) : [];
  
  // Combine and filter prototypes
  const { searchQuery, setSearchQuery } = useSearch([]);
  
  const filteredRealPrototypes = useMemo(() => {
    if (!searchQuery) return realPrototypes;
    
    const lowercaseQuery = searchQuery.toLowerCase();
    return realPrototypes.filter(prototype => 
      prototype.name.toLowerCase().includes(lowercaseQuery) ||
      (prototype.description && prototype.description.toLowerCase().includes(lowercaseQuery)) ||
      prototype.gitHubRepoName.toLowerCase().includes(lowercaseQuery) ||
      prototype.gitHubOwner.toLowerCase().includes(lowercaseQuery)
    );
  }, [realPrototypes, searchQuery]);

  const filteredMockPrototypes = useMemo(() => {
    if (!searchQuery) return userMockPrototypes;
    
    const lowercaseQuery = searchQuery.toLowerCase();
    return userMockPrototypes.filter(prototype => 
      prototype.title.toLowerCase().includes(lowercaseQuery) ||
      prototype.description.toLowerCase().includes(lowercaseQuery) ||
      prototype.author.name.toLowerCase().includes(lowercaseQuery) ||
      prototype.productArea.toLowerCase().includes(lowercaseQuery)
    );
  }, [userMockPrototypes, searchQuery]);

  return (
    <div className={styles.container}>
      <SectionTabs activeSection="my-prototypes" />
      <div className={styles.content}>
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search your prototypes..."
        />
        <EnhancedPrototypeGrid
          title="My Prototypes"
          subtitle="Prototypes you've created and published"
          realPrototypes={filteredRealPrototypes}
          mockPrototypes={filteredMockPrototypes}
          loading={loading}
          showAddButton={true}
          showManagement={true}
          onAddSuccess={refetch}
        />
      </div>
    </div>
  );
};

export default MyPrototypes;