const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { Mode } = require('../models');
const logger = require('../utils/logger');

/**
 * @swagger
 * /modes:
 *   get:
 *     summary: Get all delivery modes
 *     tags: [Modes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of delivery modes
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const modes = await Mode.findAll({
      order: [['name', 'ASC']]
    });
    res.json({ modes });
  } catch (error) {
    logger.error('Get modes error:', error);
    res.status(500).json({ error: 'Failed to fetch modes' });
  }
});

/**
 * @swagger
 * /modes:
 *   post:
 *     summary: Create a new delivery mode
 *     tags: [Modes]
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               requiresPhysicalPresence:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Mode created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Managers only
 */
router.post('/', authenticate, authorize('manager', 'admin'), async (req, res) => {
  try {
    const mode = await Mode.create(req.body);
    logger.info(`Mode created: ${mode.name}`);
    res.status(201).json({ 
      message: 'Mode created successfully', 
      mode 
    });
  } catch (error) {
    logger.error('Create mode error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        error: 'Duplicate mode',
        message: 'A mode with this name already exists'
      });
    }
    res.status(500).json({ error: 'Failed to create mode' });
  }
});

module.exports = router;