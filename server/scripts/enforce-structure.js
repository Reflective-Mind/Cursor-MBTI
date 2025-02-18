/**
 * Project Structure Enforcement Script
 * ==================================
 * CRITICAL: This script enforces project structure and removes duplicates.
 * Run this script to maintain project integrity.
 */

const fs = require('fs');
const path = require('path');

// CRITICAL: DO NOT STORE PRODUCTION VALUES HERE
// All production values MUST be stored ONLY in docs/CRITICAL_VALUES.md
const CRITICAL_VALUES_PATH = '../../docs/CRITICAL_VALUES.md';

// Files that MUST be removed if found in wrong locations
const FORBIDDEN_LOCATIONS = [
  {
    file: '.env',
    location: 'client/',
    reason: 'Client should only use .env.development and .env.production'
  },
  {
    file: 'CONFIGURATION_WARNING.md',
    location: './',
    reason: 'Use docs/CRITICAL_VALUES.md instead'
  },
  {
    file: 'AI_DOCUMENTATION_GUIDE.md',
    location: 'server/',
    reason: 'AI documentation is in docs/CRITICAL_VALUES.md'
  }
];

// Files that MUST exist in specific locations
const REQUIRED_FILES = {
  'server/.env.example': {
    required: true,
    patterns: [
      'PORT',
      'MONGODB_URI',
      'JWT_SECRET',
      'MISTRAL_API_KEY',
      'NODE_ENV'
    ]
  },
  'client/.env.production': {
    required: true,
    patterns: [
      'REACT_APP_API_URL',
      'REACT_APP_SOCKET_URL',
      'NODE_ENV'
    ]
  },
  'docs/CRITICAL_VALUES.md': {
    required: true,
    patterns: [
      'Render values',
      'Vercel values',
      'Security Notice',
      'Change Log'
    ]
  }
};

// Required directory structure
const REQUIRED_STRUCTURE = {
  docs: {
    files: ['CRITICAL_VALUES.md', 'ENVIRONMENT.md', 'DEPLOYMENT.md']
  },
  server: {
    docs: {
      files: ['TROUBLESHOOTING.md']
    },
    scripts: {
      files: ['prevent-mistakes.js', 'validate-config.js', 'enforce-structure.js']
    },
    test: {
      files: ['.env.test']
    },
    files: ['.env.example']
  },
  client: {
    files: ['.env.development', '.env.production']
  }
};

// Read values from CRITICAL_VALUES.md instead of hardcoding them
function getCriticalValuesFromFile() {
  const criticalValuesPath = path.join(__dirname, '../../docs/CRITICAL_VALUES.md');
  if (!fs.existsSync(criticalValuesPath)) {
    throw new Error('CRITICAL_VALUES.md not found! This file is required for validation.');
  }

  const content = fs.readFileSync(criticalValuesPath, 'utf8');
  
  // Extract Render values
  const renderMatch = content.match(/Render values:[\s\S]*?```[\s\S]*?(PORT=.*?)```/m);
  if (!renderMatch) throw new Error('Render values section not found in CRITICAL_VALUES.md');
  
  const renderValues = {};
  renderMatch[1].split('\n').forEach(line => {
    const [key, value] = line.trim().split('=');
    if (key && value) renderValues[key] = value;
  });

  // Extract Vercel values
  const vercelMatch = content.match(/Vercel values:[\s\S]*?```[\s\S]*?(REACT_APP.*?)```/m);
  if (!vercelMatch) throw new Error('Vercel values section not found in CRITICAL_VALUES.md');
  
  const vercelValues = {};
  vercelMatch[1].split('\n').forEach(line => {
    const [key, value] = line.trim().split('=');
    if (key && value) vercelValues[key] = value;
  });

  return { renderValues, vercelValues };
}

// Files that should not exist (to prevent duplicates)
const FORBIDDEN_FILES = [
  'server/.env.production',
  'client/.env',
  'server/CRITICAL_VALUES.md',
  'client/CRITICAL_VALUES.md'
];

function removeForbiddenFiles() {
  console.log('\nChecking for forbidden file locations...');
  FORBIDDEN_FILES.forEach((file) => {
    const fullPath = path.join(__dirname, '../../', file);
    if (fs.existsSync(fullPath)) {
      console.log(`Removing ${file}: ${FORBIDDEN_FILES[file]}`);
      fs.unlinkSync(fullPath);
    }
  });
}

function verifyRequiredFiles() {
  console.log('\nVerifying required files...');
  Object.entries(REQUIRED_FILES).forEach(([filePath, config]) => {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      if (config.required) {
        console.error(`MISSING REQUIRED FILE: ${filePath}`);
      }
    } else {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check for required patterns
      config.patterns.forEach(pattern => {
        if (!content.includes(pattern)) {
          console.error(`MISSING REQUIRED PATTERN: ${pattern} in ${filePath}`);
        }
      });
    }
  });
}

function verifyDirectoryStructure(structure = REQUIRED_STRUCTURE, basePath = '') {
  console.log('\nVerifying directory structure...');
  Object.entries(structure).forEach(([dir, content]) => {
    const fullPath = path.join(process.cwd(), basePath, dir);
    
    if (content.files) {
      content.files.forEach(file => {
        const filePath = path.join(fullPath, file);
        if (!fs.existsSync(filePath)) {
          console.error(`MISSING REQUIRED FILE: ${filePath}`);
        }
      });
    }

    if (typeof content === 'object' && !content.files) {
      verifyDirectoryStructure(content, path.join(basePath, dir));
    }
  });
}

function checkForDuplicateEnvFiles() {
  console.log('\nChecking for duplicate environment files...');
  const envFiles = [];
  
  function findEnvFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        findEnvFiles(fullPath);
      } else if (file.startsWith('.env')) {
        envFiles.push(fullPath);
      }
    });
  }

  findEnvFiles(process.cwd());
  
  // Check for duplicates
  const locations = {};
  envFiles.forEach(file => {
    const name = path.basename(file);
    if (!locations[name]) {
      locations[name] = [];
    }
    locations[name].push(file);
  });

  Object.entries(locations).forEach(([name, files]) => {
    if (files.length > 1) {
      console.error(`DUPLICATE ENV FILE ${name} found in:`);
      files.forEach(file => console.error(`  - ${file}`));
    }
  });
}

function validateCriticalValues() {
  console.log('\nValidating critical values...');
  const { renderValues, vercelValues } = getCriticalValuesFromFile();
  
  // Validate required patterns exist without actual values
  const requiredPatterns = [
    'PORT',
    'MONGODB_URI',
    'JWT_SECRET',
    'MISTRAL_API_KEY',
    'REACT_APP_API_URL'
  ];

  const criticalValuesPath = path.join(process.cwd(), 'docs/CRITICAL_VALUES.md');
  if (!fs.existsSync(criticalValuesPath)) {
    console.error('CRITICAL: docs/CRITICAL_VALUES.md is missing!');
    return;
  }

  const content = fs.readFileSync(criticalValuesPath, 'utf8');
  requiredPatterns.forEach(pattern => {
    if (!content.includes(pattern)) {
      console.error(`CRITICAL VALUE MISSING: ${pattern}`);
    }
  });
}

// Enforce project structure
function enforceStructure() {
  try {
    console.log('Enforcing project structure...');
    
    // Get critical values
    const { renderValues, vercelValues } = getCriticalValuesFromFile();
    
    // Check each required file
    Object.entries(REQUIRED_FILES).forEach(([filePath, config]) => {
      const fullPath = path.join(__dirname, '../../', filePath);
      
      if (!fs.existsSync(fullPath)) {
        if (config.required) {
          throw new Error(`Required file missing: ${filePath}`);
        }
        return;
      }

      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check for required patterns
      config.patterns.forEach(pattern => {
        if (!content.includes(pattern)) {
          throw new Error(`Missing required pattern "${pattern}" in ${filePath}`);
        }
      });
      
      // Special check for CRITICAL_VALUES.md
      if (filePath === 'docs/CRITICAL_VALUES.md') {
        // This is our source of truth, no need to validate values
        return;
      }
      
      // Check for duplicate production values
      if (filePath !== 'docs/CRITICAL_VALUES.md') {
        Object.values(renderValues).forEach(value => {
          if (content.includes(value)) {
            throw new Error(
              `SECURITY VIOLATION: Production value found in ${filePath}. ` +
              'Production values must ONLY be stored in CRITICAL_VALUES.md'
            );
          }
        });
        
        Object.values(vercelValues).forEach(value => {
          if (content.includes(value)) {
            throw new Error(
              `SECURITY VIOLATION: Production value found in ${filePath}. ` +
              'Production values must ONLY be stored in CRITICAL_VALUES.md'
            );
          }
        });
      }
    });

    console.log('✅ Project structure verified successfully');
  } catch (error) {
    console.error('❌ Structure verification failed:', error.message);
    process.exit(1);
  }
}

// Run enforcement
console.log('=== Starting Project Structure Enforcement ===');
removeForbiddenFiles();
verifyRequiredFiles();
verifyDirectoryStructure();
checkForDuplicateEnvFiles();
validateCriticalValues();
enforceStructure();
console.log('\n=== Enforcement Complete ==='); 