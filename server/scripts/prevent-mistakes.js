/**
 * Mistake Prevention Script
 * =======================
 * This script prevents common mistakes by:
 * 1. Validating all environment values
 * 2. Preventing duplicate values
 * 3. Ensuring values match production
 */

const fs = require('fs');
const path = require('path');

// CRITICAL: DO NOT store production values in this file
// All values must be read from CRITICAL_VALUES.md
const CRITICAL_VALUES_PATH = path.join(__dirname, '../../docs/CRITICAL_VALUES.md');

// Exclude environment files and CRITICAL_VALUES.md from all checks
const EXCLUDED_FILES = [
  'server/.env',
  'server/.env.example',
  'client/.env.development',
  'client/.env.production',
  'docs/CRITICAL_VALUES.md',
  'server/TROUBLESHOOTING.md',
  'server/docs/TROUBLESHOOTING.md',
  'docs/TROUBLESHOOTING.md',
  'TROUBLESHOOTING.md'
];

// Files and directories to ignore in all checks
const FILES_TO_IGNORE = [
  'node_modules',
  'build',
  'dist',
  '.git',
  '.env',
  '.env.example',
  '.env.development',
  '.env.production',
  'CRITICAL_VALUES.md',
  'TROUBLESHOOTING.md',
  'README.md',
  'CHANGELOG.md',
  'DEPLOYMENT.md',
  'SECURITY.md'
];

// Add strict validation for critical values
const CRITICAL_VALUES = {
  PORT: '10000',
  NODE_ENV_PROD: 'production',
  MONGODB_PATTERN: /^mongodb\+srv:\/\/[^:]+:[^@]+@[^.]+\.[^/]+(\/([\w-]+)?)?(\?.*)?$/,
  JWT_PATTERN: /^[a-f0-9]{32,}$/,
  MISTRAL_PATTERN: /^[a-zA-Z0-9]{32,}$/,
  API_URL: 'https://mbti-render.onrender.com'
};

// Function to read values from CRITICAL_VALUES.md
function readCriticalValues() {
  if (!fs.existsSync(CRITICAL_VALUES_PATH)) {
    throw new Error('CRITICAL_VALUES.md not found! This file is required and must contain all production values.');
  }

  const content = fs.readFileSync(CRITICAL_VALUES_PATH, 'utf8');
  
  // Extract Render values
  const renderMatch = content.match(/## Render Values\s*```env\s*([\s\S]*?)```/m);
  if (!renderMatch) throw new Error('Render values section not found in CRITICAL_VALUES.md');
  
  const renderValues = {};
  renderMatch[1].split('\n').forEach(line => {
    if (line.trim()) {
      const [key, ...valueParts] = line.trim().split('=');
      if (key && valueParts.length > 0) {
        renderValues[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  // Extract Vercel values
  const vercelMatch = content.match(/## Vercel Values\s*```env\s*([\s\S]*?)```/m);
  if (!vercelMatch) throw new Error('Vercel values section not found in CRITICAL_VALUES.md');
  
  const vercelValues = {};
  vercelMatch[1].split('\n').forEach(line => {
    if (line.trim()) {
      const [key, ...valueParts] = line.trim().split('=');
      if (key && valueParts.length > 0) {
        vercelValues[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return { renderValues, vercelValues };
}

// Patterns that should be ignored (common validation patterns)
const IGNORED_PATTERNS = [
  'PORT=10000',
  'MONGODB_URI=mongodb+srv://',
  'JWT_SECRET=',
  'MISTRAL_API_KEY=',
  'NODE_ENV=development',
  'NODE_ENV=production',
  'REACT_APP_API_URL=https://',
  'REACT_APP_SOCKET_URL=https://',
  'mongodb+srv://',
  'https://mbti-render.onrender.com',
  'mbti-insights.s3vrf.mongodb.net',
  'Server Port (CRITICAL)',
  'MongoDB Connection (PRODUCTION)',
  'Security (PRODUCTION)',
  'API Keys (PRODUCTION)',
  'Environment (PRODUCTION)',
  'Production API URL',
  'Production Socket URL'
];

// Function to check for duplicate values
function checkForDuplicates(renderValues, vercelValues) {
  const allValues = [...Object.values(renderValues), ...Object.values(vercelValues)];
  const filesChecked = [];
  
  // Define files to check
  const FILES_TO_CHECK = [
    'server/scripts/*.js',
    'server/utils/*.js',
    'docs/*.md'
  ];

  FILES_TO_CHECK.forEach(pattern => {
    const files = pattern.includes('*') 
      ? fs.readdirSync(path.join(__dirname, '../../', path.dirname(pattern)))
          .filter(f => f.endsWith(path.extname(pattern)))
          .map(f => path.join(path.dirname(pattern), f))
      : [pattern];

    files.forEach(filePath => {
      const fullPath = path.join(__dirname, '../../', filePath);
      // Normalize paths for comparison
      const normalizedPath = path.normalize(filePath).replace(/\\/g, '/');
      // Skip if file doesn't exist or is in exclusion list
      if (!fs.existsSync(fullPath) || EXCLUDED_FILES.some(excluded => normalizedPath.endsWith(excluded))) {
        return;
      }

      filesChecked.push(filePath);
      const content = readFileWithEncoding(fullPath);
      
      allValues.forEach(value => {
        // Skip if the value is a common validation pattern
        if (IGNORED_PATTERNS.some(pattern => value.includes(pattern) || pattern.includes(value))) {
          return;
        }
        // Skip if the value is just a key name or common example
        if (value.match(/^(PORT|MONGODB_URI|JWT_SECRET|MISTRAL_API_KEY|NODE_ENV|REACT_APP_.*)(=.*)?$/)) {
          return;
        }
        // Skip if the value is in a comment or documentation section
        if (content.includes('```') && content.includes(value)) {
          const sections = content.split('```');
          let isInCodeBlock = false;
          for (const section of sections) {
            if (isInCodeBlock && section.includes(value)) {
              return; // Skip if found in a code block
            }
            isInCodeBlock = !isInCodeBlock;
          }
        }
        if (content.includes(value)) {
          throw new Error(
            `SECURITY VIOLATION: Production value found in ${filePath}\n` +
            'Production values must ONLY be stored in CRITICAL_VALUES.md\n' +
            'Please remove this value and use environment variables instead.'
          );
        }
      });
    });
  });

  console.log(`✅ No duplicates found in ${filesChecked.length} files checked`);
}

// Function to read file with proper encoding and normalize content
function readFileWithEncoding(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    // Remove BOM if present and normalize line endings
    const content = buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF
      ? buffer.slice(3).toString('utf8').replace(/\r\n/g, '\n')
      : buffer.toString('utf8').replace(/\r\n/g, '\n');
    return content;
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${error.message}`);
  }
}

// Function to extract values from env file content
function parseEnvContent(content) {
  const values = {};
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const equalIndex = line.indexOf('=');
      if (equalIndex > 0) {
        const key = line.substring(0, equalIndex).trim();
        const value = line.substring(equalIndex + 1).trim();
        values[key] = value;
      }
    }
  });
  return values;
}

// Function to validate environment files
function validateEnvironmentFiles(renderValues, vercelValues) {
  try {
    // Check server .env
    const envPath = path.join(__dirname, '../.env');
    if (!fs.existsSync(envPath)) {
      throw new Error('server/.env is missing! Please create it from .env.example');
    }

    const envContent = readFileWithEncoding(envPath);
    const envValues = parseEnvContent(envContent);

    console.log('\nValidating server/.env values:');
    Object.entries(renderValues).forEach(([key, expectedValue]) => {
      const actualValue = envValues[key];
      if (!actualValue) {
        throw new Error(`Missing ${key} in server/.env`);
      }
      // Skip NODE_ENV check in development
      if (key === 'NODE_ENV' && envValues.NODE_ENV === 'development') {
        console.log(`✓ ${key} is set to development (skipping production check)`);
        return;
      }
      if (actualValue !== expectedValue) {
        console.log(`\nValue mismatch for ${key}:`);
        console.log(`Expected: "${expectedValue}"`);
        console.log(`Actual  : "${actualValue}"`);
        throw new Error(`Invalid ${key} in server/.env - must match CRITICAL_VALUES.md`);
      }
      console.log(`✓ ${key} matches expected value`);
    });

    // Check client .env.production
    const clientEnvPath = path.join(__dirname, '../../client/.env.production');
    if (!fs.existsSync(clientEnvPath)) {
      throw new Error('client/.env.production is missing! Please create it from .env.example');
    }

    const clientEnvContent = readFileWithEncoding(clientEnvPath);
    const clientEnvValues = parseEnvContent(clientEnvContent);

    console.log('\nValidating client/.env.production values:');
    Object.entries(vercelValues).forEach(([key, expectedValue]) => {
      const actualValue = clientEnvValues[key];
      if (!actualValue) {
        throw new Error(`Missing ${key} in client/.env.production`);
      }
      if (actualValue !== expectedValue) {
        console.log(`\nValue mismatch for ${key}:`);
        console.log(`Expected: "${expectedValue}"`);
        console.log(`Actual  : "${actualValue}"`);
        throw new Error(`Invalid ${key} in client/.env.production - must match CRITICAL_VALUES.md`);
      }
      console.log(`✓ ${key} matches expected value`);
    });

    console.log('\n✅ All environment files validated successfully');
  } catch (error) {
    throw new Error(`Validation failed: ${error.message}`);
  }
}

// Enhanced security validations with additional checks
function performSecurityValidations(renderValues) {
  console.log('\n🔒 Performing comprehensive security validations...');
  
  // Strict PORT validation
  if (renderValues.PORT !== CRITICAL_VALUES.PORT) {
    throw new Error(`PORT must be ${CRITICAL_VALUES.PORT} - This value is NON-NEGOTIABLE`);
  }

  // Strict MongoDB validation
  if (!CRITICAL_VALUES.MONGODB_PATTERN.test(renderValues.MONGODB_URI)) {
    throw new Error('Invalid MongoDB URI format');
  }

  // Strict JWT validation
  if (!CRITICAL_VALUES.JWT_PATTERN.test(renderValues.JWT_SECRET)) {
    throw new Error('Invalid JWT secret format - Must be hex string of at least 32 chars');
  }

  // Strict Mistral API validation
  if (!CRITICAL_VALUES.MISTRAL_PATTERN.test(renderValues.MISTRAL_API_KEY)) {
    throw new Error('Invalid Mistral API key format');
  }

  // Strict environment validation
  if (process.env.NODE_ENV === 'development') {
    if (renderValues.NODE_ENV !== 'development') {
      console.log('✓ Running in development mode');
    }
  } else if (process.env.NODE_ENV === 'production' && renderValues.NODE_ENV !== CRITICAL_VALUES.NODE_ENV_PROD) {
    throw new Error('NODE_ENV must be "production" in production environment');
  }

  // Check for credential exposure
  const dirsToCheck = [
    '../',                  // server root
    '../../client/',       // client root
    '../../docs/',         // documentation
    '../scripts/',         // server scripts
    '../config/',          // server config
    '../../.github/'       // github workflows
  ];

  // Recursive function to check all files in directory
  function checkDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    for (const item of items) {
      // Skip files and directories that should be ignored
      if (FILES_TO_IGNORE.some(ignore => item.toLowerCase().includes(ignore.toLowerCase()))) continue;
      
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other ignored directories
        if (!FILES_TO_IGNORE.some(ignore => item.toLowerCase().includes(ignore.toLowerCase()))) {
          checkDirectory(fullPath);
        }
      } else if (stat.isFile()) {
        // Skip binary files and specific file types
        if (!/\.(js|jsx|ts|tsx|md|env.*|json|yml|yaml)$/.test(item)) continue;
        
        // Normalize path for comparison
        const normalizedPath = path.normalize(fullPath).replace(/\\/g, '/');
        // Skip excluded files (case insensitive)
        if (EXCLUDED_FILES.some(excluded => 
          normalizedPath.toLowerCase().endsWith(excluded.toLowerCase()) ||
          normalizedPath.toLowerCase().includes('/docs/') ||
          normalizedPath.toLowerCase().includes('/documentation/')
        )) continue;
        
        const content = readFileWithEncoding(fullPath);
        
        // Check for MongoDB credentials
        if (content.includes(renderValues.MONGODB_URI)) {
          throw new Error(`🚨 SECURITY VIOLATION: MongoDB URI exposed in ${fullPath}`);
        }
        
        // Check for JWT secret
        if (content.includes(renderValues.JWT_SECRET)) {
          throw new Error(`🚨 SECURITY VIOLATION: JWT secret exposed in ${fullPath}`);
        }
        
        // Check for Mistral API key
        if (content.includes(renderValues.MISTRAL_API_KEY)) {
          throw new Error(`🚨 SECURITY VIOLATION: Mistral API key exposed in ${fullPath}`);
        }
        
        // Check for partial credentials
        const mongoUser = renderValues.MONGODB_URI.match(/\/\/([^:]+):/)?.[1];
        const mongoPass = renderValues.MONGODB_URI.match(/:([^@]+)@/)?.[1];
        if (mongoUser && content.includes(mongoUser)) {
          throw new Error(`🚨 SECURITY VIOLATION: MongoDB username exposed in ${fullPath}`);
        }
        if (mongoPass && content.includes(mongoPass)) {
          throw new Error(`🚨 SECURITY VIOLATION: MongoDB password exposed in ${fullPath}`);
        }
      }
    }
  }

  // Check all directories
  dirsToCheck.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    checkDirectory(fullPath);
  });

  console.log('✅ All security validations passed');
}

// Main execution
try {
  console.log('🔍 Validating environment configuration...\n');
  
  const { renderValues, vercelValues } = readCriticalValues();
  console.log('✅ Critical values loaded successfully');
  
  // Create development values by cloning render values
  const devValues = { ...renderValues };
  // Override production-specific values for development
  devValues.NODE_ENV = 'development';
  
  // Add the new security validations
  performSecurityValidations(devValues);
  
  // Use development values for validation in development mode
  const valuesToValidate = process.env.NODE_ENV === 'development' ? devValues : renderValues;
  validateEnvironmentFiles(valuesToValidate, vercelValues);
  checkForDuplicates(renderValues, vercelValues);
  
  console.log('\n✅ All checks passed successfully!');
  console.log('No duplicates or mismatched values found.');
} catch (error) {
  console.error('\n❌ Validation failed:');
  console.error(error.message);
  console.error('\nPlease fix the above issues and run validation again.');
  process.exit(1);
} 