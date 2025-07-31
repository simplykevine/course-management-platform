// tests/testDbConfig.js
const { Sequelize } = require('sequelize');

// Create a separate test database configuration
const createTestDatabase = () => {
  const sequelize = new Sequelize(
    process.env.DB_NAME || 'course_management_test',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false, // Disable logging in tests
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: true,
        paranoid: true
      }
    }
  );

  return sequelize;
};

module.exports = { createTestDatabase };