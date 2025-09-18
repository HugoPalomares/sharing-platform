export function parseGitHubUrl(url: string): { gitHubOwner: string; gitHubRepoName: string } {
  // Handle different GitHub URL formats:
  // https://github.com/owner/repo
  // https://github.com/owner/repo.git
  // git@github.com:owner/repo.git
  
  let cleanUrl = url.trim();
  
  // Remove .git suffix if present
  if (cleanUrl.endsWith('.git')) {
    cleanUrl = cleanUrl.slice(0, -4);
  }
  
  // Handle SSH format
  if (cleanUrl.startsWith('git@github.com:')) {
    const parts = cleanUrl.replace('git@github.com:', '').split('/');
    if (parts.length !== 2) {
      throw new Error('Invalid GitHub repository URL format');
    }
    return {
      gitHubOwner: parts[0],
      gitHubRepoName: parts[1],
    };
  }
  
  // Handle HTTPS format
  if (cleanUrl.startsWith('https://github.com/')) {
    const parts = cleanUrl.replace('https://github.com/', '').split('/');
    if (parts.length < 2) {
      throw new Error('Invalid GitHub repository URL format');
    }
    return {
      gitHubOwner: parts[0],
      gitHubRepoName: parts[1],
    };
  }
  
  throw new Error('Invalid GitHub repository URL format');
}

export function generatePrototypeUrl(repoName: string): string {
  const timestamp = Date.now();
  const cleanRepoName = repoName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  return `/prototype/${timestamp}-${cleanRepoName}`;
}

export function isValidGitHubUrl(url: string): boolean {
  try {
    parseGitHubUrl(url);
    return true;
  } catch {
    return false;
  }
}

export function extractRepoInfoFromWebhook(payload: any): {
  owner: string;
  repo: string;
  fullName: string;
} {
  return {
    owner: payload.repository.owner.login,
    repo: payload.repository.name,
    fullName: payload.repository.full_name,
  };
}