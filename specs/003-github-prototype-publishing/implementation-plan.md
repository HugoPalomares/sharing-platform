# Implementation Plan: GitHub Prototype Publishing

**Feature Branch:** 003-github-prototype-publishing  
**Target Completion:** 7-10 days with AI assistance

---

## Overview

Implement GitHub repository integration system that transforms the platform from mock data showcase to real prototype publishing infrastructure. Core technical approach: extend existing centralized App Service with Azure SQL Database for metadata storage, GitHub OAuth for repository access, webhook-triggered build pipeline, and dynamic prototype hosting at unique URLs. This establishes the foundation for design intent capture and future collaborative features.

---

## Technical Architecture

### System Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   GitHub Repo   │───▶│  Platform APIs   │───▶│ Hosted Prototype│
│                 │    │                  │    │                 │
│ Push Changes    │    │ Build Pipeline   │    │ /prototype/{id} │
│ Webhook Trigger │    │ Database Storage │    │ Live React App  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Database Schema Design

```sql
-- Core prototype metadata
CREATE TABLE Prototypes (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(1000),
    GitHubRepoUrl NVARCHAR(500) NOT NULL,
    GitHubRepoName NVARCHAR(255) NOT NULL,
    GitHubOwner NVARCHAR(255) NOT NULL,
    CreatedBy NVARCHAR(255) NOT NULL, -- User email from auth
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    LastUpdated DATETIME2 DEFAULT GETUTCDATE(),
    LastDeployedAt DATETIME2,
    IsActive BIT DEFAULT 1,
    BuildStatus NVARCHAR(50) DEFAULT 'pending', -- pending, building, success, failed
    BuildErrorMessage NVARCHAR(2000),
    PrototypeUrl NVARCHAR(500), -- Generated URL path
    INDEX IX_CreatedBy (CreatedBy),
    INDEX IX_GitHubRepo (GitHubOwner, GitHubRepoName),
    INDEX IX_LastUpdated (LastUpdated DESC)
);

-- GitHub integration metadata
CREATE TABLE GitHubIntegrations (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PrototypeId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Prototypes(Id),
    GitHubInstallationId BIGINT,
    WebhookId BIGINT,
    AccessToken NVARCHAR(500), -- Encrypted
    RefreshToken NVARCHAR(500), -- Encrypted
    TokenExpiresAt DATETIME2,
    LastSyncAt DATETIME2,
    INDEX IX_PrototypeId (PrototypeId),
    INDEX IX_InstallationId (GitHubInstallationId)
);

-- Build history for debugging and analytics
CREATE TABLE BuildHistory (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PrototypeId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Prototypes(Id),
    GitCommitSha NVARCHAR(40),
    GitCommitMessage NVARCHAR(500),
    BuildStatus NVARCHAR(50), -- started, success, failed
    BuildStartedAt DATETIME2 DEFAULT GETUTCDATE(),
    BuildCompletedAt DATETIME2,
    BuildDurationMs INT,
    BuildLogs NVARCHAR(MAX),
    ErrorMessage NVARCHAR(2000),
    INDEX IX_PrototypeId_StartedAt (PrototypeId, BuildStartedAt DESC)
);
```

### API Endpoints Design

```typescript
// Prototype management
POST   /api/prototypes              // Connect new GitHub repo
GET    /api/prototypes              // List user's prototypes  
GET    /api/prototypes/{id}         // Get prototype details
PUT    /api/prototypes/{id}         // Update prototype metadata
DELETE /api/prototypes/{id}         // Delete prototype
POST   /api/prototypes/{id}/rebuild // Manual rebuild trigger

// GitHub integration
GET    /api/github/auth             // Start OAuth flow
GET    /api/github/callback         // OAuth callback handler
POST   /api/github/webhook          // GitHub webhook endpoint
GET    /api/github/repos            // List accessible repos

// Prototype hosting
GET    /prototype/{id}/*            // Serve prototype files
```

### Component Structure

```typescript
src/
├── components/
│   ├── prototypes/
│   │   ├── AddPrototypeDialog.tsx       // Repository connection UI
│   │   ├── PrototypeCard.tsx            // Extended with real data
│   │   ├── PrototypeManagement.tsx      // Edit/delete/rebuild
│   │   ├── BuildStatusIndicator.tsx     // Status badge component
│   │   └── GitHubRepoSelector.tsx       // Repository picker
│   ├── github/
│   │   ├── GitHubAuthButton.tsx         // OAuth flow starter
│   │   ├── RepoConnectionForm.tsx       // URL input and validation
│   │   └── BuildProgressDialog.tsx      // Real-time build status
│   └── common/
│       ├── StatusBadge.tsx              // Reusable status indicator
│       └── ErrorDialog.tsx              // Simple error messages
├── services/
│   ├── githubService.ts                 // GitHub API integration
│   ├── prototypeService.ts             // CRUD operations
│   └── buildService.ts                 // Build pipeline interface
├── hooks/
│   ├── useGitHubAuth.ts                // OAuth state management
│   ├── usePrototypes.ts                // Data fetching/mutations
│   └── useBuildStatus.ts               // Real-time status updates
└── types/
    ├── github.ts                       // GitHub API types
    └── prototype.ts                    // Extended prototype types
```

---

## Azure Infrastructure Setup

### Phase 1: Database Setup

**Step 1: Create Azure SQL Database**

1. In Azure Portal, click "Create a resource"
2. Search for "SQL Database" and select it
3. Click "Create" and fill in:
   - **Subscription**: Your Visual Studio Enterprise Subscription
   - **Resource Group**: `sharing-platform-rg`
   - **Database name**: `sharing-platform-db`
   - **Server**: Click "Create new"
     - **Server name**: `sharing-platform-sql-server`
     - **Location**: Central US (same as App Service)
     - **Authentication method**: Use SQL authentication
     - **Server admin login**: `dbadmin`
     - **Password**: Create secure password (save it!)
   - **Compute + storage**: Basic (5 DTU, 2 GB) - sufficient for prototype
4. Click "Review + create" then "Create"

**Step 2: Configure Database Access**

1. Go to SQL server → Networking
2. Under "Public network access", select "Selected networks"
3. Click "Add current client IP address"
4. Under "Exceptions", check "Allow Azure services and resources to access this server"
5. Click "Save"

**Step 3: Add Connection String to App Service**

1. Go to App Service → Configuration → Connection strings
2. Add new connection string:
   - **Name**: `DefaultConnection`
   - **Value**: `Server=tcp:sharing-platform-sql-server.database.windows.net,1433;Initial Catalog=sharing-platform-db;Persist Security Info=False;User ID=dbadmin;Password={password};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;`
   - **Type**: SQLServer
3. Click "Save"

### Phase 2: GitHub App Setup

**Step 1: Create GitHub App**

1. Go to GitHub Settings → Developer settings → GitHub Apps
2. Click "New GitHub App"
3. Fill in details:
   - **App name**: `sharing-platform-prototype-publisher`
   - **Homepage URL**: `https://sharing-platform-app-{your-unique-id}.centralus-01.azurewebsites.net`
   - **Callback URL**: `https://sharing-platform-app-{your-unique-id}.centralus-01.azurewebsites.net/api/github/callback`
   - **Webhook URL**: `https://sharing-platform-app-{your-unique-id}.centralus-01.azurewebsites.net/api/github/webhook`
   - **Webhook secret**: Generate random string (save it!)

4. **Repository permissions**:
   - Contents: Read
   - Metadata: Read
   - Pull requests: Read

5. **Subscribe to events**:
   - Push
   - Repository

6. Click "Create GitHub App"
7. Save the **App ID** and **Client ID**
8. Generate and download **Private key**

**Step 2: Add GitHub Settings to App Service**

1. Go to App Service → Configuration → Application settings
2. Add these settings:
   - `GITHUB_APP_ID`: {your app id}
   - `GITHUB_CLIENT_ID`: {your client id}
   - `GITHUB_CLIENT_SECRET`: {generate client secret in GitHub}
   - `GITHUB_WEBHOOK_SECRET`: {webhook secret you created}
   - `GITHUB_PRIVATE_KEY`: {contents of downloaded private key}
3. Click "Save"

---

## Implementation Steps

### Phase 1: Database Foundation [~16 hours]

**Backend Infrastructure**
- [ ] Set up Entity Framework Core with SQL Server provider
- [ ] Create database models matching schema design
- [ ] Implement database migrations and seeding
- [ ] Create prototype repository pattern for data access
- [ ] Add connection string configuration and health checks

**API Foundation**
- [ ] Create `PrototypeController` with CRUD endpoints
- [ ] Implement `GitHubController` for OAuth and webhook handling
- [ ] Add request validation and error handling middleware
- [ ] Create API response models and DTOs
- [ ] Implement basic authentication integration with existing auth

### Phase 2: GitHub Integration [~20 hours]

**OAuth Implementation**
- [ ] Create GitHub OAuth service for app authentication
- [ ] Implement OAuth flow: `/api/github/auth` → GitHub → callback
- [ ] Add token storage and refresh logic
- [ ] Create GitHub API client with authenticated requests
- [ ] Add user repository listing functionality

**Repository Connection**
- [ ] Build `AddPrototypeDialog` component with URL input
- [ ] Implement repository validation and metadata extraction
- [ ] Create prototype registration flow with database storage
- [ ] Add GitHub webhook registration for automatic updates
- [ ] Implement webhook handler for push events

### Phase 3: Build Pipeline [~24 hours]

**Build System**
- [ ] Create build service for React and static site detection
- [ ] Implement build execution using child processes in Azure
- [ ] Add build status tracking with real-time updates
- [ ] Create build artifact storage in local file system
- [ ] Implement build error handling and user feedback

**Prototype Hosting**
- [ ] Create dynamic route handler for `/prototype/{id}/*`
- [ ] Implement file serving from build artifacts
- [ ] Add prototype URL generation and routing
- [ ] Create build completion notification system
- [ ] Add prototype iframe embedding support

### Phase 4: UI Integration [~16 hours]

**Gallery Enhancement**
- [ ] Extend existing `PrototypeCard` to display real prototypes
- [ ] Add build status indicators and metadata display
- [ ] Integrate `AddPrototypeDialog` with existing gallery layout
- [ ] Create prototype management interface (edit/delete/rebuild)
- [ ] Update gallery data source to mix mock and real prototypes

**User Experience**
- [ ] Add real-time build progress indicators
- [ ] Implement simple error messaging for build failures
- [ ] Create prototype renaming functionality
- [ ] Add GitHub repository link display
- [ ] Ensure responsive design across all new components

### Phase 5: Testing & Polish [~8 hours]

**Integration Testing**
- [ ] Test complete flow: GitHub repo → live prototype
- [ ] Verify webhook automatic updates work correctly
- [ ] Test with both React and static HTML/CSS/JS projects
- [ ] Validate build error handling and user feedback
- [ ] Test OAuth flow and repository access permissions

**Production Readiness**
- [ ] Add logging and monitoring for build pipeline
- [ ] Implement database query optimization
- [ ] Add rate limiting for GitHub API calls
- [ ] Create backup strategy for prototype artifacts
- [ ] Document deployment and maintenance procedures

---

## Time Estimates

**Team of developers**: 3 developers × 4 weeks = 12 weeks total  
**With AI assistance**: 1 developer × 10-12 days = 10-12 total days

### Breakdown by Expertise
- **Database/Backend**: ~3-4 days (Entity Framework, SQL, APIs)
- **GitHub Integration**: ~3-4 days (OAuth, webhooks, Git operations)
- **Build Pipeline**: ~3-4 days (Process management, file handling)
- **UI Integration**: ~2-3 days (React components, existing patterns)

---

## Key Technical Decisions

### Build Strategy
**Decision**: Execute builds directly in App Service using child processes rather than separate build infrastructure
**Rationale**: Simpler architecture, uses existing Azure resources, sufficient for prototype workloads
**Trade-off**: Limited concurrent builds, but meets Phase 4 requirements

### Prototype Hosting
**Decision**: Serve prototypes through dynamic routes (`/prototype/{id}/*`) with file-based storage
**Rationale**: Maintains centralized architecture, enables future iframe integration and overlay features
**Trade-off**: Not as scalable as CDN, but supports future collaborative features

### Data Architecture
**Decision**: Relational database (Azure SQL) for metadata with extensible schema
**Rationale**: Supports complex queries for future features, ACID compliance, familiar tooling
**Trade-off**: Higher cost than NoSQL, but provides foundation for comments, access control, etc.

### Security Approach
**Decision**: Store GitHub tokens encrypted in database, validate all repository access
**Rationale**: Respects repository permissions, secure token management, audit trail
**Trade-off**: Additional complexity, but necessary for enterprise deployment

---

## Integration with Existing Patterns

### Component Consistency
- **Extend** existing `PrototypeCard` rather than creating new component
- **Reuse** `FilterPanel` and `SearchBar` patterns for prototype management
- **Follow** existing Fluent UI design tokens and spacing patterns
- **Maintain** three-section layout (Favorites, My Prototypes, All Prototypes)

### State Management
- **Extend** existing React Context pattern for prototype data
- **Follow** established loading/error state patterns from current gallery
- **Reuse** existing authentication context for user identification
- **Maintain** client-side filtering and search functionality

### API Patterns
- **Follow** RESTful conventions established in current codebase
- **Use** existing error handling and response formatting
- **Integrate** with current authentication middleware
- **Maintain** consistent logging and monitoring approaches

---

## Rollback Plan

If critical issues arise during implementation:

1. **Database Issues**: Use existing mock data service, disable GitHub integration
2. **GitHub Integration Failure**: Fall back to manual prototype URL entry
3. **Build Pipeline Problems**: Disable automatic builds, support external hosting links
4. **Performance Issues**: Implement build queuing, reduce concurrent limits

### Safe Deployment Strategy
1. Deploy database schema changes first (backward compatible)
2. Deploy API endpoints with feature flags disabled
3. Deploy UI components with GitHub integration hidden
4. Enable features incrementally with monitoring
5. Full rollback available by reverting to previous App Service deployment

---

## Dependencies & Risks

### External Dependencies
- **GitHub API**: Rate limits (5000 requests/hour), service availability
- **Azure SQL Database**: Connection limits, performance scaling
- **Node.js Build Tools**: npm, package availability, build complexity
- **SSL Certificates**: HTTPS required for GitHub OAuth callbacks

### Technical Risks
- **Build Timeouts**: Complex React apps may exceed Azure execution limits
  - **Mitigation**: Implement build timeouts, queue system for retries
- **Concurrent Build Limits**: Azure App Service process constraints
  - **Mitigation**: Build queuing system, clear user expectations
- **GitHub Token Security**: Secure storage and transmission requirements
  - **Mitigation**: Encryption at rest, secure Azure Key Vault integration plan
- **Database Performance**: Query performance with growing prototype count
  - **Mitigation**: Proper indexing, query optimization, connection pooling

### User Experience Risks
- **Build Failures**: Complex projects may fail to build automatically
  - **Mitigation**: Clear error messages, fallback to manual deployment guidance
- **OAuth Complexity**: Users may struggle with GitHub authentication
  - **Mitigation**: Step-by-step guidance, clear permission explanations

---

## Future Extensibility

This implementation creates foundation architecture for:

### Phase 5: Collaborative Features
- Database schema supports comments with prototype/location relationships
- Prototype hosting supports iframe embedding for overlay features
- API structure extensible for real-time collaboration endpoints

### Phase 6: Access Control
- User identification already integrated with existing auth
- Database schema supports permission relationships
- GitHub integration respects repository access as baseline

### Phase 7: Configuration System
- Prototype hosting supports parameter passing through URL query parameters
- Database schema extensible for knob definitions and configurations
- Build pipeline can inject configuration variables during build process

---

## Notes

### GitHub App vs OAuth App
Using GitHub App rather than OAuth App provides:
- Fine-grained repository permissions
- Webhook integration capabilities  
- Enterprise-ready security model
- Compatible with future Microsoft EMU requirements

### Build Artifact Storage
Initial implementation uses local file system storage within App Service. Future phases can migrate to Azure Blob Storage for scalability while maintaining same API interface.

### Real-time Updates
WebSocket integration planned for Phase 5 will build on the build status tracking infrastructure established in this phase, enabling real-time collaboration features.