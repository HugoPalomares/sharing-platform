import { User } from '../types/prototype';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Sarah Chen',
    email: 'sarah.chen@microsoft.com',
    role: 'Senior Product Manager'
  },
  {
    id: 'user-2', 
    name: 'Marcus Johnson',
    email: 'marcus.johnson@microsoft.com',
    role: 'UX Designer'
  },
  {
    id: 'user-3',
    name: 'Elena Rodriguez',
    email: 'elena.rodriguez@microsoft.com', 
    role: 'Program Manager'
  },
  {
    id: 'user-4',
    name: 'David Kim',
    email: 'david.kim@microsoft.com',
    role: 'Principal Designer'
  }
];

export const getCurrentUser = (): User => mockUsers[0]; // Sarah Chen as current user