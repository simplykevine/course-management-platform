const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const courseRoutes = require('./courseRoutes');
const activityRoutes = require('./activityRoutes');
const userRoutes = require('./userRoutes');
const classRoutes = require('./classRoutes');
const cohortRoutes = require('./cohortRoutes');
const modeRoutes = require('./modeRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/activities', activityRoutes);
router.use('/users', userRoutes);
router.use('/classes', classRoutes);
router.use('/cohorts', cohortRoutes);
router.use('/modes', modeRoutes);

// Base route
router.get('/', (req, res) => {
  res.json({
    message: 'Course Management Platform API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: '/api/auth',
      courses: '/api/courses',
      activities: '/api/activities',
      users: '/api/users',
      classes: '/api/classes',
      cohorts: '/api/cohorts',
      modes: '/api/modes',
      documentation: '/api-docs'
    },
    features: {
      authentication: 'JWT-based with role management',
      database: 'MySQL with Sequelize ORM',
      notifications: 'Redis-backed queue system',
      i18n: 'Student reflection page with language switching'
    }
  });
});

// Database seeding endpoint (development only)
if (process.env.NODE_ENV !== 'production') {
  router.post('/seed', async (req, res) => {
    try {
      const seedDatabase = require('../utils/seedDatabase');
      await seedDatabase();
      res.json({ 
        message: 'Database seeded successfully',
        note: 'Check server logs for login credentials'
      });
    } catch (error) {
      console.error('Seed error:', error);
      res.status(500).json({ 
        error: 'Failed to seed database',
        message: error.message
      });
    }
  });
}

// Health monitoring endpoints
router.get('/monitoring/redis', async (req, res) => {
  try {
    const { redisClient } = require('../config/redis');
    // Simple ping test
    await redisClient.ping();
    res.json({ 
      status: 'OK', 
      service: 'Redis',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'ERROR', 
      service: 'Redis',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.get('/monitoring/mysql', async (req, res) => {
  try {
    const { sequelize } = require('../models');
    await sequelize.authenticate();
    res.json({ 
      status: 'OK', 
      service: 'MySQL',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'ERROR', 
      service: 'MySQL',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.get('/monitoring/status', async (req, res) => {
  const status = {
    api: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    services: {}
  };

  // Check Redis
  try {
    const { redisClient } = require('../config/redis');
    await redisClient.ping();
    status.services.redis = 'OK';
  } catch (error) {
    status.services.redis = 'ERROR';
  }

  // Check MySQL
  try {
    const { sequelize } = require('../models');
    await sequelize.authenticate();
    status.services.mysql = 'OK';
  } catch (error) {
    status.services.mysql = 'ERROR';
  }

  const hasErrors = Object.values(status.services).includes('ERROR');
  res.status(hasErrors ? 503 : 200).json(status);
});

module.exports = router;