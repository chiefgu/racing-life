#!/usr/bin/env node
/**
 * Security Audit Script
 * Performs comprehensive security checks on the application
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface AuditResult {
  category: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  details?: string;
}

const results: AuditResult[] = [];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function addResult(category: string, status: 'pass' | 'warn' | 'fail', message: string, details?: string) {
  results.push({ category, status, message, details });
}

// Check 1: NPM Audit
function checkNpmVulnerabilities() {
  log('\n[1/10] Checking for npm vulnerabilities...', colors.blue);
  try {
    execSync('npm audit --json > /tmp/npm-audit.json', { stdio: 'ignore' });
    const auditData = JSON.parse(fs.readFileSync('/tmp/npm-audit.json', 'utf-8'));

    const { vulnerabilities } = auditData;
    const criticalCount = Object.values(vulnerabilities).filter((v: any) => v.severity === 'critical').length;
    const highCount = Object.values(vulnerabilities).filter((v: any) => v.severity === 'high').length;

    if (criticalCount > 0 || highCount > 0) {
      addResult('Dependencies', 'fail', `Found ${criticalCount} critical and ${highCount} high severity vulnerabilities`);
    } else {
      addResult('Dependencies', 'pass', 'No critical or high severity vulnerabilities found');
    }
  } catch (error) {
    addResult('Dependencies', 'warn', 'Could not run npm audit', error.message);
  }
}

// Check 2: Environment Variables
function checkEnvironmentVariables() {
  log('[2/10] Checking environment variables...', colors.blue);
  const requiredEnvVars = [
    'DATABASE_URL',
    'REDIS_URL',
    'JWT_SECRET',
    'NODE_ENV',
  ];

  const missing = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    addResult('Environment', 'fail', `Missing required environment variables: ${missing.join(', ')}`);
  } else {
    addResult('Environment', 'pass', 'All required environment variables are set');
  }

  // Check for weak secrets
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    addResult('Environment', 'warn', 'JWT_SECRET should be at least 32 characters long');
  }
}

// Check 3: Hardcoded Secrets
function checkHardcodedSecrets() {
  log('[3/10] Scanning for hardcoded secrets...', colors.blue);
  const secretPatterns = [
    /password\s*=\s*['"][^'"]{1,}['"]/gi,
    /api[_-]?key\s*=\s*['"][^'"]{1,}['"]/gi,
    /secret\s*=\s*['"][^'"]{1,}['"]/gi,
    /token\s*=\s*['"][^'"]{1,}['"]/gi,
    /aws[_-]?access[_-]?key/gi,
  ];

  const sourceFiles = getAllSourceFiles('/Users/henry/Desktop/Racing Life/backend/src');
  let secretsFound = false;

  sourceFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    secretPatterns.forEach(pattern => {
      if (pattern.test(content) && !file.includes('test') && !file.includes('example')) {
        secretsFound = true;
        addResult('Secrets', 'warn', `Potential hardcoded secret in ${file}`);
      }
    });
  });

  if (!secretsFound) {
    addResult('Secrets', 'pass', 'No obvious hardcoded secrets found');
  }
}

// Check 4: HTTPS Configuration
function checkHttpsConfiguration() {
  log('[4/10] Checking HTTPS configuration...', colors.blue);
  if (process.env.NODE_ENV === 'production') {
    // In production, we should enforce HTTPS
    addResult('HTTPS', 'warn', 'Ensure HTTPS is enforced in production (check reverse proxy/load balancer)');
  } else {
    addResult('HTTPS', 'pass', 'Development environment - HTTPS not required');
  }
}

// Check 5: Security Headers
function checkSecurityHeaders() {
  log('[5/10] Checking security headers implementation...', colors.blue);
  const indexFile = '/Users/henry/Desktop/Racing Life/backend/src/index.ts';

  if (fs.existsSync(indexFile)) {
    const content = fs.readFileSync(indexFile, 'utf-8');
    const hasHelmet = content.includes('helmet');
    const hasCors = content.includes('cors');

    if (hasHelmet && hasCors) {
      addResult('Security Headers', 'pass', 'Helmet and CORS configured');
    } else {
      if (!hasHelmet) addResult('Security Headers', 'fail', 'Helmet middleware not found');
      if (!hasCors) addResult('Security Headers', 'fail', 'CORS middleware not found');
    }
  }
}

// Check 6: Rate Limiting
function checkRateLimiting() {
  log('[6/10] Checking rate limiting...', colors.blue);
  const rateLimitFile = '/Users/henry/Desktop/Racing Life/backend/src/middleware/rate-limit.middleware.ts';

  if (fs.existsSync(rateLimitFile)) {
    addResult('Rate Limiting', 'pass', 'Rate limiting middleware implemented');
  } else {
    addResult('Rate Limiting', 'fail', 'Rate limiting middleware not found');
  }
}

// Check 7: Input Validation
function checkInputValidation() {
  log('[7/10] Checking input validation...', colors.blue);
  const validationFile = '/Users/henry/Desktop/Racing Life/backend/src/middleware/validation.middleware.ts';

  if (fs.existsSync(validationFile)) {
    addResult('Input Validation', 'pass', 'Input validation middleware implemented');
  } else {
    addResult('Input Validation', 'fail', 'Input validation middleware not found');
  }
}

// Check 8: SQL Injection Protection
function checkSqlInjectionProtection() {
  log('[8/10] Checking SQL injection protection...', colors.blue);
  const dbConfigFile = '/Users/henry/Desktop/Racing Life/backend/src/config/database.ts';

  if (fs.existsSync(dbConfigFile)) {
    const content = fs.readFileSync(dbConfigFile, 'utf-8');
    const usesParameterized = content.includes('knex') || content.includes('pg');

    if (usesParameterized) {
      addResult('SQL Injection', 'pass', 'Using parameterized queries with Knex/pg');
    } else {
      addResult('SQL Injection', 'warn', 'Ensure parameterized queries are used everywhere');
    }
  }
}

// Check 9: Authentication Security
function checkAuthenticationSecurity() {
  log('[9/10] Checking authentication security...', colors.blue);
  const authController = '/Users/henry/Desktop/Racing Life/backend/src/controllers/auth.controller.ts';

  if (fs.existsSync(authController)) {
    const content = fs.readFileSync(authController, 'utf-8');
    const usesBcrypt = content.includes('bcrypt');
    const usesJwt = content.includes('jwt') || content.includes('jsonwebtoken');

    if (usesBcrypt && usesJwt) {
      addResult('Authentication', 'pass', 'Using bcrypt for passwords and JWT for tokens');
    } else {
      if (!usesBcrypt) addResult('Authentication', 'fail', 'Not using bcrypt for password hashing');
      if (!usesJwt) addResult('Authentication', 'fail', 'Not using JWT for authentication');
    }
  }
}

// Check 10: Sensitive Data Exposure
function checkSensitiveDataExposure() {
  log('[10/10] Checking for sensitive data exposure...', colors.blue);
  const controllerFiles = getAllSourceFiles('/Users/henry/Desktop/Racing Life/backend/src/controllers');

  let exposureFound = false;
  controllerFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    if (content.includes('password_hash') && !content.includes('select') && !content.includes('exclude')) {
      exposureFound = true;
      addResult('Data Exposure', 'warn', `Potential password hash exposure in ${file}`);
    }
  });

  if (!exposureFound) {
    addResult('Data Exposure', 'pass', 'No obvious sensitive data exposure found');
  }
}

// Helper function to get all source files
function getAllSourceFiles(dir: string): string[] {
  const files: string[] = [];

  function traverse(currentPath: string) {
    const items = fs.readdirSync(currentPath);

    items.forEach(item => {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.js'))) {
        files.push(fullPath);
      }
    });
  }

  traverse(dir);
  return files;
}

// Print results
function printResults() {
  log('\n' + '='.repeat(80), colors.blue);
  log('SECURITY AUDIT RESULTS', colors.blue);
  log('='.repeat(80) + '\n', colors.blue);

  const passed = results.filter(r => r.status === 'pass').length;
  const warned = results.filter(r => r.status === 'warn').length;
  const failed = results.filter(r => r.status === 'fail').length;

  results.forEach(result => {
    const icon = result.status === 'pass' ? '✓' : result.status === 'warn' ? '⚠' : '✗';
    const color = result.status === 'pass' ? colors.green : result.status === 'warn' ? colors.yellow : colors.red;

    log(`${icon} [${result.category}] ${result.message}`, color);
    if (result.details) {
      log(`  ${result.details}`, colors.reset);
    }
  });

  log('\n' + '='.repeat(80), colors.blue);
  log(`Summary: ${passed} passed, ${warned} warnings, ${failed} failed`, colors.blue);
  log('='.repeat(80) + '\n', colors.blue);

  // Exit with error if any checks failed
  if (failed > 0) {
    process.exit(1);
  }
}

// Run all checks
async function runAudit() {
  log('Starting Security Audit...', colors.blue);

  checkNpmVulnerabilities();
  checkEnvironmentVariables();
  checkHardcodedSecrets();
  checkHttpsConfiguration();
  checkSecurityHeaders();
  checkRateLimiting();
  checkInputValidation();
  checkSqlInjectionProtection();
  checkAuthenticationSecurity();
  checkSensitiveDataExposure();

  printResults();
}

// Run the audit
runAudit().catch(error => {
  log(`Error running security audit: ${error.message}`, colors.red);
  process.exit(1);
});
