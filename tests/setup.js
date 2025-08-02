// tests/setup.js

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

// Test database configuration
process.env.DB_NAME = 'course_management_test';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3306';

// Mock Redis for tests
jest.mock('../src/config/redis', () => ({
  redisClient: {
    connect: jest.fn(),
    on: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn()
  },
  notificationQueue: {
    add: jest.fn(),
    process: jest.fn(),
    on: jest.fn()
  },
  reminderQueue: {
    add: jest.fn(),
    process: jest.fn(),
    on: jest.fn()
  }
}));

// Global test timeout
jest.setTimeout(30000);

// Suppress console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Clean up after each test
afterEach(async () => {
  // Clear all mocks
  jest.clearAllMocks();
});