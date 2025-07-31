const logger = require('../utils/logger');

const requiredEnvVars = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

const validateEnvironment = () => {
  const missing = [];
  
  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  });
  
  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    logger.error('Please check your .env file and ensure all required variables are set.');
    process.exit(1);
  }
  
  // Validate JWT secrets are not default values
  if (process.env.JWT_SECRET === 'your-secret-key' || process.env.JWT_SECRET?.length < 32) {
    logger.error('JWT_SECRET must be a strong secret (at least 32 characters)');
    process.exit(1);
  }
  
  logger.info('Environment validation passed');
};

module.exports = validateEnvironment;