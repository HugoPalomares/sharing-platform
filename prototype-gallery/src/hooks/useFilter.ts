import { useState, useMemo } from 'react';
import { Prototype, SearchState } from '../types/prototype';

export const useFilter = (prototypes: Prototype[]) => {
  const [filters, setFilters] = useState<SearchState['filters']>({});

  const filteredPrototypes = useMemo(() => {
    let result = prototypes;

    // Filter by product area
    if (filters.productArea) {
      result = result.filter(prototype => 
        prototype.productArea === filters.productArea
      );
    }

    // Filter by author
    if (filters.author) {
      result = result.filter(prototype => 
        prototype.author.name === filters.author
      );
    }

    // Note: Tag filtering removed - focusing on author filtering instead

    // Filter by recency
    if (filters.recency) {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (filters.recency) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      result = result.filter(prototype => 
        new Date(prototype.lastUpdated) >= cutoffDate
      );
    }

    return result;
  }, [prototypes, filters]);

  const updateFilter = (key: keyof SearchState['filters'], value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  return {
    filters,
    filteredPrototypes,
    updateFilter,
    clearFilters,
  };
};