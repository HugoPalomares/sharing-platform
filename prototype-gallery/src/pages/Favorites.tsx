import React from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';
import SectionTabs from '../components/common/SectionTabs';
import SearchBar from '../components/common/SearchBar';
import PrototypeGrid from '../components/gallery/PrototypeGrid';
import { mockPrototypes } from '../data/mockPrototypes';
import { useFavorites } from '../contexts/FavoritesContext';
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

const Favorites: React.FC = () => {
  const { favorites } = useFavorites();
  const styles = useStyles();

  const favoritePrototypes = mockPrototypes.filter(prototype => 
    favorites.includes(prototype.id)
  );

  const { searchQuery, setSearchQuery, filteredPrototypes } = useSearch(favoritePrototypes);

  return (
    <div className={styles.container}>
      <SectionTabs activeSection="favorites" />
      <div className={styles.content}>
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search favorite prototypes..."
        />
        <PrototypeGrid 
          prototypes={filteredPrototypes} 
          emptyMessage={favorites.length === 0 ? "No favorite prototypes yet" : "No favorites match your search"}
          emptySubtitle={favorites.length === 0 ? "Heart prototypes to save them for quick access" : "Try adjusting your search terms"}
          emptyType={favorites.length === 0 ? "favorites" : "search"}
        />
      </div>
    </div>
  );
};

export default Favorites;