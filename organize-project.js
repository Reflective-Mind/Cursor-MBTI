/**
 * Project Organization Script
 * =========================
 * Organizes project files into proper structure
 * and removes duplications.
 */

const fs = require('fs');
const path = require('path');

const PROJECT_STRUCTURE = {
  root: {
    docs: [
      'README.md',
      'ENVIRONMENT_STRUCTURE.md',
      'CONTRIBUTING.md'
    ],
    config: [
      '.env',
      '.gitignore'
    ]
  },
  server: {
    docs: [
      'ENVIRONMENT.md',
      'TROUBLESHOOTING.md',
      'API.md',
      'SECURITY.md',
      'DEPLOYMENT.md'
    ],
    config: [
      '.env',
      '.env.example'
    ],
    scripts: [
      'verify-env.js',
      'validate-config.js',
      'cleanup.js'
    ],
    test: {
      config: [
        '.env.test'
      ]
    }
  },
  client: {
    docs: [
      'COMPONENTS.md',
      'ROUTING.md',
      'STATE.md',
      'DEPLOYMENT.md'
    ],
    config: [
      '.env.development',
      '.env.production'
    ]
  }
};

// Files to be removed (duplicates or unnecessary)
const FILES_TO_REMOVE = [
  'server/AI_DOCUMENTATION_GUIDE.md',
  'CONFIGURATION_WARNING.md',
  'client/.env'  // Should only use .env.development and .env.production
];

function createDirectoryStructure() {
  // Create directories
  const createDirs = (structure, basePath = '') => {
    Object.entries(structure).forEach(([dir, content]) => {
      const fullPath = path.join(basePath, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }

      if (typeof content === 'object' && !Array.isArray(content)) {
        createDirs(content, fullPath);
      }
    });
  };

  createDirs(PROJECT_STRUCTURE);
}

function removeUnnecessaryFiles() {
  FILES_TO_REMOVE.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`Removed: ${file}`);
    }
  });
}

function organizeFiles() {
  // Implementation for moving files to correct locations
  // This would be implemented based on the actual files in the project
  console.log('File organization would happen here');
}

function validateStructure() {
  // Validate the new structure
  const validateDir = (structure, basePath = '') => {
    Object.entries(structure).forEach(([dir, content]) => {
      const fullPath = path.join(basePath, dir);
      if (!fs.existsSync(fullPath)) {
        console.error(`Missing directory: ${fullPath}`);
      }

      if (Array.isArray(content)) {
        content.forEach(file => {
          const filePath = path.join(fullPath, file);
          if (!fs.existsSync(filePath)) {
            console.warn(`Missing file: ${filePath}`);
          }
        });
      } else if (typeof content === 'object') {
        validateDir(content, fullPath);
      }
    });
  };

  validateDir(PROJECT_STRUCTURE);
}

// Run organization
console.log('Starting project organization...');
createDirectoryStructure();
removeUnnecessaryFiles();
organizeFiles();
validateStructure();
console.log('Project organization complete.'); 