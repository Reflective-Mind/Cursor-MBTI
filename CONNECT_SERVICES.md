# Manual Connection Guide for Vercel and Render

This guide will walk you through the process of connecting your GitHub repository to Vercel and Render for the initial setup, which is required before automatic deployments can work.

## Connecting to Vercel

### Step 1: Create a Vercel Account

1. Go to [Vercel](https://vercel.com)
2. Click "Sign Up" if you don't have an account
3. Choose to sign up with GitHub to easily connect your repositories

### Step 2: Import Your Repository

1. From the Vercel dashboard, click "Add New..." → "Project"
2. Select the "Import Git Repository" option
3. Find and select the "Reflective-Mind/Cursor-MBTI" repository
   - If you don't see it, click "Select a different GitHub account" and authorize Vercel to access the repository

### Step 3: Configure Your Project

1. Project Name: You can leave this as the default or create a custom name
2. Framework Preset: Select "Next.js" (should be automatically detected)
3. Root Directory: Leave this as `.` (the project root)
4. Build and Output Settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
5. Environment Variables: Add any required environment variables (not needed for basic setup)

### Step 4: Deploy

1. Click "Deploy"
2. Wait for the build and deployment to complete
3. You'll be redirected to the project dashboard with your deployment URL
4. Save this URL for future reference

### Step 5: Get Project Information for GitHub Actions

1. Go to your Project Settings in Vercel
2. Look for "Project ID" and copy it - you'll need this for the GitHub Actions
3. Go to [Vercel account settings](https://vercel.com/account)
4. Under "Your Teams", select your personal account or the team where the project is
5. Copy the "ID" - this is your "Organization ID" for GitHub Actions

## Connecting to Render

### Step 1: Create a Render Account

1. Go to [Render](https://render.com)
2. Click "Sign Up" if you don't have an account
3. Choose to sign up with GitHub to easily connect your repositories

### Step 2: Create a Web Service

1. From the Render dashboard, click "New" → "Web Service"
2. Connect to your GitHub account if prompted
3. Find and select the "Reflective-Mind/Cursor-MBTI" repository

### Step 3: Configure Your Web Service

1. Name: `unreal-mesh-generator` (or your preferred name)
2. Environment: Select "Node"
3. Region: Choose a region close to your target users
4. Branch: `main`
5. Root Directory: Leave empty (uses the repository root)
6. Build Command: `npm install && npm run build`
7. Start Command: `npm start`
8. Plan: Select "Free"

### Step 4: Environment Variables

1. Scroll down to the "Environment" section
2. Add the following environment variables:
   - Key: `NODE_ENV`, Value: `production`
   - Key: `PORT`, Value: `10000`

### Step 5: Create Web Service

1. Click "Create Web Service"
2. Wait for the build and deployment to complete
3. Save the provided URL for future reference

### Step 6: Get Service ID for GitHub Actions

1. Look at the URL of your service in the Render dashboard
2. It should look like `https://dashboard.render.com/web/srv-xyz123`
3. The `srv-xyz123` part is your Service ID - copy this for GitHub Actions

## Creating API Keys

### For Vercel:

1. Go to your [Vercel account settings](https://vercel.com/account/tokens)
2. Click "Create" to generate a new token
3. Name: "GitHub Actions"
4. Scope: "Full Account" (to allow deployments)
5. Click "Create Token"
6. Copy the token immediately (you won't see it again)

### For Render:

1. Go to your [Render dashboard](https://dashboard.render.com/settings)
2. Click your account name in the top-right corner → "Account Settings"
3. Scroll down to "API Keys"
4. Click "Create API Key"
5. Name: "GitHub Actions"
6. Copy the API key immediately (you won't see it again)

## Setting Up GitHub Secrets

Now that you have all the necessary information, you need to add it as secrets to your GitHub repository:

1. Go to your GitHub repository (Reflective-Mind/Cursor-MBTI)
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Add the following secrets:
   - Name: `VERCEL_TOKEN`, Value: [Your Vercel Token]
   - Name: `VERCEL_ORG_ID`, Value: [Your Vercel Organization ID]
   - Name: `VERCEL_PROJECT_ID`, Value: [Your Vercel Project ID]
   - Name: `RENDER_SERVICE_ID`, Value: [Your Render Service ID]
   - Name: `RENDER_API_KEY`, Value: [Your Render API Key]

## Testing the Connection

After setting up the connections and secrets:

1. Make a small change to your repository
2. Commit and push to the `main` branch
3. Go to the "Actions" tab on GitHub to see the workflow run
4. Check that your changes are automatically deployed to both Vercel and Render

## Troubleshooting

If you encounter issues during the connection process:

- **Vercel Build Errors**: Check the build logs for specific error messages
- **Render Deployment Issues**: Verify your environment variables and build commands
- **GitHub Actions Failures**: Make sure all secrets are correctly set up
- **Missing Dependencies**: Verify that your package.json includes all required dependencies

For more detailed troubleshooting, check the documentation for [Vercel](https://vercel.com/docs) and [Render](https://render.com/docs). 