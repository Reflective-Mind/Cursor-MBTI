/**
 * Environment File Verification Script
 * =================================
 * CRITICAL: This script verifies and fixes environment files
 * to match the official production values.
 */

const fs = require('fs');
const path = require('path');

// Read critical values from the single source of truth
function getCriticalValues() {
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

// Verify environment variables
function verifyEnv() {
  try {
    const { renderValues, vercelValues } = getCriticalValues();
    
    // Check server environment
    const serverEnvPath = path.join(__dirname, '../.env');
    if (fs.existsSync(serverEnvPath)) {
      const serverEnv = fs.readFileSync(serverEnvPath, 'utf8');
      Object.entries(renderValues).forEach(([key, value]) => {
        if (!serverEnv.includes(`${key}=${value}`)) {
          throw new Error(`Invalid ${key} in server/.env - must match production value in CRITICAL_VALUES.md`);
        }
      });
    }

    // Check client environment
    const clientEnvPath = path.join(__dirname, '../../client/.env.production');
    if (fs.existsSync(clientEnvPath)) {
      const clientEnv = fs.readFileSync(clientEnvPath, 'utf8');
      Object.entries(vercelValues).forEach(([key, value]) => {
        if (!clientEnv.includes(`${key}=${value}`)) {
          throw new Error(`Invalid ${key} in client/.env.production - must match production value in CRITICAL_VALUES.md`);
        }
      });
    }

    console.log('✅ All environment variables verified successfully');
  } catch (error) {
    console.error('❌ Environment verification failed:', error.message);
    process.exit(1);
  }
}

verifyEnv(); 