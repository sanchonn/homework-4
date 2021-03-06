/**
 * Create and export configuration variables
 *
 */

// Container for all the environments
const environments = {};
// Staging (default) environments
environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: 'staging',
  hashingSecret: 'thisIsASecret',
  stripe: {
    publicKey: 'pk_test_***',
    privateKey: 'sk_test_***',
  },
  mailgun: {
    domain: 'sandboxe77***.mailgun.org',
    apiKey: '***',
  },
  templateGlobals: {
    appName: 'Pizza Delivery App',
    companyName: 'PizzaDelivery, Inc',
    yearCreated: '2018',
    baseUrl: 'http://localhost:3000/',
  },
};

// Production environments
environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: 'production',
  hashingSecret: 'thisIsASecret',
  stripe: {
    publicKey: '***',
    privateKey: '***',
  },
  mailgun: {
    domain: '***',
    apiKey: '***',
  },
};


// Determine which environment was passed as a command-line args
const currentEnvironment = typeof (process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environment above, if onot, default the staging
const environmentToExport = typeof (environments[currentEnvironment]) === 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;
