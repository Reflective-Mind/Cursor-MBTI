# Environment Configuration Guide
================================

This document explains how to configure the environment for the MBTI Insights application.

## Critical Values
⚠️ **IMPORTANT**: Production values are stored ONLY in `docs/CRITICAL_VALUES.md`.
DO NOT copy production values to any other files.

## Server Configuration (.env)

Required environment variables for the server:

```env
# Server port
PORT=3000  # Default development port

# MongoDB connection
MONGODB_URI=your_mongodb_uri_here

# Security
JWT_SECRET=your_jwt_secret_here

# API Keys
MISTRAL_API_KEY=your_mistral_api_key_here

# Environment
NODE_ENV=development
```

## Client Configuration (.env.production)

Required environment variables for the client in production:

```env
# API endpoints
REACT_APP_API_URL=your_api_url_here
REACT_APP_SOCKET_URL=your_socket_url_here

# Environment
NODE_ENV=production
```

## Environment Types

1. Development
   - Used for local development
   - Set `NODE_ENV=development`
   - Uses local MongoDB instance
   - Default port: 3000

2. Test
   - Used for running tests
   - Set `NODE_ENV=test`
   - Uses test database
   - Default port: 3001

3. Production
   - Used in deployment
   - Set `NODE_ENV=production`
   - Uses production database
   - Values stored in `CRITICAL_VALUES.md`

## Validation

Run these commands to validate your environment:

```bash
# Validate configuration
npm run validate-config

# Verify environment variables
npm run verify-env

# Prevent common mistakes
npm run prevent-mistakes
```

## Security Notice

1. NEVER commit `.env` files to version control
2. Production values are stored ONLY in `CRITICAL_VALUES.md`
3. Use secure random values for secrets
4. Keep API keys confidential
5. Run validation before deployment 