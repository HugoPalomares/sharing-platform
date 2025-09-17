import React from 'react';
import { SearchBox, makeStyles, tokens } from '@fluentui/react-components';
import { Search24Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  searchContainer: {
    marginBottom: tokens.spacingVerticalM,
    maxWidth: '400px',
  },
  searchBox: {
    width: '100%',
  },
});

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onChange, 
  placeholder = "Search prototypes..." 
}) => {
  const styles = useStyles();

  return (
    <div className={styles.searchContainer}>
      <SearchBox
        className={styles.searchBox}
        placeholder={placeholder}
        value={value}
        onChange={(_, data) => onChange(data.value)}
        contentBefore={<Search24Regular />}
        size="large"
      />
    </div>
  );
};

export default SearchBar;