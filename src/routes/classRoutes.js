const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { Class } = require('../models');
const logger = require('../utils/logger');

/**
 * @swagger
 * /classes:
 *   get:
 *     summary: Get all classes
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of classes
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const classes = await Class.findAll({
      order: [['year', 'DESC'], ['section', 'ASC']]
    });
    res.json({ classes });
  } catch (error) {
    logger.error('Get classes error:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

/**
 * @swagger
 * /classes:
 *   post:
 *     summary: Create a new class
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - year
 *               - section
 *             properties:
 *               name:
 *                 type: string
 *               year:
 *                 type: integer
 *               section:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Class created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Managers only
 */
router.post('/', authenticate, authorize('manager', 'admin'), async (req, res) => {
  try {
    const classEntity = await Class.create(req.body);
    logger.info(`Class created: ${classEntity.name}`);
    res.status(201).json({ 
      message: 'Class created successfully', 
      class: classEntity 
    });
  } catch (error) {
    logger.error('Create class error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        error: 'Duplicate class',
        message: 'A class with this name already exists'
      });
    }
    res.status(500).json({ error: 'Failed to create class' });
  }
});

module.exports = router;