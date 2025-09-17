import React from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';
import SectionTabs from '../components/common/SectionTabs';
import SearchBar from '../components/common/SearchBar';
import PrototypeGrid from '../components/gallery/PrototypeGrid';
import { getUserPrototypes } from '../data/mockPrototypes';
import { useAuth } from '../contexts/AuthContext';
import { useSearch } from '../hooks/useSearch';

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
  const styles = useStyles();

  const userPrototypes = user ? getUserPrototypes(user.id) : [];
  const { searchQuery, setSearchQuery, filteredPrototypes } = useSearch(userPrototypes);

  return (
    <div className={styles.container}>
      <SectionTabs activeSection="my-prototypes" />
      <div className={styles.content}>
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search your prototypes..."
        />
        <PrototypeGrid 
          prototypes={filteredPrototypes} 
          emptyMessage={userPrototypes.length === 0 ? "No prototypes created yet" : "No prototypes match your search"}
          emptySubtitle={userPrototypes.length === 0 ? "Start creating prototypes to see them here" : "Try adjusting your search terms"}
          emptyType={userPrototypes.length === 0 ? "prototypes" : "search"}
        />
      </div>
    </div>
  );
};

export default MyPrototypes;