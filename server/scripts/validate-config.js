/**
 * Configuration Validation Script
 * =============================
 * 
 * Validates all critical configurations across the application.
 * Run this script before starting the server to ensure proper setup.
 * 
 * Usage: npm run validate-config
 * 
 * @lastValidated March 2024
 * @maintainer Development Team
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const ConfigValidator = require('../utils/configValidator');

async function validateConfigurations() {
  console.log('\n=== MBTI Insights Configuration Validator ===');
  console.log('==========================================');
  
  try {
    // Step 1: Check Environment Files
    console.log('\n1. Checking Environment Files...');
    const requiredFiles = [
      { path: '.env', type: 'Server' },
      { path: '../client/.env.development', type: 'Client Development' },
      { path: '../client/.env.production', type: 'Client Production' }
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(__dirname, '..', file.path);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Missing ${file.type} environment file: ${file.path}`);
      }
      console.log(`✓ ${file.type} environment file found`);
    }

    // Step 2: Validate Environment Variables
    console.log('\n2. Validating Environment Variables...');
    ConfigValidator.validateEnvironmentVariables();
    console.log('✓ All required environment variables present');

    // Step 3: Validate Port Configurations
    console.log('\n3. Checking Port Configurations...');
    ConfigValidator.validatePortConfigurations();
    console.log('✓ Port configurations valid');

    // Step 4: Validate Security Settings
    console.log('\n4. Validating Security Settings...');
    ConfigValidator.validateSecuritySettings();
    console.log('✓ Security settings valid');

    // Step 5: Test Database Connection
    console.log('\n5. Testing Database Connection...');
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('✓ Database connection successful');
      await mongoose.connection.close();
    } catch (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }

    // Step 6: Validate Client Configuration
    console.log('\n6. Checking Client Configuration...');
    const clientPackageJson = require('../../client/package.json');
    const proxyUrl = clientPackageJson.proxy;
    if (!proxyUrl || !proxyUrl.includes(':10000')) {
      throw new Error('Invalid proxy configuration in client/package.json');
    }
    console.log('✓ Client proxy configuration valid');

    // Step 7: Validate Cross-Component Compatibility
    console.log('\n7. Validating Cross-Component Compatibility...');
    ConfigValidator.validateCrossComponentCompatibility();
    console.log('✓ Cross-component compatibility verified');

    // Final Status
    console.log('\n=== Validation Complete ===');
    console.log('All configurations valid and ready for deployment');
    
    // Log Configuration Status
    ConfigValidator.logConfigurationStatus();

  } catch (error) {
    console.error('\n❌ Validation Failed:');
    console.error(error.message);
    console.error('\nPlease fix the above issues and run validation again.');
    process.exit(1);
  }
}

// Run validation
validateConfigurations(); 