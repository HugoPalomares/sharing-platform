import { GitHubRepository, GitHubAuthResponse } from '../types/prototype';

const API_BASE_URL = 'http://localhost:3001/api';

class GitHubService {
  constructor() {
    // Check for OAuth callback immediately when service is created
    this.handleOAuthCallback();
  }

  // Start GitHub OAuth flow
  async initiateAuth(): Promise<GitHubAuthResponse> {
    const response = await fetch(`${API_BASE_URL}/github/auth`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to initiate GitHub auth: ${response.statusText}`);
    }

    return response.json();
  }

  // Get accessible repositories for the authenticated user
  async getRepositories(): Promise<GitHubRepository[]> {
    const accessToken = sessionStorage.getItem('github_access_token');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (accessToken) {
      headers['x-github-token'] = accessToken;
    }

    const response = await fetch(`${API_BASE_URL}/github/repos`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch repositories: ${response.statusText}`);
    }

    return response.json();
  }

  // Validate a GitHub repository URL and extract metadata
  async validateRepository(repoUrl: string): Promise<GitHubRepository> {
    // Extract owner and repo name from URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub repository URL');
    }

    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, ''); // Remove .git suffix if present

    const response = await fetch(`${API_BASE_URL}/github/repos/${owner}/${cleanRepo}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Repository not found or not accessible');
      }
      throw new Error(`Failed to validate repository: ${response.statusText}`);
    }

    return response.json();
  }

  // Check if user is authenticated with GitHub
  async checkAuthStatus(): Promise<boolean> {
    try {
      // First check if we have URL parameters from OAuth callback
      this.handleOAuthCallback();
      
      await this.getRepositories();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Handle OAuth callback when app loads with access token in URL
  private handleOAuthCallback(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const githubAuth = urlParams.get('github_auth');
    const isPopup = urlParams.get('popup') === 'true';
    
    console.log('🔍 Checking for OAuth callback params:', {
      accessToken: accessToken ? 'present' : 'missing',
      githubAuth,
      isPopup,
      currentUrl: window.location.href,
      urlParams: Object.fromEntries(urlParams.entries()),
      windowOpener: !!window.opener,
      windowDimensions: { width: window.outerWidth, height: window.outerHeight }
    });
    
    if (githubAuth === 'success' && accessToken) {
      console.log('✅ GitHub OAuth callback detected, storing access token');
      sessionStorage.setItem('github_access_token', accessToken);
      
      // Clean up URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('access_token');
      url.searchParams.delete('github_auth');
      window.history.replaceState({}, document.title, url.toString());
      
      if (isPopup) {
        console.log('🪟 Popup window detected, using localStorage to communicate with parent');
        console.log('🔍 window.opener:', window.opener);
        console.log('🏷️ window.name:', window.name);
        
        // Since window.opener is null, use localStorage to communicate
        // Store a temporary flag that the main window can check
        try {
          localStorage.setItem('github_auth_success', JSON.stringify({
            accessToken: accessToken,
            timestamp: Date.now()
          }));
          console.log('💾 Stored auth success in localStorage');
        } catch (error) {
          console.error('❌ Failed to store in localStorage:', error);
        }
        
        // Close popup after a shorter delay
        setTimeout(() => {
          console.log('🔒 Closing popup window');
          window.close();
        }, 1000);
      } else {
        console.log('🏠 Main window detected, OAuth token stored successfully');
      }
    }
  }

  // Open GitHub OAuth in a popup window
  openAuthWindow(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const authResponse = await this.initiateAuth();
        
        const popup = window.open(
          authResponse.authUrl,
          'github-auth',
          'width=500,height=600,scrollbars=yes,resizable=yes,left=100,top=100'
        );

        if (!popup) {
          reject(new Error('Popup blocked. Please allow popups for this site.'));
          return;
        }

        // Listen for postMessage from popup
        const messageListener = (event: MessageEvent) => {
          console.log('📨 Received postMessage from popup:', event);
          console.log('📍 Event origin:', event.origin);
          console.log('📦 Event data:', event.data);
          
          // Accept messages from both backend and frontend origins
          if (event.origin !== 'http://localhost:3001' && event.origin !== 'http://localhost:5174') {
            console.log('Origin mismatch, ignoring message');
            return;
          }
          
          if (event.data?.type === 'GITHUB_AUTH_SUCCESS') {
            console.log('GitHub auth success message received!');
            // Store the access token
            sessionStorage.setItem('github_access_token', event.data.accessToken);
            
            window.removeEventListener('message', messageListener);
            clearInterval(checkClosed);
            clearTimeout(timeoutId);
            
            console.log('✅ GitHub authentication successful!');
            resolve(true);
          } else if (event.data?.type === 'GITHUB_AUTH_ERROR') {
            console.log('GitHub auth error message received:', event.data.error);
            
            window.removeEventListener('message', messageListener);
            clearInterval(checkClosed);
            clearTimeout(timeoutId);
            
            resolve(false);
          }
        };

        window.addEventListener('message', messageListener);

        // Poll for popup closure and check localStorage
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            clearTimeout(timeoutId);
            
            // Check localStorage for auth success
            try {
              const authSuccess = localStorage.getItem('github_auth_success');
              if (authSuccess) {
                const authData = JSON.parse(authSuccess);
                console.log('📥 Found auth success in localStorage:', authData);
                
                // Store the token in sessionStorage for the main window
                sessionStorage.setItem('github_access_token', authData.accessToken);
                
                // Clean up localStorage
                localStorage.removeItem('github_auth_success');
                
                console.log('✅ GitHub authentication successful via localStorage!');
                resolve(true);
                return;
              }
            } catch (error) {
              console.error('❌ Failed to read from localStorage:', error);
            }
            
            // Fallback: Check if auth was successful by trying to fetch repos
            this.checkAuthStatus().then(resolve).catch(() => resolve(false));
          }
        }, 1000);

        // Timeout after 5 minutes
        const timeoutId = setTimeout(() => {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          if (!popup.closed) {
            popup.close();
          }
          reject(new Error('Authentication timeout'));
        }, 5 * 60 * 1000);

      } catch (error) {
        reject(error);
      }
    });
  }
}

// Export a singleton instance
export const githubService = new GitHubService();