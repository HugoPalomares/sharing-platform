import { Router } from 'express';
import { GitHubController } from '../controllers/githubController';
import { mockAuth } from '../middleware/auth';

const router = Router();
const githubController = new GitHubController();

// OAuth routes
router.get('/auth', githubController.startOAuth);
router.get('/auth/callback', githubController.handleCallback);

// Repository management routes (require authentication)
router.get('/repos', mockAuth, githubController.getRepositories);
router.get('/repos/:owner/:repo', githubController.getRepository);

// Webhook handler (public endpoint)
router.post('/webhook', githubController.handleWebhook);

export default router;