import ee from '@google/earthengine';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccount = process.env.GEE_SERVICE_ACCOUNT_KEY;

if (!serviceAccount) {
  throw new Error("GEE_SERVICE_ACCOUNT_KEY is not defined in the environment variables");
}

let parsedServiceAccount;
try {
  parsedServiceAccount = JSON.parse(serviceAccount);
} catch (error) {
  throw new Error("Failed to parse the GEE_SERVICE_ACCOUNT_KEY. Please check the JSON format.");
}

let eeInitialized = false;

const initializeEarthEngine = () => {
  return new Promise((resolve, reject) => {
    if (eeInitialized) {
      console.log('Earth Engine already initialized');
      resolve();
      return;
    }

    console.log('Initializing Earth Engine...');

    ee.data.authenticateViaPrivateKey(
      parsedServiceAccount,
      () => {
        console.log('✓ Earth Engine authenticated');
        ee.initialize(
          null,
          null,
          () => {
            eeInitialized = true;
            console.log('✓ Earth Engine initialized successfully');
            resolve();
          },
          (error) => {
            console.error('✗ Earth Engine initialization error:', error);
            reject(error);
          }
        );
      },
      (error) => {
        console.error('✗ Earth Engine authentication error:', error);
        reject(error);
      }
    );
  });
};

// Export the initialization function and status check
export const isInitialized = () => eeInitialized;
export default initializeEarthEngine;