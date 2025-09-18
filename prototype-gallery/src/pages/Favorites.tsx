import React, { useMemo } from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';
import SectionTabs from '../components/common/SectionTabs';
import SearchBar from '../components/common/SearchBar';
import EnhancedPrototypeGrid from '../components/gallery/EnhancedPrototypeGrid';
import { mockPrototypes } from '../data/mockPrototypes';
import { useFavorites } from '../contexts/FavoritesContext';
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

const Favorites: React.FC = () => {
  const { favorites } = useFavorites();
  const { prototypes: realPrototypes, loading } = usePrototypes();
  const styles = useStyles();

  // Filter mock prototypes by favorites
  const favoriteMockPrototypes = mockPrototypes.filter(prototype => 
    favorites.includes(prototype.id)
  );

  // Filter real prototypes by favorites
  const favoriteRealPrototypes = realPrototypes.filter(prototype => 
    favorites.includes(prototype.id)
  );

  const { searchQuery, setSearchQuery } = useSearch([]);

  // Apply search to both prototype types
  const filteredMockPrototypes = useMemo(() => {
    if (!searchQuery) return favoriteMockPrototypes;
    
    const lowercaseQuery = searchQuery.toLowerCase();
    return favoriteMockPrototypes.filter(prototype => 
      prototype.title.toLowerCase().includes(lowercaseQuery) ||
      prototype.description.toLowerCase().includes(lowercaseQuery) ||
      prototype.author.name.toLowerCase().includes(lowercaseQuery) ||
      prototype.productArea.toLowerCase().includes(lowercaseQuery)
    );
  }, [favoriteMockPrototypes, searchQuery]);

  const filteredRealPrototypes = useMemo(() => {
    if (!searchQuery) return favoriteRealPrototypes;
    
    const lowercaseQuery = searchQuery.toLowerCase();
    return favoriteRealPrototypes.filter(prototype => 
      prototype.name.toLowerCase().includes(lowercaseQuery) ||
      (prototype.description && prototype.description.toLowerCase().includes(lowercaseQuery)) ||
      prototype.gitHubRepoName.toLowerCase().includes(lowercaseQuery) ||
      prototype.gitHubOwner.toLowerCase().includes(lowercaseQuery)
    );
  }, [favoriteRealPrototypes, searchQuery]);

  const totalFavorites = favoriteMockPrototypes.length + favoriteRealPrototypes.length;

  return (
    <div className={styles.container}>
      <SectionTabs activeSection="favorites" />
      <div className={styles.content}>
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search favorite prototypes..."
        />
        <EnhancedPrototypeGrid
          title="Favorite Prototypes"
          subtitle="Prototypes you've bookmarked for quick access"
          realPrototypes={filteredRealPrototypes}
          mockPrototypes={filteredMockPrototypes}
          loading={loading}
          showAddButton={false}
          showManagement={false}
        />
      </div>
    </div>
  );
};

export default Favorites;