import { Prototype, User } from '../types/prototype';
import { mockPrototypes, getUserPrototypes } from '../data/mockPrototypes';
import { mockUsers } from '../data/mockUsers';

// Simulate network delay
const delay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // Get all prototypes
  getAllPrototypes: async (): Promise<Prototype[]> => {
    await delay();
    return mockPrototypes;
  },

  // Get user's prototypes
  getUserPrototypes: async (userId: string): Promise<Prototype[]> => {
    await delay(600);
    return getUserPrototypes(userId);
  },

  // Get favorite prototypes
  getFavoritePrototypes: async (favoriteIds: string[]): Promise<Prototype[]> => {
    await delay(500);
    return mockPrototypes.filter(prototype => favoriteIds.includes(prototype.id));
  },

  // Search prototypes
  searchPrototypes: async (query: string): Promise<Prototype[]> => {
    await delay(400);
    const lowercaseQuery = query.toLowerCase();
    return mockPrototypes.filter(prototype => 
      prototype.title.toLowerCase().includes(lowercaseQuery) ||
      prototype.description.toLowerCase().includes(lowercaseQuery) ||
      prototype.author.name.toLowerCase().includes(lowercaseQuery) ||
      prototype.productArea.toLowerCase().includes(lowercaseQuery)
    );
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    await delay(300);
    return mockUsers[0]; // Sarah Chen
  },
};