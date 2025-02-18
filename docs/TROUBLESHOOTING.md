# MBTI Insights Troubleshooting Guide

## Quick Start Checklist
1. Environment Setup
   - Verify `.env` file exists in server directory
   - Check all required environment variables are set:
     - `PORT=10000`
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `MISTRAL_API_KEY`
     - `NODE_ENV`

2. Starting the Application
   ```powershell
   # In PowerShell, use separate commands:
   cd client
   npm start
   
   # In a new PowerShell window:
   cd server
   npm start
   ```

## Common Issues and Solutions

### 1. Environment Variables
**Issue**: "Configuration validation failed: Missing required environment variables"
- Copy `.env.example` to `.env` in server directory
- Fill in all required values
- Restart the server

### 2. Port Conflicts
**Issue**: "Port already in use"
```powershell
# Check processes using ports
netstat -ano | findstr :3000
netstat -ano | findstr :10000

# Kill process by PID
taskkill /PID <process_id> /F
```

### 3. PowerShell Command Limitations
- Use separate commands instead of `&&`
- Run server and client in separate PowerShell windows
- Use the start script: `.\start.ps1`

### 4. ESLint Warnings
1. Unused Variables:
   - Remove unused imports
   - Add `// eslint-disable-next-line no-unused-vars` for required unused variables
   - Use all imported components or remove them

2. Missing Dependencies:
   - Add required dependencies to useEffect dependency array
   - Or add `// eslint-disable-next-line react-hooks/exhaustive-deps` if intentional

### 5. Build Issues
1. Source Map Warnings:
   - Already disabled with `GENERATE_SOURCEMAP=false`
   - If persists, clear cache: `npm run build -- --no-source-maps`

2. Node Modules Issues:
   ```powershell
   rm -r node_modules
   rm package-lock.json
   npm cache clean --force
   npm install
   ```

## Maintenance Tasks
1. Regular Updates
   - Update dependencies monthly
   - Check for security vulnerabilities: `npm audit`
   - Test application after updates

2. Code Quality
   - Run linter before commits: `npm run lint`
   - Fix warnings promptly
   - Document complex logic
   - Keep components focused and small

3. Database
   - Regular backups
   - Monitor connection issues
   - Check for performance bottlenecks

## Emergency Response
1. Application Down
   - Check server logs
   - Verify MongoDB connection
   - Check environment variables
   - Verify API keys are valid

2. Performance Issues
   - Monitor server resources
   - Check database queries
   - Review client-side rendering
   - Check network requests

## Contact & Support
- Project Owner: [Contact Information]
- Documentation Repository: [Link]
- Emergency Contact: [Contact Information] 