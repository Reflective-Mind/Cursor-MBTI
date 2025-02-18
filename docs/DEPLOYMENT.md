# Deployment Guide
===============

This document explains how to deploy the MBTI Insights application.

## Critical Values
⚠️ **IMPORTANT**: Production values are stored ONLY in `docs/CRITICAL_VALUES.md`.
DO NOT copy production values to any other files.

## Deployment Platforms

1. Server (Render.com)
   - Platform: Render.com
   - Type: Web Service
   - Environment: Node.js
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

2. Client (Vercel)
   - Platform: Vercel
   - Type: Static Site
   - Framework: React
   - Build Command: `npm run build`
   - Output Directory: `build`

## Environment Setup

1. Server (Render.com)
   - Copy values from `CRITICAL_VALUES.md`
   - Set all required environment variables
   - Verify configuration before deployment

2. Client (Vercel)
   - Copy values from `CRITICAL_VALUES.md`
   - Set API and Socket URLs
   - Verify proxy configuration

## Deployment Steps

1. Prepare for Deployment
   ```bash
   # Validate configuration
   npm run validate-config
   
   # Verify environment
   npm run verify-env
   
   # Prevent mistakes
   npm run prevent-mistakes
   ```

2. Deploy Server
   ```bash
   # Push to main branch
   git push origin main
   
   # Render will auto-deploy
   ```

3. Deploy Client
   ```bash
   # Push to main branch
   git push origin main
   
   # Vercel will auto-deploy
   ```

## Validation

After deployment:
1. Check server health endpoint
2. Verify client connection
3. Test WebSocket functionality
4. Monitor error logs
5. Check database connectivity

## Security Notice

1. NEVER commit `.env` files
2. Keep API keys secure
3. Use HTTPS only
4. Enable security headers
5. Monitor access logs

## Troubleshooting

1. Server Issues
   - Check Render.com logs
   - Verify environment variables
   - Test database connection

2. Client Issues
   - Check Vercel logs
   - Verify API endpoints
   - Test proxy configuration

3. Connection Issues
   - Verify CORS settings
   - Check WebSocket config
   - Test API connectivity

## Rollback Procedure

1. Identify the issue
2. Revert to last working commit
3. Push revert commit
4. Monitor deployment
5. Verify functionality

Remember: Always refer to `CRITICAL_VALUES.md` for production values. 