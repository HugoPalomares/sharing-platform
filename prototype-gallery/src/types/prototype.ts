// Extensible prototype data models for future configuration features

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

// Mock prototype interface (for backward compatibility)
export interface Prototype {
  id: string;
  title: string;
  author: User;
  description: string;
  tags: string[];
  productArea: string;
  lastUpdated: Date;
  previewImage?: string;
  url: string;
  
  // Future Phase 6 fields (ignored in Phase 1)
  knobs?: KnobDefinition[];
  scenarios?: Scenario[];
  configurable?: boolean;
}

// Real prototype interface from backend API
export interface RealPrototype {
  id: string;
  name: string;
  description?: string;
  gitHubRepoUrl: string;
  gitHubRepoName: string;
  gitHubOwner: string;
  createdBy: string;
  createdAt: Date;
  lastUpdated: Date;
  lastDeployedAt?: Date;
  isActive: boolean;
  buildStatus: 'pending' | 'building' | 'success' | 'failed';
  buildErrorMessage?: string;
  prototypeUrl?: string;
}

// GitHub types for API integration
export interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  description?: string;
  private: boolean;
  htmlUrl: string;
  cloneUrl: string;
  defaultBranch: string;
  owner: {
    login: string;
    id: number;
    avatarUrl: string;
  };
}

export interface GitHubAuthResponse {
  authUrl: string;
  state: string;
}

// Build history for debugging
export interface BuildHistory {
  id: string;
  prototypeId: string;
  gitCommitSha?: string;
  gitCommitMessage?: string;
  buildStatus: 'started' | 'success' | 'failed';
  buildStartedAt: Date;
  buildCompletedAt?: Date;
  buildDurationMs?: number;
  buildLogs?: string;
  errorMessage?: string;
}

// Create prototype request
export interface CreatePrototypeRequest {
  name: string;
  description?: string;
  gitHubRepoUrl: string;
}

// Update prototype request
export interface UpdatePrototypeRequest {
  name?: string;
  description?: string;
}

// Future Phase 6 configuration types
export interface KnobDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  defaultValue: any;
  options?: any[];
  description?: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  knobValues: Record<string, any>;
  createdBy: string;
  shared: boolean;
}

// UI state types
export interface SearchState {
  query: string;
  filters: {
    productArea?: string;
    author?: string;
    recency?: 'week' | 'month' | 'quarter' | 'year';
  };
}

export interface GallerySection {
  key: 'favorites' | 'my-prototypes' | 'all';
  title: string;
  path: string;
}