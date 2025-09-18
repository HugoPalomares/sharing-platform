import { useState, useEffect, useCallback } from 'react';
import { RealPrototype, CreatePrototypeRequest, UpdatePrototypeRequest } from '../types/prototype';
import { prototypeService } from '../services/prototypeService';

interface UsePrototypesReturn {
  prototypes: RealPrototype[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createPrototype: (request: CreatePrototypeRequest) => Promise<RealPrototype>;
  updatePrototype: (id: string, request: UpdatePrototypeRequest) => Promise<RealPrototype>;
  deletePrototype: (id: string) => Promise<void>;
  rebuildPrototype: (id: string) => Promise<void>;
}

export const usePrototypes = (): UsePrototypesReturn => {
  const [prototypes, setPrototypes] = useState<RealPrototype[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrototypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await prototypeService.getPrototypes();
      setPrototypes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prototypes');
      console.error('Error fetching prototypes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPrototype = useCallback(async (request: CreatePrototypeRequest): Promise<RealPrototype> => {
    try {
      setError(null);
      const newPrototype = await prototypeService.createPrototype(request);
      setPrototypes(prev => [newPrototype, ...prev]);
      return newPrototype;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create prototype';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updatePrototype = useCallback(async (id: string, request: UpdatePrototypeRequest): Promise<RealPrototype> => {
    try {
      setError(null);
      const updatedPrototype = await prototypeService.updatePrototype(id, request);
      setPrototypes(prev => prev.map(p => p.id === id ? updatedPrototype : p));
      return updatedPrototype;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update prototype';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deletePrototype = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await prototypeService.deletePrototype(id);
      setPrototypes(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete prototype';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const rebuildPrototype = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await prototypeService.rebuildPrototype(id);
      // Update the prototype status to 'building'
      setPrototypes(prev => prev.map(p => 
        p.id === id ? { ...p, buildStatus: 'building' as const } : p
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to rebuild prototype';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPrototypes();
  }, [fetchPrototypes]);

  return {
    prototypes,
    loading,
    error,
    refetch: fetchPrototypes,
    createPrototype,
    updatePrototype,
    deletePrototype,
    rebuildPrototype,
  };
};