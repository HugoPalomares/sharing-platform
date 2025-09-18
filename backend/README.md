# Sharing Platform Backend

A Node.js/Express backend API for the GitHub prototype publishing platform. This service provides prototype management, GitHub integration, build pipeline, and hosting capabilities.

## Features

- **Prototype Management**: CRUD operations for prototype metadata
- **GitHub Integration**: OAuth authentication and repository access
- **Build Pipeline**: Automated building of React and static projects
- **Prototype Hosting**: Serve built prototypes at unique URLs
- **Webhook Support**: Automatic rebuilds on GitHub push events
- **Database**: PostgreSQL with Prisma ORM

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Mock auth (ready for JWT implementation)
- **GitHub Integration**: Octokit REST API
- **Build System**: Child processes for npm/build commands

## API Endpoints

### Prototypes
- `GET /api/prototypes` - List prototypes (with optional user filtering)
- `POST /api/prototypes` - Create new prototype from GitHub repo
- `GET /api/prototypes/:id` - Get prototype details
- `PUT /api/prototypes/:id` - Update prototype metadata
- `DELETE /api/prototypes/:id` - Delete prototype
- `POST /api/prototypes/:id/rebuild` - Trigger manual rebuild

### GitHub Integration
- `GET /api/github/auth` - Start OAuth flow
- `GET /api/github/callback` - OAuth callback handler
- `GET /api/github/repos` - List user's repositories
- `GET /api/github/repos/:owner/:repo` - Get repository info
- `POST /api/github/webhook` - GitHub webhook endpoint

### Prototype Hosting
- `GET /prototype/:id/*` - Serve prototype files

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- GitHub OAuth App (for GitHub integration)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Set up database:
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/sharing_platform_db"

# Server
PORT=3001
NODE_ENV=development

# GitHub OAuth (optional for testing)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# JWT (for future auth implementation)
JWT_SECRET=your_super_secret_jwt_key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Build artifacts storage
BUILD_ARTIFACTS_PATH=./build-artifacts
```

## Database Schema

The application uses three main tables:

- **prototypes**: Core prototype metadata and build status
- **github_integrations**: GitHub OAuth tokens and webhook info
- **build_history**: Build logs and history for debugging

## Build Process

The build service supports:

1. **React Projects**: Detects `package.json` with React dependencies, runs `npm install` and `npm run build`
2. **Static Projects**: Detects `index.html`, copies files directly

Built prototypes are stored in the `BUILD_ARTIFACTS_PATH` directory and served via `/prototype/:id/*` routes.

## Authentication

Currently uses mock authentication for development:
- Set `x-mock-user` header to specify user email
- Real JWT authentication infrastructure is ready for implementation

## GitHub Integration

### OAuth Flow
1. Frontend calls `/api/github/auth` to get authorization URL
2. User authorizes on GitHub
3. GitHub redirects to `/api/github/callback` with code
4. Backend exchanges code for access token
5. Frontend stores token for API calls

### Webhook Handling
- Receives push events from GitHub
- Validates webhook signature
- Triggers automatic rebuilds (TODO: implement build queue)

## Development

### Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

### Project Structure
```
src/
├── controllers/     # Request handlers
├── services/        # Business logic
├── routes/          # Express route definitions
├── middleware/      # Authentication, validation
├── types/           # TypeScript type definitions
├── utils/           # Helper functions
└── generated/       # Prisma generated client
```

## Production Deployment

1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Build and start the application

The service is designed to run on Azure App Service but can be deployed to any Node.js hosting platform.

## Future Enhancements

- JWT authentication with Microsoft Entra ID
- Build queue for handling concurrent builds
- Azure Blob Storage for build artifacts
- Real-time build status updates via WebSockets
- Enhanced security with encrypted token storage