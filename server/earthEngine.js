import os from 'os';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// STEP 1: Configure temp directory BEFORE importing ee
if (process.env.VERCEL || process.env.VERCEL_ENV) {
  console.log('🚀 Vercel environment detected');
  
  process.env.TMPDIR = '/tmp';
  process.env.TEMP = '/tmp';
  process.env.TMP = '/tmp';
  process.env.NODE_TMPDIR = '/tmp';
  
  if (!fs.existsSync('/tmp')) {
    fs.mkdirSync('/tmp', { recursive: true });
  }
}

// STEP 2: NOW import Earth Engine
import ee from '@google/earthengine';

const serviceAccount = process.env.GEE_SERVICE_ACCOUNT_KEY;

if (!serviceAccount) {
  throw new Error("GEE_SERVICE_ACCOUNT_KEY not defined");
}

let parsedServiceAccount;
try {
  parsedServiceAccount = JSON.parse(serviceAccount);
} catch (error) {
  throw new Error("Failed to parse GEE_SERVICE_ACCOUNT_KEY");
}

let eeInitialized = false;

const initializeEarthEngine = () => {
  return new Promise((resolve, reject) => {
    if (eeInitialized) {
      resolve();
      return;
    }

    console.log('⏳ Initializing Earth Engine...');

    // STEP 3: Change working directory to /tmp
    if (process.env.VERCEL || process.env.VERCEL_ENV) {
      try {
        process.chdir('/tmp');
        console.log('✓ Working directory: /tmp');
      } catch (error) {
        console.warn('⚠️  Could not chdir to /tmp');
      }
    }

    ee.data.authenticateViaPrivateKey(
      parsedServiceAccount,
      () => {
        ee.initialize(null, null, () => {
          eeInitialized = true;
          console.log('✓ Earth Engine ready');
          resolve();
        }, reject);
      },
      reject
    );
  });
};

export const isInitialized = () => eeInitialized;
export default initializeEarthEngine;
