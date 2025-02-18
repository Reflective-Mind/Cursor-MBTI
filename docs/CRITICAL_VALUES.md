# CRITICAL VALUES - SINGLE SOURCE OF TRUTH
=========================================
⚠️ CRITICAL: This is the ONLY place where production values should be stored.
DO NOT copy these values to any other files.

## Render Values
```env
PORT=10000
MONGODB_URI=mongodb+srv://keneide91:3N6L1x0jeIhVX5wP@mbti-insights.s3vrf.mongodb.net/?retryWrites=true&w=majority&appName=mbti-insights
JWT_SECRET=cd06a943f7e3a56b2f7c8836736c0d6f2e3b58f9c742a563
MISTRAL_API_KEY=pjTVzQVIZyYNzWj7mjm5aysVYippTADy
NODE_ENV=production
```

## Vercel Values
```env
REACT_APP_API_URL=https://mbti-render.onrender.com
REACT_APP_SOCKET_URL=https://mbti-render.onrender.com
NODE_ENV=production
```

## Security Notice
⚠️ CRITICAL: This file is the ONLY place where production values should be stored.
1. DO NOT copy these values to any other files
2. DO NOT duplicate these values in code or documentation
3. Any changes to these values require project owner approval
4. Run `npm run prevent-mistakes` to validate no duplicates exist

## Validation
To ensure no duplicates exist:
```bash
npm run prevent-mistakes
```

## Change Log
- March 2024: Initial setup, synchronized with Render.com and Vercel deployments
- Last updated: March 2024

## Production URLs
- Server API: https://mbti-render.onrender.com
- WebSocket: https://mbti-render.onrender.com
- Database: mbti-insights.s3vrf.mongodb.net

## Critical Rules
1. PORT must be 10000 in ALL environments
2. Production values must not be duplicated
3. Example files must use placeholders
4. Test environment must use test credentials

## File Locations
- Production values: ONLY in this file
- Development setup: See .env.example files
- Test setup: See test/.env.test.example

## Security Notice
⚠️ NEVER commit these values to version control
⚠️ NEVER copy these values to other files
⚠️ NEVER use these values in development

## Protected Values
These values are LOCKED and synchronized with production deployments.
DO NOT modify these values without explicit permission from the project owner.

## Production Environment Variables

### Server (Render.com)
```env
# Server Port (CRITICAL)
PORT=10000  # This is the ONLY allowed port number

# MongoDB Connection (PRODUCTION)
MONGODB_URI=mongodb+srv://keneide91:3N6L1x0jeIhVX5wP@mbti-insights.s3vrf.mongodb.net/?retryWrites=true&w=majority&appName=mbti-insights

# Security (PRODUCTION)
JWT_SECRET=cd06a943f7e3a56b2f7c8836736c0d6f2e3b58f9c742a563

# API Keys (PRODUCTION)
MISTRAL_API_KEY=pjTVzQVIZyYNzWj7mjm5aysVYippTADy

# Environment (PRODUCTION)
NODE_ENV=production
```

### Client (Vercel)
```env
# Production API URL
REACT_APP_API_URL=https://mbti-render.onrender.com

# Production Socket URL
REACT_APP_SOCKET_URL=https://mbti-render.onrender.com

# Environment (PRODUCTION)
NODE_ENV=production
```

## Deployment Platforms
- Server: Render.com
- Client: Vercel
- Database: MongoDB Atlas

## Security Notice
⚠️ These values are synchronized with deployment platforms.
DO NOT modify these values unless explicitly authorized.
All changes must follow the change management protocol.

## For Local Development
See `.env.example` files in the server and client directories for development setup.
Never use production credentials in development environments.

## File Locations (DO NOT MODIFY)

### Environment Files
```
project_root/
├── server/
│   ├── .env                 # Server production values
│   ├── .env.example        # Template (no real values)
│   └── test/
│       └── .env.test       # Test configuration
└── client/
    ├── .env.development    # Development settings
    └── .env.production     # Production settings
```

### Documentation Files
```
project_root/
├── docs/
│   ├── CRITICAL_VALUES.md  # This file (Single source of truth)
│   └── ENVIRONMENT.md      # Environment setup guide
└── server/
    └── docs/
        └── DEPLOYMENT.md   # Deployment procedures
```

## Validation Rules

### 1. Port Configuration
- Server MUST run on port 10000
- This is non-negotiable and standardized across all environments
- Client proxy MUST match this port

### 2. Environment Variables
- Production values are LOCKED
- Development can use different values
- Test environment has its own configuration

### 3. API URLs
- Production: https://mbti-render.onrender.com
- Development: http://localhost:10000
- No other values are allowed in production

## Change Protocol

### 1. Value Changes
- MUST be approved by project owner
- MUST be updated in all deployment platforms
- MUST be documented in change log
- MUST pass all validation tests

### 2. File Changes
- NO duplication of environment files
- NO storing of credentials in version control
- NO modification of production values
- NO creation of additional config files

### 3. Documentation Changes
- MUST maintain single source of truth
- MUST update all related documentation
- MUST validate cross-references
- MUST keep change log current

## Change Log

### March 2024
- Standardized port to 10000
- Locked production configuration values
- Established single source of truth
- Implemented validation system

## Validation Commands

### Verify Configuration
```bash
npm run validate-config
```

### Verify Environment
```bash
npm run verify-env
```

## Emergency Procedures

If critical values are compromised:
1. Contact project owner IMMEDIATELY
2. DO NOT modify any values
3. Document the incident
4. Await explicit instructions

## AI Assistant Instructions

For AI Assistants working with this codebase:
1. NEVER modify critical values
2. ALWAYS verify against this document
3. NEVER create duplicate configurations
4. ALWAYS use validation scripts
5. NEVER store credentials in code
6. ALWAYS follow the change protocol

Remember: This document is the SINGLE SOURCE OF TRUTH.
All changes must be validated against these specifications. 