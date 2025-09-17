// Extensible prototype data models for future configuration features

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

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