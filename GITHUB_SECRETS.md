# Setting Up GitHub Secrets for Automated Deployment

This guide explains how to set up the necessary GitHub secrets to enable automatic deployment to Vercel and Render whenever you push to the `main` branch.

## Vercel Deployment Secrets

To deploy to Vercel automatically, you need to set up the following secrets in your GitHub repository:

### 1. VERCEL_TOKEN

1. Go to [Vercel](https://vercel.com) and log in to your account
2. Click on your profile avatar in the top-right corner
3. Select "Settings"
4. Click on "Tokens" in the left sidebar
5. Click "Create" to create a new token
6. Give it a name like "GitHub Actions Deployment"
7. Set the scope to "Full Account" to allow deployments
8. Click "Create Token"
9. Copy the generated token immediately (you won't be able to see it again)

### 2. Setting up the Secret in GitHub

1. Go to your GitHub repository (Reflective-Mind/Cursor-MBTI)
2. Click on "Settings" (near the top of the page)
3. In the left sidebar, click on "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Name: `VERCEL_TOKEN`
6. Value: Paste the token you copied from Vercel
7. Click "Add secret"

## Render Deployment Secrets

To deploy to Render automatically, you need to set up the following secrets:

### 1. RENDER_SERVICE_ID

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Log in to your account
3. Navigate to the service you want to deploy
4. In the URL, you will see a string like `srv-xyz123` - this is your service ID
5. Copy this service ID

### 2. RENDER_API_KEY

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your account name in the top-right corner
3. Select "Account Settings"
4. Scroll down to "API Keys"
5. Click "Create API Key"
6. Give it a name like "GitHub Actions"
7. Copy the generated API key

### 3. Setting up the Secrets in GitHub

1. Go to your GitHub repository (Reflective-Mind/Cursor-MBTI)
2. Click on "Settings"
3. In the left sidebar, click on "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Add the following secrets one by one:
   - Name: `RENDER_SERVICE_ID`
     Value: The service ID you copied
   - Name: `RENDER_API_KEY`
     Value: The API key you copied

## Manual Setup on Vercel and Render

Before the automatic deployments can work, you need to manually set up your project on both platforms:

### Vercel Initial Setup

1. Go to [Vercel](https://vercel.com) and create a new project
2. Import the `Reflective-Mind/Cursor-MBTI` repository
3. Configure the project:
   - Framework: Next.js
   - Root Directory: ./
4. Deploy once manually to get a project ID

### Render Initial Setup

1. Go to [Render](https://render.com) and create a new Web Service
2. Connect to your GitHub repository
3. Configure the service:
   - Name: unreal-mesh-generator
   - Environment: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

## Verify Automatic Deployment

After setting up all the secrets and the initial manual deployments:

1. Make a small change to your repository
2. Commit and push to the `main` branch
3. Go to the "Actions" tab on GitHub to see the workflow run
4. If everything is set up correctly, your changes will be automatically deployed to both Vercel and Render

## Troubleshooting

If automatic deployments aren't working:

1. Check the workflow logs in the GitHub Actions tab
2. Verify that all secrets are correctly set up
3. Ensure that your service IDs and API keys are valid
4. Check that you've connected the correct repository on both platforms 