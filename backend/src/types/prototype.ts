export interface CreatePrototypeRequest {
  name: string;
  description?: string;
  gitHubRepoUrl: string;
}

export interface UpdatePrototypeRequest {
  name?: string;
  description?: string;
}

export interface PrototypeResponse {
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

export interface BuildHistoryResponse {
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