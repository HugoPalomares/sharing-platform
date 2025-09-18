import React, { useMemo } from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';
import SectionTabs from '../components/common/SectionTabs';
import SearchBar from '../components/common/SearchBar';
import FilterPanel from '../components/common/FilterPanel';
import EnhancedPrototypeGrid from '../components/gallery/EnhancedPrototypeGrid';
import { mockPrototypes } from '../data/mockPrototypes';
import { useSearch } from '../hooks/useSearch';
import { useFilter } from '../hooks/useFilter';
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

const AllPrototypes: React.FC = () => {
  const { prototypes: realPrototypes, loading } = usePrototypes();
  const styles = useStyles();
  
  // Apply filters to mock prototypes first, then search
  const { filters, filteredPrototypes: filteredMockByFilters, updateFilter, clearFilters } = useFilter(mockPrototypes);
  const { searchQuery, setSearchQuery, filteredPrototypes: finalMockPrototypes } = useSearch(filteredMockByFilters);

  // Filter real prototypes based on search query
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

  return (
    <div className={styles.container}>
      <SectionTabs activeSection="all" />
      <div className={styles.content}>
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search all prototypes..."
        />
        <FilterPanel 
          filters={filters}
          onFilterChange={updateFilter}
          onClearFilters={clearFilters}
        />
        <EnhancedPrototypeGrid
          title="All Prototypes"
          subtitle="Discover prototypes from the community"
          realPrototypes={filteredRealPrototypes}
          mockPrototypes={finalMockPrototypes}
          loading={loading}
          showAddButton={false}
          showManagement={false}
        />
      </div>
    </div>
  );
};

export default AllPrototypes;