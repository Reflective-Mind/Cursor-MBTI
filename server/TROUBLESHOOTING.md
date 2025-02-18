# MBTI Insights - Troubleshooting Guide
=====================================

## Quick Start Checklist
1. Environment Setup
2. Server Configuration
3. Client Configuration
4. Common Issues
5. Error Resolution

## 1. Environment Setup
### Required Files
- `server/.env`
- `client/.env.development` (for development)
- `client/.env.production` (for production)

### Environment Variables
Server (`.env`):
```env
PORT=10000
MONGODB_URI=mongodb+srv://keneide91:3N6L1x0jeIhVX5wP@mbti-insights.s3vrf.mongodb.net/?retryWrites=true&w=majority&appName=mbti-insights
JWT_SECRET=cd06a943f7e3a56b2f7c8836736c0d6f2e3b58f9c742a563
MISTRAL_API_KEY=pjTVzQVIZyYNzWj7mjm5aysVYippTADy
NODE_ENV=production
```

Client (`.env.development`):
```env
REACT_APP_API_URL=http://localhost:10000
REACT_APP_SOCKET_URL=http://localhost:10000
NODE_ENV=development
```

## 2. Server Configuration
### Port Configuration
- Server MUST run on port 10000 (standardized)
- Verify in `server/.env`: `PORT=10000`
- Cross-check in `client/package.json`: `"proxy": "http://localhost:10000"`

### Database Connection
- MongoDB connection string must be valid
- Format: `mongodb+srv://[username]:[password]@[cluster]`
- Test connection before starting server

### JWT Configuration
- Secret key must be at least 32 characters
- Must be consistent across restarts
- Store securely, never commit to version control

## 3. Client Configuration
### Proxy Settings
- Must match server port (10000)
- Set in `client/package.json`
- Verify `"proxy": "http://localhost:10000"`

### API URLs
- Development: `http://localhost:10000`
- Production: `https://mbti-render.onrender.com`
- Must match in all configuration files

## 4. Common Issues

### "Failed to fetch" Error
Causes:
1. Server not running
2. Port mismatch
3. CORS issues
4. Network connectivity

Resolution:
1. Start server: `cd server && npm start`
2. Verify port in all config files
3. Check CORS configuration
4. Test network connectivity

### Connection Refused
Causes:
1. Server not running on expected port
2. Firewall blocking connection
3. Port already in use
4. Environment variables missing

Resolution:
1. Check server logs
2. Verify environment variables
3. Test port availability
4. Check firewall settings

### React Router Warnings
Current Warnings:
1. Unsupported style property
2. Future flag warnings
3. Context loss in WebGL

Resolution:
1. Update style syntax in App.js
2. Add future flags configuration
3. Handle WebGL context loss

## 5. Error Resolution

### Environment Variables Missing
If you see: "Missing required environment variables":
1. Copy `.env.example` to `.env`
2. Fill in all required values
3. Restart server
4. Verify with `npm run validate-env`

### Authentication Errors
If login fails:
1. Check server logs
2. Verify JWT_SECRET
3. Test database connection
4. Validate user credentials

### CORS Issues
If seeing CORS errors:
1. Verify proxy setting
2. Check API URL configuration
3. Ensure server CORS middleware
4. Test with correct headers

## Startup Sequence
1. Start Server:
```bash
cd server
npm install
npm start
```

2. Start Client:
```bash
cd client
npm install
npm start
```

3. Verify:
- Server running on port 10000
- Client running on port 3000
- MongoDB connected
- WebSocket connected

## Documentation Standards
1. All changes must be documented
2. Update relevant configuration files
3. Test all affected components
4. Add validation checks
5. Update this guide as needed

## Configuration Validation
Run validation checks:
```bash
cd server
npm run validate-config
```

This will:
1. Check all environment variables
2. Validate port configurations
3. Test database connection
4. Verify JWT settings
5. Check cross-component compatibility

## Emergency Contacts
1. Development Team Lead
2. Database Administrator
3. DevOps Engineer
4. Security Team

## Version Control
- Document all changes
- Include configuration updates
- Test before committing
- Update documentation

Remember: Documentation is crucial for maintaining system integrity.

## Common Issues and Solutions

### Environment Configuration

#### Example Environment Setup
```env
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.example.net/dbname
JWT_SECRET=example_jwt_secret_key_replace_in_production
MISTRAL_API_KEY=your_mistral_api_key_here
NODE_ENV=development
```

### MongoDB Connection Issues

#### MongoDB URI Format
- Format: `mongodb+srv://[username]:[password]@[cluster]`
- Example: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`

Common issues:
1. Invalid credentials
2. IP not whitelisted
3. Database user lacks proper permissions

### API Endpoints

#### Development
- Local API: `http://localhost:3000`
- Local WebSocket: `ws://localhost:3000`

#### Production
- API: Use the URL from your deployment platform
- WebSocket: Use the URL from your deployment platform

### Authentication Issues

1. JWT Token not provided
2. Invalid JWT Secret
3. Token expired

### API Key Issues

1. Invalid Mistral API Key
2. Rate limiting
3. Insufficient permissions

For detailed setup instructions, refer to the main documentation in `/docs`. 