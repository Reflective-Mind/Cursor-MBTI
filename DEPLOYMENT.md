# Deployment Guide for Unreal Engine Mesh Generator

This guide will help you deploy the Unreal Engine Mesh Generator to both Vercel (for the frontend) and Render (for additional backend services if needed).

## Prerequisites

- A GitHub account with the repository already pushed (this should be done if you followed the deployment script)
- A Vercel account (sign up at [vercel.com](https://vercel.com) if you don't have one)
- A Render account (sign up at [render.com](https://render.com) if you don't have one)

## Deploying to Vercel

1. **Sign in to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in with your account
   - If you don't have an account, you can sign up using your GitHub account

2. **Create a New Project**
   - Click on "Add New..." and select "Project"
   - Select the "Reflective-Mind/Cursor-MBTI" repository from the list
   - If you don't see it, you may need to import your GitHub account or organization

3. **Configure Project Settings**
   - Vercel should automatically detect the Next.js framework
   - Leave the default settings as they are (they should be correct based on the vercel.json file)
   - Project Name: You can use the default or choose a custom name
   - Framework Preset: Next.js
   - Root Directory: ./

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application
   - Once deployment is complete, you'll be provided with a URL where your application is hosted

5. **Custom Domain (Optional)**
   - In your project settings, you can add a custom domain if you have one
   - Go to "Domains" and follow the instructions to add and verify your domain

## Deploying to Render

1. **Sign in to Render**
   - Go to [render.com](https://render.com) and sign in with your account
   - If you don't have an account, you can sign up using your GitHub account

2. **Create a New Web Service**
   - Click on "New" and select "Web Service"
   - Connect your GitHub account if not already connected
   - Select the "Reflective-Mind/Cursor-MBTI" repository

3. **Configure Web Service**
   - Name: unreal-mesh-generator (or your preferred name)
   - Environment: Node
   - Branch: main
   - Root Directory: ./
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: Free

4. **Configure Environment Variables**
   - Scroll down to the "Environment" section
   - Add the following variables:
     - NODE_ENV: production
     - PORT: 10000

5. **Create Web Service**
   - Click "Create Web Service"
   - Render will build and deploy your application
   - Once deployment is complete, you'll be provided with a URL where your service is hosted

## Verifying Deployment

After deployment to both platforms:

1. **Visit your Vercel URL**
   - Your application should be running and fully functional
   - Test the mesh generation and export features

2. **Visit your Render URL**
   - If you're using Render for additional services, verify they're working correctly

## Troubleshooting

If you encounter issues during deployment:

### Vercel
- Check the build logs for any errors
- Ensure all dependencies are correctly specified in package.json
- Verify that your Next.js configuration in next.config.js is correct

### Render
- Check the build and deployment logs for any errors
- Make sure the PORT environment variable is set to 10000
- Verify that your start command is correct

## Updating the Deployment

To update your deployed application:

1. Make changes to your local repository
2. Commit and push the changes to GitHub
3. Both Vercel and Render will automatically rebuild and deploy your application

## Conclusion

Your Unreal Engine Mesh Generator should now be deployed and accessible online. Users can create and export 3D meshes for Unreal Engine without needing to install anything locally. 