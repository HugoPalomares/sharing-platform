# Implementation Plan: Azure Deployment Pipeline

**Feature Branch:** 002-azure-deployment-pipeline  
**Implementation Approach:** Azure App Service with GitHub Actions CI/CD, step-by-step guided setup  
**Estimated Timeline:** 3-4 development sessions  
**Status:** Ready for Implementation

---

## Technical Architecture Overview

### Deployment Strategy
- **Azure App Service** for React application hosting (Basic B1 tier)
- **GitHub Actions** for automated CI/CD pipeline
- **Service Principal** authentication for secure deployments
- **Application Insights** for basic monitoring and logging
- **Azure CLI + Portal** for resource management

### Key Components
1. **Azure Resource Group** - Container for all related resources
2. **Azure App Service** - React application hosting platform
3. **Service Principal** - GitHub deployment authentication
4. **GitHub Actions Workflow** - Automated build and deployment
5. **Application Insights** - Monitoring and error tracking

---

## Phase 1: Azure Resource Setup (Session 1)

### Step 1.1: Create Resource Group

**Azure Portal Steps:**
1. **Login to Azure Portal**: Navigate to https://portal.azure.com
2. **Search for "Resource groups"** in the top search bar
3. **Click "Create"** button
4. **Fill in details:**
   - **Subscription**: Select your Azure subscription
   - **Resource group name**: `prototype-gallery-rg`
   - **Region**: `East US 2` (or your preferred region)
5. **Click "Review + create"** then **"Create"**

**Azure CLI Alternative:**
```bash
# Login to Azure CLI
az login

# Create resource group
az group create \
  --name prototype-gallery-rg \
  --location eastus2
```

### Step 1.2: Create App Service Plan and App Service

**Azure Portal Steps:**
1. **Navigate to Resource Groups** → Select `prototype-gallery-rg`
2. **Click "Create"** → Search for **"App Service"**
3. **Fill in App Service details:**
   - **Subscription**: Your Azure subscription
   - **Resource Group**: `prototype-gallery-rg`
   - **Name**: `prototype-gallery-{your-initials}` (must be globally unique)
   - **Publish**: `Code`
   - **Runtime stack**: `Node 20 LTS`
   - **Operating System**: `Linux`
   - **Region**: `East US 2` (same as resource group)

4. **App Service Plan Configuration:**
   - **Pricing tier**: Click "Change size"
   - **Select "Basic B1"** (1.75 GB RAM, 1 Core - sufficient for prototype)
   - **Click "Apply"**

5. **Click "Review + create"** then **"Create"**
6. **Wait for deployment** (usually 2-3 minutes)

**Azure CLI Alternative:**
```bash
# Create App Service Plan
az appservice plan create \
  --name prototype-gallery-plan \
  --resource-group prototype-gallery-rg \
  --sku B1 \
  --is-linux

# Create App Service
az webapp create \
  --resource-group prototype-gallery-rg \
  --plan prototype-gallery-plan \
  --name prototype-gallery-{your-initials} \
  --runtime "NODE:20-lts"
```

### Step 1.3: Configure App Service for React SPA

**Azure Portal Steps:**
1. **Navigate to your App Service** in the portal
2. **Go to "Configuration"** in left sidebar
3. **Application settings tab** → Click **"New application setting"**
4. **Add the following settings:**

   | Name | Value | Description |
   |------|--------|-------------|
   | `WEBSITE_NODE_DEFAULT_VERSION` | `~20` | Node.js version |
   | `SCM_DO_BUILD_DURING_DEPLOYMENT` | `true` | Enable build on deploy |
   | `ENABLE_ORYX_BUILD` | `true` | Enable Oryx build system |

5. **Click "Save"** at the top

**Important: React Router SPA Configuration**
6. **Go to "Path mappings"** in Configuration
7. **Virtual applications and directories** section
8. **Ensure "/" points to "site/wwwroot"**

### Step 1.4: Create Service Principal for GitHub Actions

**Azure CLI Required (Portal method is complex):**
```bash
# Create Service Principal with Contributor role for the resource group
az ad sp create-for-rbac \
  --name "prototype-gallery-github-actions" \
  --role contributor \
  --scopes /subscriptions/{SUBSCRIPTION-ID}/resourceGroups/prototype-gallery-rg \
  --sdk-auth

# The output will look like this - SAVE THIS OUTPUT:
{
  "clientId": "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxx~xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "subscriptionId": "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "tenantId": "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

**To get your Subscription ID:**
```bash
# List your subscriptions
az account list --output table
# Copy the SubscriptionId from the output
```

---

## Phase 2: GitHub Actions Configuration (Session 1 cont.)

### Step 2.1: Add GitHub Secrets

**GitHub Repository Steps:**
1. **Navigate to your GitHub repository**
2. **Go to Settings** → **Secrets and variables** → **Actions**
3. **Click "New repository secret"** and add these secrets:

   | Secret Name | Value | Source |
   |-------------|--------|---------|
   | `AZURE_CREDENTIALS` | Entire JSON output from Service Principal creation | Step 1.4 output |
   | `AZURE_WEBAPP_NAME` | `prototype-gallery-{your-initials}` | Your App Service name |

4. **Click "Add secret"** for each

### Step 2.2: Create GitHub Actions Workflow

**Create file:** `.github/workflows/azure-deploy.yml`

```yaml
name: Deploy to Azure App Service

on:
  push:
    branches:
      - main
      - 002-azure-deployment-pipeline  # For testing during development
    paths:
      - 'prototype-gallery/**'  # Only deploy when prototype-gallery changes
  workflow_dispatch:  # Allow manual triggering

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: 'Checkout GitHub Action'
      uses: actions/checkout@v4

    - name: 'Setup Node.js'
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        cache-dependency-path: 'prototype-gallery/package-lock.json'

    - name: 'Install dependencies'
      run: |
        cd prototype-gallery
        npm ci --prefer-offline --no-audit

    - name: 'Build application'
      run: |
        cd prototype-gallery
        npm run build
      env:
        # Add production environment variables here if needed
        NODE_ENV: production

    - name: 'Login to Azure'
      uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}

    - name: 'Deploy to Azure App Service'
      uses: azure/webapps-deploy@v2
      with:
        app-name: ${{ secrets.AZURE_WEBAPP_NAME }}
        package: './prototype-gallery/dist'

    - name: 'Create web.config for SPA routing'
      run: |
        cat > ./prototype-gallery/dist/web.config << 'EOF'
        <?xml version="1.0" encoding="utf-8"?>
        <configuration>
          <system.webServer>
            <rewrite>
              <rules>
                <rule name="React Router" stopProcessing="true">
                  <match url=".*" />
                  <conditions logicalGrouping="MatchAll">
                    <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
                    <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
                  </conditions>
                  <action type="Rewrite" url="/" />
                </rule>
              </rules>
            </rewrite>
            <staticContent>
              <mimeMap fileExtension=".js" mimeType="application/javascript" />
              <mimeMap fileExtension=".css" mimeType="text/css" />
            </staticContent>
          </system.webServer>
        </configuration>
        EOF

    - name: 'Deploy updated files with web.config'
      uses: azure/webapps-deploy@v2
      with:
        app-name: ${{ secrets.AZURE_WEBAPP_NAME }}
        package: './prototype-gallery/dist'

    - name: 'Logout from Azure'
      run: az logout
```

---

## Phase 3: React Application Configuration (Session 2)

### Step 3.1: Create web.config for SPA Routing

**Create file:** `prototype-gallery/public/web.config`

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Router" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/(api)" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".js" mimeType="application/javascript" />
      <mimeMap fileExtension=".css" mimeType="text/css" />
      <mimeMap fileExtension=".json" mimeType="application/json" />
    </staticContent>
    <httpErrors>
      <remove statusCode="404" subStatusCode="-1" />
      <error statusCode="404" prefixLanguageFilePath="" path="/index.html" responseMode="ExecuteURL" />
    </httpErrors>
  </system.webServer>
</configuration>
```

### Step 3.2: Update Vite Configuration for Production

**Edit:** `prototype-gallery/vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // Ensure proper base path for Azure
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable source maps for production
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code for better caching
          vendor: ['react', 'react-dom', 'react-router-dom'],
          fluentui: ['@fluentui/react-components', '@fluentui/react-icons']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  },
  preview: {
    port: 4173,
    host: true
  }
})
```

### Step 3.3: Create Production Environment Configuration

**Create file:** `prototype-gallery/.env.production`

```env
# Production environment variables
VITE_APP_ENV=production
VITE_APP_VERSION=$npm_package_version
```

**Update:** `prototype-gallery/.env.local.example`

```env
# Local development environment variables
VITE_APP_ENV=development
VITE_APP_VERSION=dev
```

---

## Phase 4: Application Insights Setup (Session 2 cont.)

### Step 4.1: Create Application Insights Resource

**Azure Portal Steps:**
1. **Navigate to Resource Groups** → `prototype-gallery-rg`
2. **Click "Create"** → Search for **"Application Insights"**
3. **Fill in details:**
   - **Subscription**: Your Azure subscription
   - **Resource Group**: `prototype-gallery-rg`
   - **Name**: `prototype-gallery-insights`
   - **Region**: `East US 2`
   - **Resource Mode**: `Classic` (for simplicity)

4. **Click "Review + create"** then **"Create"**

**Azure CLI Alternative:**
```bash
az extension add --name application-insights

az monitor app-insights component create \
  --app prototype-gallery-insights \
  --location eastus2 \
  --resource-group prototype-gallery-rg \
  --application-type web
```

### Step 4.2: Configure Application Insights in App Service

**Azure Portal Steps:**
1. **Navigate to your App Service**
2. **Go to "Application Insights"** in left sidebar
3. **Click "Turn on Application Insights"**
4. **Select "Select existing resource"**
5. **Choose** `prototype-gallery-insights`
6. **Click "Apply"**

### Step 4.3: Add Application Insights to React App (Optional)

**Install Application Insights SDK:**
```bash
cd prototype-gallery
npm install @microsoft/applicationinsights-web
```

**Create file:** `prototype-gallery/src/services/appInsights.ts`

```typescript
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

let appInsights: ApplicationInsights | null = null;

export const initAppInsights = () => {
  if (import.meta.env.PROD && !appInsights) {
    appInsights = new ApplicationInsights({
      config: {
        connectionString: 'InstrumentationKey=YOUR_INSTRUMENTATION_KEY',
        enableAutoRouteTracking: true, // React Router tracking
        enableCorsCorrelation: true,
        enableRequestHeaderTracking: true,
        enableResponseHeaderTracking: true,
      }
    });
    
    appInsights.loadAppInsights();
    appInsights.trackPageView(); // Initial page view
  }
};

export const trackEvent = (name: string, properties?: Record<string, any>) => {
  if (appInsights) {
    appInsights.trackEvent({ name, properties });
  }
};

export const trackException = (error: Error) => {
  if (appInsights) {
    appInsights.trackException({ exception: error });
  }
};
```

---

## Phase 5: HTTPS and Security Configuration (Session 3)

### Step 5.1: Enable HTTPS Only

**Azure Portal Steps:**
1. **Navigate to your App Service**
2. **Go to "TLS/SSL settings"** in left sidebar
3. **HTTPS Only** section → **Toggle "On"**
4. **Click "Save"**

**Azure CLI Alternative:**
```bash
az webapp update \
  --resource-group prototype-gallery-rg \
  --name prototype-gallery-{your-initials} \
  --https-only true
```

### Step 5.2: Configure Custom Error Pages

**Create file:** `prototype-gallery/public/404.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Prototype Gallery</title>
    <script>
        // Redirect to main app for client-side routing
        window.location.href = '/';
    </script>
</head>
<body>
    <div>Redirecting...</div>
</body>
</html>
```

---

## Phase 6: Testing and Verification (Session 3 cont.)

### Step 6.1: Pre-Deployment Testing

**Local Production Build Test:**
```bash
cd prototype-gallery

# Build for production
npm run build

# Test production build locally
npm run preview

# Verify all routes work:
# - http://localhost:4173/
# - http://localhost:4173/favorites
# - http://localhost:4173/my-prototypes
# - http://localhost:4173/all
```

### Step 6.2: Deploy and Test

**Trigger Deployment:**
```bash
# Commit and push changes
git add .
git commit -m "Add Azure deployment configuration

- Added GitHub Actions workflow for automated deployment
- Configured web.config for React Router SPA routing
- Updated Vite config for production optimization
- Added Application Insights monitoring setup
- Enabled HTTPS-only configuration

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin 002-azure-deployment-pipeline
```

**Monitor Deployment:**
1. **Go to GitHub repository** → **Actions tab**
2. **Watch the deployment workflow** run
3. **Check for any errors** in the build/deploy steps

### Step 6.3: Production Testing Checklist

**Post-Deployment Verification:**

| Test | URL | Expected Result |
|------|-----|-----------------|
| **Main App** | `https://prototype-gallery-{initials}.azurewebsites.net/` | Login screen loads |
| **Authentication** | Login button | Mock authentication works |
| **Gallery Sections** | `/all`, `/favorites`, `/my-prototypes` | All sections load without 404 |
| **Search** | Type in search box | Search functionality works |
| **Filtering** | Use author/product filters | Filtering works |
| **Favorites** | Heart/unheart prototypes | Favorites persist |
| **Mobile** | Access on mobile device | Responsive design works |
| **Performance** | Page load speed | Under 3 seconds |
| **HTTPS** | Check certificate | Secure connection (lock icon) |

---

## Phase 7: Monitoring and Maintenance (Session 4)

### Step 7.1: Application Insights Monitoring

**Key Metrics to Monitor:**
1. **Page Views** - Track user engagement
2. **Load Times** - Performance monitoring
3. **Failures** - Error tracking
4. **Custom Events** - User interactions

**Azure Portal Monitoring:**
1. **Navigate to Application Insights** resource
2. **Overview dashboard** shows key metrics
3. **Failures** section shows errors and exceptions
4. **Performance** section shows load times
5. **Usage** section shows user behavior

### Step 7.2: Set Up Alerts

**Create Performance Alert:**
1. **Application Insights** → **Alerts**
2. **New alert rule**
3. **Condition**: Page load time > 5 seconds
4. **Action**: Email notification

**Create Availability Alert:**
1. **Application Insights** → **Availability**
2. **Add availability test**
3. **URL test**: `https://prototype-gallery-{initials}.azurewebsites.net/`
4. **Test frequency**: 5 minutes
5. **Success criteria**: HTTP 200 response

---

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. **React Router 404 Errors**
**Problem**: Direct URLs like `/favorites` return 404  
**Solution**: Ensure `web.config` is properly deployed and configured

#### 2. **Build Failures in GitHub Actions**
**Problem**: npm install or build fails  
**Solutions**:
- Check Node.js version compatibility
- Verify package.json dependencies
- Check for environment variable issues

#### 3. **App Service Won't Start**
**Problem**: App Service shows "Service Unavailable"  
**Solutions**:
- Check Application settings for correct Node.js version
- Review App Service logs in Portal
- Verify build output in `dist` folder

#### 4. **Authentication Issues**
**Problem**: Service Principal authentication fails  
**Solutions**:
- Regenerate Service Principal credentials
- Verify GitHub secrets are correctly set
- Check subscription permissions

#### 5. **Performance Issues**
**Problem**: Slow loading times  
**Solutions**:
- Enable compression in App Service
- Optimize bundle size with code splitting
- Use CDN for static assets (future enhancement)

### Diagnostic Commands

```bash
# Check App Service logs
az webapp log tail \
  --resource-group prototype-gallery-rg \
  --name prototype-gallery-{your-initials}

# Get App Service URL
az webapp show \
  --resource-group prototype-gallery-rg \
  --name prototype-gallery-{your-initials} \
  --query "defaultHostName" \
  --output tsv

# Check deployment status
az webapp deployment list \
  --resource-group prototype-gallery-rg \
  --name prototype-gallery-{your-initials}
```

---

## Success Criteria Validation

### Technical Validation
- [ ] App Service successfully created and configured
- [ ] GitHub Actions pipeline deploys without errors
- [ ] React Router SPA routing works on all paths
- [ ] HTTPS certificate active and enforced
- [ ] Application Insights monitoring operational

### Performance Validation
- [ ] Initial page load under 3 seconds
- [ ] All Phase 1 functionality works identically
- [ ] Mobile responsiveness maintained
- [ ] Multiple concurrent users supported

### Business Validation
- [ ] Platform accessible via shareable URL
- [ ] Professional appearance suitable for demos
- [ ] Team members can access shared instance
- [ ] Monitoring provides production insights

---

**This implementation plan provides step-by-step guidance for deploying the prototype gallery to Azure with production-ready configuration, monitoring, and CI/CD automation.**