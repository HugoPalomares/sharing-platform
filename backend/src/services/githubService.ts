import { Octokit } from '@octokit/rest';
import axios from 'axios';
import { prisma } from './database';
import { GitHubRepository, GitHubOAuthTokens } from '../types/github';

export class GitHubService {
  private clientId: string;
  private appId: string;
  private privateKey: string;

  constructor() {
    this.clientId = process.env.GITHUB_CLIENT_ID || '';
    this.appId = process.env.GITHUB_APP_ID || '';
    this.privateKey = process.env.GITHUB_PRIVATE_KEY || '';
    
    if (!this.clientId || !this.appId || !this.privateKey) {
      console.warn('GitHub App credentials not fully configured');
      console.warn(`Client ID: ${this.clientId ? 'configured' : 'missing'}`);
      console.warn(`App ID: ${this.appId ? 'configured' : 'missing'}`);
      console.warn(`Private Key: ${this.privateKey ? 'configured' : 'missing'}`);
    }

    console.log('✅ GitHub App initialized successfully');
  }

  generateAuthUrl(state: string): string {
    // For GitHub Apps, users can install the app or we can use device flow
    // For now, let's use the app installation flow
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/github/auth/callback`,
      state,
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<GitHubOAuthTokens> {
    try {
      // For GitHub Apps, we need to use the Web Application Flow with client_secret
      const clientSecret = process.env.GITHUB_CLIENT_SECRET || 'not_needed_for_github_apps';
      const response = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: this.clientId,
          client_secret: clientSecret,
          code,
        },
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );

      const { access_token, refresh_token, expires_in } = response.data;

      if (!access_token) {
        console.error('GitHub OAuth response:', response.data);
        throw new Error('Failed to get access token from GitHub');
      }

      console.log('✅ Successfully exchanged code for GitHub access token');

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: expires_in ? new Date(Date.now() + expires_in * 1000) : undefined,
      };
    } catch (error: any) {
      console.error('GitHub OAuth token exchange failed:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with GitHub');
    }
  }

  async getUserRepositories(accessToken: string): Promise<GitHubRepository[]> {
    try {
      const octokit = new Octokit({
        auth: accessToken,
      });

      const { data } = await octokit.rest.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 100,
      });

      return data.map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description || undefined,
        private: repo.private,
        htmlUrl: repo.html_url,
        cloneUrl: repo.clone_url,
        defaultBranch: repo.default_branch,
        owner: {
          login: repo.owner!.login,
          id: repo.owner!.id,
          avatarUrl: repo.owner!.avatar_url,
        },
      }));
    } catch (error: any) {
      console.error('Failed to fetch GitHub repositories:', error);
      throw new Error('Failed to fetch repositories from GitHub');
    }
  }

  async getRepositoryInfo(owner: string, repo: string, accessToken?: string): Promise<GitHubRepository> {
    try {
      const octokit = new Octokit(accessToken ? { auth: accessToken } : {});

      const { data } = await octokit.rest.repos.get({
        owner,
        repo,
      });

      return {
        id: data.id,
        name: data.name,
        fullName: data.full_name,
        description: data.description || undefined,
        private: data.private,
        htmlUrl: data.html_url,
        cloneUrl: data.clone_url,
        defaultBranch: data.default_branch,
        owner: {
          login: data.owner!.login,
          id: data.owner!.id,
          avatarUrl: data.owner!.avatar_url,
        },
      };
    } catch (error: any) {
      console.error(`Failed to fetch repository ${owner}/${repo}:`, error);
      throw new Error(`Repository ${owner}/${repo} not found or not accessible`);
    }
  }

  async createWebhook(owner: string, repo: string, accessToken: string): Promise<number> {
    try {
      const octokit = new Octokit({
        auth: accessToken,
      });

      const webhookUrl = `${process.env.FRONTEND_URL}/api/github/webhook`;
      const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

      const { data } = await octokit.rest.repos.createWebhook({
        owner,
        repo,
        config: {
          url: webhookUrl,
          content_type: 'json',
          secret: webhookSecret,
        },
        events: ['push', 'repository'],
        active: true,
      });

      return data.id;
    } catch (error: any) {
      console.error(`Failed to create webhook for ${owner}/${repo}:`, error);
      throw new Error('Failed to create GitHub webhook');
    }
  }

  async deleteWebhook(owner: string, repo: string, webhookId: number, accessToken: string): Promise<void> {
    try {
      const octokit = new Octokit({
        auth: accessToken,
      });

      await octokit.rest.repos.deleteWebhook({
        owner,
        repo,
        hook_id: webhookId,
      });
    } catch (error: any) {
      console.error(`Failed to delete webhook ${webhookId} for ${owner}/${repo}:`, error);
      // Don't throw here as this is cleanup
    }
  }

  async storeGitHubIntegration(
    prototypeId: string,
    tokens: GitHubOAuthTokens,
    webhookId?: number,
    installationId?: number
  ): Promise<void> {
    await prisma.gitHubIntegration.upsert({
      where: { prototypeId },
      create: {
        prototypeId,
        accessToken: tokens.accessToken, // TODO: Encrypt in production
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokens.expiresAt,
        webhookId: webhookId || null,
        gitHubInstallationId: installationId || null,
        lastSyncAt: new Date(),
      },
      update: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokens.expiresAt,
        webhookId: webhookId || undefined,
        gitHubInstallationId: installationId || undefined,
        lastSyncAt: new Date(),
      },
    });
  }

  async getGitHubIntegration(prototypeId: string) {
    return await prisma.gitHubIntegration.findUnique({
      where: { prototypeId },
    });
  }
}