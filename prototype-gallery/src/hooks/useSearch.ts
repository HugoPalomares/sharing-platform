import { useState, useMemo } from 'react';
import { Prototype } from '../types/prototype';

export const useSearch = (prototypes: Prototype[]) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPrototypes = useMemo(() => {
    if (!searchQuery.trim()) {
      return prototypes;
    }

    const query = searchQuery.toLowerCase();
    return prototypes.filter(prototype => 
      prototype.title.toLowerCase().includes(query) ||
      prototype.description.toLowerCase().includes(query) ||
      prototype.author.name.toLowerCase().includes(query) ||
      prototype.productArea.toLowerCase().includes(query)
    );
  }, [prototypes, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredPrototypes,
  };
};