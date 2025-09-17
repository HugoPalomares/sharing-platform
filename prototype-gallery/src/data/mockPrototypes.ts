import { Prototype } from '../types/prototype';
import { mockUsers } from './mockUsers';

export const mockPrototypes: Prototype[] = [
  {
    id: 'azure-cost-dashboard',
    title: 'Azure Cost Management Dashboard',
    author: mockUsers[0],
    description: 'Interactive dashboard for enterprise Azure cost tracking with predictive analytics and budget alerts. Features real-time cost visualization and recommendation engine.',
    tags: ['azure', 'dashboard', 'enterprise', 'cost-management'],
    productArea: 'Azure',
    lastUpdated: new Date('2025-09-15'),
    url: 'https://prototype.microsoft.com/azure-cost-dashboard'
  },
  {
    id: 'teams-ai-meeting-assistant',
    title: 'Teams AI Meeting Assistant',
    author: mockUsers[1],
    description: 'AI-powered meeting companion that provides real-time transcription, action item extraction, and follow-up suggestions integrated directly into Teams.',
    tags: ['teams', 'ai', 'meetings', 'productivity'],
    productArea: 'Microsoft 365',
    lastUpdated: new Date('2025-09-12'),
    url: 'https://prototype.microsoft.com/teams-ai-assistant'
  },
  {
    id: 'powerbi-mobile-designer',
    title: 'Power BI Mobile Report Designer',
    author: mockUsers[2],
    description: 'Touch-first report creation experience for Power BI on tablets. Drag-and-drop interface optimized for mobile productivity scenarios.',
    tags: ['powerbi', 'mobile', 'design', 'reports'],
    productArea: 'Power Platform',
    lastUpdated: new Date('2025-09-10'),
    url: 'https://prototype.microsoft.com/powerbi-mobile'
  },
  {
    id: 'vscode-copilot-workspace',
    title: 'VS Code Copilot Workspace',
    author: mockUsers[3],
    description: 'Enhanced VS Code experience with AI workspace understanding. Copilot can now comprehend entire project context for better code suggestions.',
    tags: ['vscode', 'copilot', 'ai', 'development'],
    productArea: 'Developer Tools',
    lastUpdated: new Date('2025-09-08'),
    url: 'https://prototype.microsoft.com/vscode-workspace'
  },
  {
    id: 'dynamics-customer-insights',
    title: 'Dynamics Customer 360 View',
    author: mockUsers[0],
    description: 'Unified customer profile aggregating data from multiple Dynamics applications with predictive customer lifetime value scoring.',
    tags: ['dynamics', 'customer', 'insights', 'crm'],
    productArea: 'Dynamics 365',
    lastUpdated: new Date('2025-09-05'),
    url: 'https://prototype.microsoft.com/dynamics-customer360'
  },
  {
    id: 'sharepoint-knowledge-graph',
    title: 'SharePoint Knowledge Graph Explorer',
    author: mockUsers[1],
    description: 'Interactive knowledge discovery tool that maps content relationships across SharePoint sites using AI-powered content analysis.',
    tags: ['sharepoint', 'knowledge', 'ai', 'content'],
    productArea: 'Microsoft 365',
    lastUpdated: new Date('2025-09-03'),
    url: 'https://prototype.microsoft.com/sharepoint-knowledge'
  },
  {
    id: 'xbox-cloud-streaming',
    title: 'Xbox Cloud Gaming Dashboard',
    author: mockUsers[2],
    description: 'Administrative dashboard for Xbox Cloud Gaming service management. Monitor server performance, user sessions, and game deployment status.',
    tags: ['xbox', 'cloud', 'gaming', 'admin'],
    productArea: 'Gaming',
    lastUpdated: new Date('2025-09-01'),
    url: 'https://prototype.microsoft.com/xbox-cloud-admin'
  },
  {
    id: 'edge-enterprise-policies',
    title: 'Edge Enterprise Policy Manager',
    author: mockUsers[3],
    description: 'Simplified interface for IT administrators to configure and deploy Microsoft Edge policies across enterprise environments.',
    tags: ['edge', 'enterprise', 'policies', 'admin'],
    productArea: 'Edge',
    lastUpdated: new Date('2025-08-28'),
    url: 'https://prototype.microsoft.com/edge-policies'
  },
  {
    id: 'fabric-data-lineage',
    title: 'Microsoft Fabric Data Lineage Viewer',
    author: mockUsers[0],
    description: 'Visual data lineage tracking across Microsoft Fabric workspaces. Interactive graph showing data flow from sources to reports.',
    tags: ['fabric', 'data', 'lineage', 'analytics'],
    productArea: 'Microsoft Fabric',
    lastUpdated: new Date('2025-08-25'),
    url: 'https://prototype.microsoft.com/fabric-lineage'
  },
  {
    id: 'copilot-studio-templates',
    title: 'Copilot Studio Template Gallery',
    author: mockUsers[1],
    description: 'Curated collection of Copilot Studio templates for common business scenarios with one-click deployment and customization.',
    tags: ['copilot', 'studio', 'templates', 'automation'],
    productArea: 'Power Platform',
    lastUpdated: new Date('2025-08-22'),
    url: 'https://prototype.microsoft.com/copilot-templates'
  },
  {
    id: 'intune-device-insights',
    title: 'Intune Device Health Insights',
    author: mockUsers[2],
    description: 'Predictive device health monitoring for Intune-managed devices. Early warning system for hardware failures and security vulnerabilities.',
    tags: ['intune', 'device', 'health', 'security'],
    productArea: 'Security',
    lastUpdated: new Date('2025-08-20'),
    url: 'https://prototype.microsoft.com/intune-insights'
  },
  {
    id: 'outlook-smart-scheduling',
    title: 'Outlook Smart Scheduling Assistant',
    author: mockUsers[3],
    description: 'AI-powered meeting scheduling that considers attendee preferences, time zones, and workload to suggest optimal meeting times.',
    tags: ['outlook', 'scheduling', 'ai', 'meetings'],
    productArea: 'Microsoft 365',
    lastUpdated: new Date('2025-08-18'),
    url: 'https://prototype.microsoft.com/outlook-scheduling'
  },
  {
    id: 'azure-security-dashboard',
    title: 'Azure Security Center Unified Dashboard',
    author: mockUsers[0],
    description: 'Consolidated security posture view across all Azure resources with threat intelligence integration and automated response recommendations.',
    tags: ['azure', 'security', 'dashboard', 'threats'],
    productArea: 'Security',
    lastUpdated: new Date('2025-08-15'),
    url: 'https://prototype.microsoft.com/azure-security'
  },
  {
    id: 'onenote-research-assistant',
    title: 'OneNote Research Assistant',
    author: mockUsers[1],
    description: 'AI research companion for OneNote that suggests relevant sources, creates citations, and helps organize research notes automatically.',
    tags: ['onenote', 'research', 'ai', 'productivity'],
    productArea: 'Microsoft 365',
    lastUpdated: new Date('2025-08-12'),
    url: 'https://prototype.microsoft.com/onenote-research'
  },
  {
    id: 'loop-project-canvas',
    title: 'Microsoft Loop Project Canvas',
    author: mockUsers[2],
    description: 'Visual project planning workspace in Loop that connects tasks, timelines, and team members in an interactive canvas format.',
    tags: ['loop', 'project', 'canvas', 'collaboration'],
    productArea: 'Microsoft 365',
    lastUpdated: new Date('2025-08-10'),
    url: 'https://prototype.microsoft.com/loop-canvas'
  }
];

export const getUserPrototypes = (userId: string): Prototype[] => {
  return mockPrototypes.filter(prototype => prototype.author.id === userId);
};

export const getPrototypesByProductArea = (productArea: string): Prototype[] => {
  return mockPrototypes.filter(prototype => prototype.productArea === productArea);
};

export const searchPrototypes = (query: string): Prototype[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockPrototypes.filter(prototype => 
    prototype.title.toLowerCase().includes(lowercaseQuery) ||
    prototype.description.toLowerCase().includes(lowercaseQuery) ||
    prototype.author.name.toLowerCase().includes(lowercaseQuery) ||
    prototype.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};