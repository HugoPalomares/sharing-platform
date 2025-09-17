import React from 'react';
import { 
  Dropdown, 
  Option, 
  Button, 
  makeStyles, 
  tokens,
  Text 
} from '@fluentui/react-components';
import { Filter24Regular, Dismiss24Regular } from '@fluentui/react-icons';
import { SearchState } from '../../types/prototype';
import { mockUsers } from '../../data/mockUsers';

const useStyles = makeStyles({
  filterPanel: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalM,
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  filterLabel: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    whiteSpace: 'nowrap',
  },
  dropdown: {
    minWidth: '140px',
  },
  clearButton: {
    minWidth: 'auto',
  },
  '@media (max-width: 768px)': {
    filterPanel: {
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: tokens.spacingVerticalS,
    },
    filterGroup: {
      justifyContent: 'space-between',
    },
  },
});

interface FilterPanelProps {
  filters: SearchState['filters'];
  onFilterChange: (key: keyof SearchState['filters'], value: any) => void;
  onClearFilters: () => void;
}

const productAreas = [
  'Azure',
  'Microsoft 365', 
  'Power Platform',
  'Developer Tools',
  'Dynamics 365',
  'Gaming',
  'Edge',
  'Microsoft Fabric',
  'Security'
];

const recencyOptions = [
  { key: 'week', text: 'Past week' },
  { key: 'month', text: 'Past month' },
  { key: 'quarter', text: 'Past quarter' },
  { key: 'year', text: 'Past year' },
];

const FilterPanel: React.FC<FilterPanelProps> = ({ 
  filters, 
  onFilterChange, 
  onClearFilters 
}) => {
  const styles = useStyles();
  
  const hasActiveFilters = Object.values(filters).some(filter => 
    filter !== undefined && filter !== null && 
    (Array.isArray(filter) ? filter.length > 0 : true)
  );

  return (
    <div className={styles.filterPanel}>
      <div className={styles.filterGroup}>
        <Filter24Regular />
        <Text className={styles.filterLabel}>Filters:</Text>
      </div>

      <div className={styles.filterGroup}>
        <Text className={styles.filterLabel}>Product Area</Text>
        <Dropdown
          className={styles.dropdown}
          placeholder="All areas"
          value={filters.productArea || ''}
          selectedOptions={filters.productArea ? [filters.productArea] : []}
          onOptionSelect={(_, data) => 
            onFilterChange('productArea', data.optionValue || undefined)
          }
        >
          <Option value="">All areas</Option>
          {productAreas.map(area => (
            <Option key={area} value={area}>{area}</Option>
          ))}
        </Dropdown>
      </div>

      <div className={styles.filterGroup}>
        <Text className={styles.filterLabel}>Author</Text>
        <Dropdown
          className={styles.dropdown}
          placeholder="All authors"
          value={filters.author || ''}
          selectedOptions={filters.author ? [filters.author] : []}
          onOptionSelect={(_, data) => 
            onFilterChange('author', data.optionValue || undefined)
          }
        >
          <Option value="">All authors</Option>
          {mockUsers.map(user => (
            <Option key={user.id} value={user.name}>{user.name}</Option>
          ))}
        </Dropdown>
      </div>

      <div className={styles.filterGroup}>
        <Text className={styles.filterLabel}>Updated</Text>
        <Dropdown
          className={styles.dropdown}
          placeholder="Anytime"
          value={filters.recency || ''}
          selectedOptions={filters.recency ? [filters.recency] : []}
          onOptionSelect={(_, data) => 
            onFilterChange('recency', data.optionValue || undefined)
          }
        >
          <Option value="">Anytime</Option>
          {recencyOptions.map(option => (
            <Option key={option.key} value={option.key}>{option.text}</Option>
          ))}
        </Dropdown>
      </div>

      {hasActiveFilters && (
        <Button
          className={styles.clearButton}
          appearance="subtle"
          size="small"
          icon={<Dismiss24Regular />}
          onClick={onClearFilters}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
};

export default FilterPanel;