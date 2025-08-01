process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.DB_NAME = 'dbdb';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3306';

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

jest.setTimeout(30000);
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

afterEach(async () => {
  jest.clearAllMocks();
});