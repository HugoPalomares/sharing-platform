import { useState, useEffect, useCallback } from 'react';
import { GitHubRepository } from '../types/prototype';
import { githubService } from '../services/githubService';

interface UseGitHubAuthReturn {
  isAuthenticated: boolean;
  repositories: GitHubRepository[];
  loading: boolean;
  error: string | null;
  authenticate: () => Promise<boolean>;
  refreshRepositories: () => Promise<void>;
  validateRepository: (url: string) => Promise<GitHubRepository>;
}

export const useGitHubAuth = (): UseGitHubAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuthStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const authStatus = await githubService.checkAuthStatus();
      setIsAuthenticated(authStatus);
      
      if (authStatus) {
        const repos = await githubService.getRepositories();
        setRepositories(repos);
      }
    } catch (err) {
      setIsAuthenticated(false);
      setRepositories([]);
      console.error('Error checking GitHub auth status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const authenticate = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const success = await githubService.openAuthWindow();
      if (success) {
        setIsAuthenticated(true);
        await refreshRepositories();
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      return false;
    }
  }, []);

  const refreshRepositories = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setError(null);
      const repos = await githubService.getRepositories();
      setRepositories(repos);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch repositories';
      setError(errorMessage);
      console.error('Error fetching repositories:', err);
    }
  }, [isAuthenticated]);

  const validateRepository = useCallback(async (url: string): Promise<GitHubRepository> => {
    try {
      setError(null);
      return await githubService.validateRepository(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate repository';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    isAuthenticated,
    repositories,
    loading,
    error,
    authenticate,
    refreshRepositories,
    validateRepository,
  };
};