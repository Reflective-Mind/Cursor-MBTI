/**
 * Configuration Validator Utility
 * =============================
 * 
 * CRITICAL: This utility ensures the integrity of all system configurations.
 * Any changes to this file must be thoroughly tested and documented.
 * 
 * Purpose:
 * - Validate all critical configuration settings
 * - Ensure cross-component compatibility
 * - Prevent common configuration errors
 * - Maintain security standards
 * 
 * Change Log:
 * ----------
 * 2024-03: Added proxy validation
 * 
 * @lastValidated March 2024
 * @maintainer Development Team
 */

const fs = require('fs');
const path = require('path');

// Function to read critical values from the single source of truth
function getCriticalValues() {
  const criticalValuesPath = path.join(__dirname, '../../docs/CRITICAL_VALUES.md');
  
  if (!fs.existsSync(criticalValuesPath)) {
    throw new Error('CRITICAL_VALUES.md not found! This file is required for validation.');
  }

  const content = fs.readFileSync(criticalValuesPath, 'utf8');
  
  // Extract Render values
  const renderMatch = content.match(/## Render Values\s*```env\s*([\s\S]*?)```/m);
  if (!renderMatch) throw new Error('Render values section not found in CRITICAL_VALUES.md');
  
  const renderValues = {};
  renderMatch[1].split('\n').forEach(line => {
    const [key, value] = line.trim().split('=');
    if (key && value) renderValues[key] = value;
  });

  return renderValues;
}

// Function to validate production values
function validateProductionValues(env) {
  const criticalValues = getCriticalValues();
  Object.entries(criticalValues).forEach(([key, value]) => {
    if (env[key] !== value) {
      throw new Error(`Invalid ${key} - must match production value in CRITICAL_VALUES.md`);
    }
  });
}

// Function to validate client values
function validateClientValues(env) {
  const content = fs.readFileSync(path.join(__dirname, '../../docs/CRITICAL_VALUES.md'), 'utf8');
  
  const vercelMatch = content.match(/## Vercel Values\s*```env\s*([\s\S]*?)```/m);
  if (!vercelMatch) throw new Error('Vercel values section not found in CRITICAL_VALUES.md');
  
  const vercelValues = {};
  vercelMatch[1].split('\n').forEach(line => {
    const [key, value] = line.trim().split('=');
    if (key && value) vercelValues[key] = value;
  });

  Object.entries(vercelValues).forEach(([key, value]) => {
    if (env[key] !== value) {
      throw new Error(`Invalid ${key} - must match production value in CRITICAL_VALUES.md`);
    }
  });
}

class ConfigValidator {
  static REQUIRED_ENV_VARS = [
    'PORT',
    'MONGODB_URI',
    'JWT_SECRET',
    'MISTRAL_API_KEY',
    'NODE_ENV'
  ];

  static ALLOWED_ENVIRONMENTS = ['development', 'test', 'production'];
  static REQUIRED_PORT = 10000; // Standardized port number
  static MIN_JWT_LENGTH = 32;

  /**
   * Validates all critical configurations
   * @throws {Error} If any validation fails
   */
  static validateAll() {
    this.validateEnvironmentVariables();
    this.validatePortConfigurations();
    this.validateSecuritySettings();
    this.validateCrossComponentCompatibility();
    this.validateProductionValues();
  }

  /**
   * Validates required environment variables
   * @throws {Error} If any required variables are missing or invalid
   */
  static validateEnvironmentVariables() {
    const missingVars = this.REQUIRED_ENV_VARS.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    if (!this.ALLOWED_ENVIRONMENTS.includes(process.env.NODE_ENV)) {
      throw new Error(`Invalid NODE_ENV: ${process.env.NODE_ENV}. Must be one of: ${this.ALLOWED_ENVIRONMENTS.join(', ')}`);
    }
  }

  /**
   * Validates port configurations
   * @throws {Error} If port configuration is invalid
   */
  static validatePortConfigurations() {
    const port = parseInt(process.env.PORT);
    
    if (port !== this.REQUIRED_PORT) {
      throw new Error(
        `Invalid PORT configuration: ${port}. ` +
        `PORT MUST be ${this.REQUIRED_PORT}. This is non-negotiable and standardized across all environments.`
      );
    }
    console.log(`✓ Port validated: ${port}`);
  }

  /**
   * Validates security-related configurations
   * @throws {Error} If security settings are invalid
   */
  static validateSecuritySettings() {
    // Validate JWT secret
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < this.MIN_JWT_LENGTH) {
      throw new Error(`JWT_SECRET must be at least ${this.MIN_JWT_LENGTH} characters long`);
    }

    // Validate MongoDB URI format
    const mongoUriPattern = /^mongodb\+srv:\/\/[^:]+:[^@]+@[^.]+\.[^/]+(\/([\w-]+)?)?(\?.*)?$/;
    if (!mongoUriPattern.test(process.env.MONGODB_URI)) {
      throw new Error('Invalid MONGODB_URI format. Expected format: mongodb+srv://username:password@cluster.domain.net/[database]?options');
    }

    // Validate Mistral API key
    const mistralKeyPattern = /^[A-Za-z0-9]{32}$/;
    if (!process.env.MISTRAL_API_KEY || !mistralKeyPattern.test(process.env.MISTRAL_API_KEY)) {
      throw new Error('Invalid MISTRAL_API_KEY format - must be exactly 32 alphanumeric characters');
    }
  }

  /**
   * Validates cross-component compatibility
   * @throws {Error} If components are not compatible
   */
  static validateCrossComponentCompatibility() {
    const serverPort = process.env.PORT;
    
    // Validate socket configuration
    const ALLOWED_ORIGINS = [
      'http://localhost:3000',
      process.env.REACT_APP_API_URL || 'https://mbti-insights.vercel.app'
    ];

    // In development mode, we don't need to check for localhost:10000 in allowed origins
    if (process.env.NODE_ENV === 'development') {
      console.log('✓ Socket configuration valid for development');
      return;
    }

    // Only check socket configuration in production
    if (!ALLOWED_ORIGINS.includes(`http://localhost:${serverPort}`)) {
      throw new Error(`Socket configuration must include server port ${serverPort}`);
    }

    // Validate proxy configuration
    try {
      const packageJson = require('../../client/package.json');
      const proxyUrl = packageJson.proxy;
      
      if (!proxyUrl) {
        console.warn('WARNING: No proxy configuration found in client/package.json');
        return;
      }

      const proxyPort = new URL(proxyUrl).port;
      if (proxyPort !== serverPort) {
        console.warn(`WARNING: Proxy port (${proxyPort}) does not match server port (${serverPort})`);
        console.warn('This may cause API requests to fail. Please update the proxy in client/package.json');
      }
    } catch (error) {
      console.warn('Could not validate proxy configuration:', error.message);
    }
  }

  /**
   * Validates production values
   * @throws {Error} If production values are invalid
   */
  static validateProductionValues() {
    if (process.env.NODE_ENV === 'production') {
      validateProductionValues(process.env);
    }
  }

  /**
   * Logs current configuration status
   */
  static logConfigurationStatus() {
    console.log('\n=== Configuration Status ===');
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Server Port: ${process.env.PORT}`);
    console.log(`MongoDB: ${this._maskSensitiveInfo(process.env.MONGODB_URI)}`);
    console.log(`JWT Secret: ${this._maskSensitiveInfo(process.env.JWT_SECRET)}`);
    console.log(`Mistral API Key: ${this._maskSensitiveInfo(process.env.MISTRAL_API_KEY)}`);
    console.log('=========================\n');
  }

  /**
   * Masks sensitive information for logging
   * @private
   */
  static _maskSensitiveInfo(value) {
    if (!value) return 'Not set';
    return value.substring(0, 4) + '...' + value.substring(value.length - 4);
  }
}

module.exports = ConfigValidator; 