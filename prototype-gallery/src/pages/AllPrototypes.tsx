import React from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';
import SectionTabs from '../components/common/SectionTabs';
import SearchBar from '../components/common/SearchBar';
import FilterPanel from '../components/common/FilterPanel';
import PrototypeGrid from '../components/gallery/PrototypeGrid';
import { mockPrototypes } from '../data/mockPrototypes';
import { useSearch } from '../hooks/useSearch';
import { useFilter } from '../hooks/useFilter';

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
  const styles = useStyles();
  
  // Apply filters first, then search
  const { filters, filteredPrototypes: filteredByFilters, updateFilter, clearFilters } = useFilter(mockPrototypes);
  const { searchQuery, setSearchQuery, filteredPrototypes: finalPrototypes } = useSearch(filteredByFilters);

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
        <PrototypeGrid 
          prototypes={finalPrototypes} 
          emptyMessage="No prototypes match your search criteria"
          emptySubtitle="Try adjusting your search terms or filters"
          emptyType="search"
        />
      </div>
    </div>
  );
};

export default AllPrototypes;