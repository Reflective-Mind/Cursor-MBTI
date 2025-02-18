# MBTI Insights Project
=====================

## Project Structure
```
project_root/
├── docs/                          # Project documentation
│   ├── ENVIRONMENT_STRUCTURE.md   # Environment setup guide
│   └── CONTRIBUTING.md           # Contribution guidelines
├── server/                        # Backend server
│   ├── docs/                     # Server documentation
│   ├── src/                      # Source code
│   ├── test/                     # Test files
│   ├── scripts/                  # Utility scripts
│   └── config/                   # Configuration files
└── client/                        # Frontend client
    ├── docs/                     # Client documentation
    ├── src/                      # React source code
    ├── public/                   # Static files
    └── config/                   # Client configuration
```

## Environment Configuration

### Server Environment Files
- `server/.env`: Main server configuration
- `server/.env.example`: Template for setup
- `server/test/.env.test`: Test configuration

### Client Environment Files
- `client/.env.development`: Development settings
- `client/.env.production`: Production settings

## Documentation Structure

### Project Documentation
- `docs/`: Project-level documentation
- `server/docs/`: Server-specific docs
- `client/docs/`: Client-specific docs

### Code Documentation
- Component documentation in code
- API documentation in server
- Test documentation in test files

## Development Setup

1. Clone repository
2. Copy environment files:
   ```bash
   cp server/.env.example server/.env
   cp client/.env.development.example client/.env.development
   ```
3. Install dependencies:
   ```bash
   # Server
   cd server && npm install
   
   # Client
   cd client && npm install
   ```
4. Start development servers:
   ```bash
   # Server
   cd server && npm run dev
   
   # Client
   cd client && npm start
   ```

## Configuration Validation

Run the validation script:
```bash
cd server && npm run validate-config
```

This will:
1. Verify environment files
2. Check configuration values
3. Validate cross-component compatibility
4. Test database connection

## Project Organization

The project follows a strict organization:
1. No duplicate files
2. Clear separation of concerns
3. Proper documentation
4. Regular validation

### File Locations
- Configuration files in respective directories
- Documentation in docs folders
- Source code in src directories
- Tests in test directories

### Maintenance Rules
1. Keep documentation updated
2. Remove duplications
3. Validate configurations
4. Follow structure guidelines

## Security

- No credentials in version control
- Use environment variables
- Follow security guidelines
- Regular security audits

## Contributing

See `CONTRIBUTING.md` for:
- Code standards
- Pull request process
- Documentation requirements
- Testing guidelines

## License

MIT License - See LICENSE file

## Support

For issues:
1. Check documentation
2. Search existing issues
3. Create detailed bug report
4. Follow templates 