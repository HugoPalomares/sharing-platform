import { Request, Response } from 'express';
import crypto from 'crypto';
import { GitHubService } from '../services/githubService';
import { AuthRequest } from '../types/auth';

const githubService = new GitHubService();

export class GitHubController {
  async startOAuth(req: Request, res: Response) {
    try {
      // Generate a random state parameter for security
      const state = crypto.randomBytes(32).toString('hex');
      
      // Store state in session or return it to client to verify later
      // For simplicity, we'll return it to the client
      const authUrl = githubService.generateAuthUrl(state);
      
      res.json({
        authUrl,
        state,
      });
    } catch (error: any) {
      console.error('Error starting GitHub OAuth:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async handleCallback(req: Request, res: Response) {
    try {
      const { code, state } = req.query;

      if (!code) {
        return res.redirect(`${process.env.FRONTEND_URL}?error=authorization_code_missing`);
      }

      // Exchange code for access token
      const tokens = await githubService.exchangeCodeForTokens(code as string);
      
      // Store the token temporarily (in a real app, you'd use secure session storage)
      // For popup OAuth flow, redirect directly to the main app with tokens
      console.log('✅ GitHub OAuth callback successful, redirecting to frontend with tokens');
      console.log('🔗 Frontend URL from env:', process.env.FRONTEND_URL);
      
      const callbackUrl = new URL(`${process.env.FRONTEND_URL}/my-prototypes`);
      callbackUrl.searchParams.set('access_token', tokens.accessToken);
      callbackUrl.searchParams.set('github_auth', 'success');
      callbackUrl.searchParams.set('popup', 'true');
      
      console.log('🎯 Final redirect URL:', callbackUrl.toString());
      console.log('🔑 Access token length:', tokens.accessToken.length);
      
      res.redirect(callbackUrl.toString());
    } catch (error: any) {
      console.error('Error handling GitHub OAuth callback:', error);
      const redirectUrl = new URL(process.env.FRONTEND_URL!);
      redirectUrl.searchParams.set('github_auth', 'error');
      redirectUrl.searchParams.set('error_message', error.message);
      res.redirect(redirectUrl.toString());
    }
  }

  async getRepositories(req: AuthRequest, res: Response) {
    try {
      const accessToken = req.headers['x-github-token'] as string;

      if (!accessToken) {
        return res.status(401).json({ 
          error: 'GitHub access token is required. Please authenticate with GitHub first.',
          requiresAuth: true
        });
      }

      const repositories = await githubService.getUserRepositories(accessToken);
      res.json(repositories);
    } catch (error: any) {
      console.error('Error fetching repositories:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async getRepository(req: Request, res: Response) {
    try {
      const { owner, repo } = req.params;
      const accessToken = req.headers['x-github-token'] as string;

      const repository = await githubService.getRepositoryInfo(owner, repo, accessToken);
      res.json(repository);
    } catch (error: any) {
      console.error('Error fetching repository:', error);
      const status = error.message.includes('not found') ? 404 : 400;
      res.status(status).json({ error: error.message });
    }
  }


  async handleWebhook(req: Request, res: Response) {
    try {
      const signature = req.headers['x-hub-signature-256'] as string;
      const payload = req.body as any;

      // Verify webhook signature
      const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
      if (webhookSecret && signature) {
        const expectedSignature = `sha256=${crypto
          .createHmac('sha256', webhookSecret)
          .update(JSON.stringify(payload))
          .digest('hex')}`;

        if (signature !== expectedSignature) {
          return res.status(401).json({ error: 'Invalid webhook signature' });
        }
      }

      const eventType = req.headers['x-github-event'] as string;
      
      console.log(`Received GitHub webhook: ${eventType}`, {
        repository: payload.repository?.full_name,
        action: payload.action,
      });

      // Handle different webhook events
      switch (eventType) {
        case 'push':
          await this.handlePushEvent(payload);
          break;
        case 'repository':
          await this.handleRepositoryEvent(payload);
          break;
        default:
          console.log(`Unhandled webhook event: ${eventType}`);
      }

      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Error handling GitHub webhook:', error);
      res.status(500).json({ error: error.message });
    }
  }

  private async handlePushEvent(payload: any) {
    const { repository, commits, pusher } = payload;
    
    if (!repository || !commits || commits.length === 0) {
      return;
    }

    console.log(`Push event for ${repository.full_name}:`, {
      commits: commits.length,
      pusher: pusher?.name,
    });

    // TODO: Find prototype by repository and trigger rebuild
    // This would involve:
    // 1. Find prototype by gitHubOwner and gitHubRepoName
    // 2. Trigger build process
    // 3. Update build status
  }

  private async handleRepositoryEvent(payload: any) {
    const { action, repository } = payload;
    
    console.log(`Repository event: ${action} for ${repository?.full_name}`);

    // TODO: Handle repository events (renamed, deleted, etc.)
    // This might involve updating or deactivating prototypes
  }
}