# Troubleshooting Guide
====================

## Common Issues

### 1. Environment Configuration

#### Missing Environment Variables
```bash
Error: Missing required environment variables
```
**Solution:**
1. Copy `.env.example` to `.env`
2. Fill in all required values
3. Run `npm run validate-config`

#### Invalid Configuration
```bash
Error: Invalid PORT configuration
```
**Solution:**
1. Ensure PORT is set to 10000
2. Check proxy settings match
3. Verify no port conflicts

### 2. Database Connection

#### Connection Failed
```bash
Error: MongoNetworkError
```
**Solution:**
1. Verify MONGODB_URI in `.env`
2. Check network connectivity
3. Validate database credentials

#### Authentication Failed
```bash
Error: MongoAuthError
```
**Solution:**
1. Check database username/password
2. Verify database access rights
3. Update credentials if needed

### 3. API Integration

#### Mistral API Issues
```bash
Error: Invalid API Key
```
**Solution:**
1. Verify MISTRAL_API_KEY in `.env`
2. Check API key format
3. Ensure API subscription active

#### WebSocket Connection
```bash
Error: Socket connection failed
```
**Solution:**
1. Check SOCKET_URL configuration
2. Verify server is running
3. Check for firewall issues

### 4. Build Problems

#### Client Build Failed
```bash
Error: Build failed
```
**Solution:**
1. Clear node_modules and package-lock.json
2. Run `npm install`
3. Try build again

#### Server Start Failed
```bash
Error: Cannot start server
```
**Solution:**
1. Check PORT availability
2. Verify environment setup
3. Run validation scripts

### 5. Security Issues

#### JWT Errors
```bash
Error: Invalid token
```
**Solution:**
1. Check JWT_SECRET length
2. Verify token expiration
3. Clear client storage

#### CORS Problems
```bash
Error: CORS policy violation
```
**Solution:**
1. Check allowed origins
2. Verify proxy settings
3. Update CORS configuration

## Validation Steps

### 1. Environment
```bash
npm run validate-config
```

### 2. Database
```bash
npm run verify-db
```

### 3. API
```bash
npm run test-api
```

## Emergency Procedures

### 1. Service Recovery
1. Check logs
2. Verify configurations
3. Restart services
4. Monitor status

### 2. Data Recovery
1. Access backups
2. Verify integrity
3. Restore data
4. Validate system

## Contact Support

### Development Team
- Email: dev@mbti-insights.com
- Hours: 9 AM - 5 PM EST

### Emergency Contact
- Phone: 1-800-MBTI-HELP
- Available 24/7

Remember: Always check logs first and document any issues encountered. 