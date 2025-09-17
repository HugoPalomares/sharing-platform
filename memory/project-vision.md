# Prototype Distribution Platform for Digital Creators 
Author: Hugo Palomares

## Introduction

A new breed of creators is emerging at Microsoft. They're designers, PMs, and even non-technical employees who are building functional prototypes using AI-powered tools like GitHub Copilot and VS Code. While tools like Lovable offer all-in-one authoring and publishing, our creators want the flexibility to author anywhere while maintaining Microsoft's security standards.

The problem is simple: these creators can build impressive prototypes, but they have no secure, professional way to share them internally. External tools violate our security policies. Internal tools require DevOps knowledge they don't have. So they either give up or resort to screen recordings that don't capture the interactive nature of their work.

We need a secure prototype distribution platform that bridges this gap. One that takes a Git repository and turns it into a shareable, authenticated prototype with controlled access and professional presentation. No DevOps knowledge required.

## Customer Challenges

Through conversations with early vibe coders at Microsoft, we've identified several pain points:

> "Vibe coding is easy, but making it look professional is hard. I need templates that already look like real Microsoft products."

> "Lovable feels like magic, but I can't use Fluent components. My prototypes look generic instead of like Microsoft experiences."

> "I share Lovable prototypes with passwords in URLs. I'm always nervous about whether it's actually secure."

> "VS Code with Copilot and the right MCPs gives me the same quality as Lovable, but I have no way to share what I build other than screenshots or videos."

### Key Patterns

- **Building Success**: Creators successfully build prototypes with AI assistance
- **Sharing Roadblock**: They hit a wall when trying to share their work securely
- **Discovery Chaos**: Prototypes scattered across Teams links, emails, and screenshots
- **Version Confusion**: Multiple versions floating around with no clear "latest" indicator
- **Access Anxiety**: No visibility into who can see prototypes or for how long
- **Demo Friction**: Recipients don't understand the prototype's purpose or how to navigate it

This forces creators to either:
- Use external tools (risking security violations)
- Burden engineers with deployment requests (creating bottlenecks)
- Resort to static screenshots that miss the interactive experience

## Technical Challenges

Current internal deployment options at Microsoft require understanding:

- Azure portal navigation and resource creation
- EntraID app registrations and authentication flows
- DNS configuration and custom domains
- CI/CD pipelines and GitHub Actions
- Security compliance and network policies

For someone who just learned to code last week with Copilot's help, this is overwhelming. The result? Prototypes stay on laptops, feedback cycles slow down, and innovation stalls.

## Vision

### Product Requirements

#### 1. Secure Prototype Gallery
A central web application where prototypes are discoverable with granular access control (Entra ID features). Users can browse, search, and filter prototypes by author, product area, tags, and recency. Managing access of who gets access to what, both internal employees and external guests (customers, etc.).

#### 2. Email-Based Access Control
Share prototypes by entering email addresses (like PowerPoint). Owners can review all granted access, set expiration dates, and revoke access anytime. External emails require approval workflow. Full audit trail of who accessed when.

#### 3. One-line Deployment
Deploy any Git repository to a shareable URL with a single command. The platform handles all Azure complexity behind the scenes, enabling creators to focus on building.

#### 4. Professional Presentation
Prototypes get professional URLs like `projectname.prototypes.microsoft.com`. Gallery provides context wrapper with instructions, demo scenarios, and purpose statement. Option to view fullscreen for complete experience.

#### 5. Discovery at Scale
Three-section layout: Favorites, My Prototypes, All. Smart search and filtering prevent overwhelming users when browsing hundreds of prototypes. "New" badges highlight recent work.

#### 6. Flexible Viewing Options
Prototypes can be viewed in gallery with overlay controls (device preview, settings) or directly for full browser capabilities. Wrapper view provides context without constraining functionality.

#### 7. Starter Templates
Pre-built templates with Fluent design components to help creators start with professional-looking prototypes that feel like real Microsoft products.

#### 8. Dynamic Prototype Configuration
Creators can define "knobs" (settings/parameters) that allow prototypes to simulate different scenarios without using real sensitive customer data. Teams can create and save configuration scenarios for different customer meetings, enabling the same prototype to demonstrate various use cases by adjusting parameters like subscription types, user roles, data volumes, or feature flags. This eliminates the need for sensitive data while maintaining realistic demo experiences.

## Suggested Development Roadmap

Using hybrid approach (local development with incremental Azure integration) and spec-driven development workflow:

### Phase 1: Core Gallery Foundation
**Feature 1**: Prototype gallery with mock authentication (local development)
- React app with Fluent UI components
- Gallery layout with search, filtering, favorites
- Mock user authentication and prototype data
- Professional Microsoft design language

### Phase 2: Real Authentication
**Feature 2**: Entra ID authentication integration
- Connect to real Microsoft authentication
- Test security flows while developing locally
- Validate core value proposition with real auth

### Phase 3: Cloud Deployment
**Feature 3**: Azure deployment pipeline
- Deploy React app to Azure App Service
- Set up CI/CD from GitHub
- Configure custom domain and SSL

### Phase 4: Prototype Management
**Feature 4**: Prototype upload and storage system
- Azure Storage integration
- Git repository ingestion
- Prototype metadata management

### Phase 5: Access Control
**Feature 5**: Sharing and access control
- Email-based prototype sharing
- Permission management and audit trails
- External guest access workflows

### Phase 6: Dynamic Configuration System
**Feature 6**: Prototype knobs and scenario management
- Knob definition system (settings/parameters for prototypes)
- Scenario creation and management UI
- Runtime configuration passing to prototypes
- Team scenario sharing and version control
- Launch prototype with specific scenarios

Each feature follows `/feature` → `/plan` → `/implement` → `/diary` workflow to maintain context across development sessions.

### Future Enhancements

- Feedback integration (Forms, comments, analytics)
- Native mobile prototype support (iOS/Android)
- Advanced analytics and usage reporting
- Prototype versioning and rollback capabilities
- Integration with Microsoft Teams for notifications