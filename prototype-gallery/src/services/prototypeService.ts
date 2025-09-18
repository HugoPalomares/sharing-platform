import { 
  RealPrototype, 
  CreatePrototypeRequest, 
  UpdatePrototypeRequest,
  BuildHistory 
} from '../types/prototype';

const API_BASE_URL = 'http://localhost:3001/api';

class PrototypeService {
  // Get all prototypes for the current user
  async getPrototypes(): Promise<RealPrototype[]> {
    const response = await fetch(`${API_BASE_URL}/prototypes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch prototypes: ${response.statusText}`);
    }

    const data = await response.json();
    return data.map((prototype: any) => ({
      ...prototype,
      createdAt: new Date(prototype.createdAt),
      lastUpdated: new Date(prototype.lastUpdated),
      lastDeployedAt: prototype.lastDeployedAt ? new Date(prototype.lastDeployedAt) : undefined,
    }));
  }

  // Get a specific prototype by ID
  async getPrototype(id: string): Promise<RealPrototype> {
    const response = await fetch(`${API_BASE_URL}/prototypes/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch prototype: ${response.statusText}`);
    }

    const prototype = await response.json();
    return {
      ...prototype,
      createdAt: new Date(prototype.createdAt),
      lastUpdated: new Date(prototype.lastUpdated),
      lastDeployedAt: prototype.lastDeployedAt ? new Date(prototype.lastDeployedAt) : undefined,
    };
  }

  // Create a new prototype from GitHub repository
  async createPrototype(request: CreatePrototypeRequest): Promise<RealPrototype> {
    const response = await fetch(`${API_BASE_URL}/prototypes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create prototype: ${response.statusText}`);
    }

    const prototype = await response.json();
    return {
      ...prototype,
      createdAt: new Date(prototype.createdAt),
      lastUpdated: new Date(prototype.lastUpdated),
      lastDeployedAt: prototype.lastDeployedAt ? new Date(prototype.lastDeployedAt) : undefined,
    };
  }

  // Update an existing prototype
  async updatePrototype(id: string, request: UpdatePrototypeRequest): Promise<RealPrototype> {
    const response = await fetch(`${API_BASE_URL}/prototypes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update prototype: ${response.statusText}`);
    }

    const prototype = await response.json();
    return {
      ...prototype,
      createdAt: new Date(prototype.createdAt),
      lastUpdated: new Date(prototype.lastUpdated),
      lastDeployedAt: prototype.lastDeployedAt ? new Date(prototype.lastDeployedAt) : undefined,
    };
  }

  // Delete a prototype
  async deletePrototype(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/prototypes/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete prototype: ${response.statusText}`);
    }
  }

  // Trigger a manual rebuild of a prototype
  async rebuildPrototype(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/prototypes/${id}/rebuild`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to rebuild prototype: ${response.statusText}`);
    }
  }

  // Get build history for a prototype
  async getBuildHistory(prototypeId: string): Promise<BuildHistory[]> {
    const response = await fetch(`${API_BASE_URL}/prototypes/${prototypeId}/builds`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch build history: ${response.statusText}`);
    }

    const builds = await response.json();
    return builds.map((build: any) => ({
      ...build,
      buildStartedAt: new Date(build.buildStartedAt),
      buildCompletedAt: build.buildCompletedAt ? new Date(build.buildCompletedAt) : undefined,
    }));
  }
}

// Export a singleton instance
export const prototypeService = new PrototypeService();