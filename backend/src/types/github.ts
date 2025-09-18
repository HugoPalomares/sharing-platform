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

export interface GitHubOAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface GitHubWebhookPayload {
  action?: string;
  repository: {
    id: number;
    name: string;
    fullName: string;
    owner: {
      login: string;
    };
  };
  pusher?: {
    name: string;
    email: string;
  };
  commits?: Array<{
    id: string;
    message: string;
    timestamp: string;
    url: string;
    author: {
      name: string;
      email: string;
    };
  }>;
}

export interface GitHubAuthResponse {
  authUrl: string;
  state: string;
}