const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { Cohort, Student, User } = require('../models');
const logger = require('../utils/logger');

/**
 * @swagger
 * /cohorts:
 *   get:
 *     summary: Get all cohorts
 *     tags: [Cohorts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of cohorts
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const cohorts = await Cohort.findAll({
      where: { isActive: true },
      include: [{ 
        model: Student, 
        as: 'students',
        attributes: ['id'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email']
        }]
      }],
      order: [['startDate', 'DESC']]
    });

    // Add student count to each cohort
    const cohortsWithCount = cohorts.map(cohort => ({
      ...cohort.toJSON(),
      studentCount: cohort.students.length
    }));

    res.json({ cohorts: cohortsWithCount });
  } catch (error) {
    logger.error('Get cohorts error:', error);
    res.status(500).json({ error: 'Failed to fetch cohorts' });
  }
});

/**
 * @swagger
 * /cohorts:
 *   post:
 *     summary: Create a new cohort
 *     tags: [Cohorts]
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
 *               - code
 *               - startDate
 *               - endDate
 *               - program
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               program:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cohort created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Managers only
 */
router.post('/', authenticate, authorize('manager', 'admin'), async (req, res) => {
  try {
    const cohort = await Cohort.create(req.body);
    logger.info(`Cohort created: ${cohort.code}`);
    res.status(201).json({ 
      message: 'Cohort created successfully', 
      cohort 
    });
  } catch (error) {
    logger.error('Create cohort error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        error: 'Duplicate cohort',
        message: 'A cohort with this code already exists'
      });
    }
    res.status(500).json({ error: 'Failed to create cohort' });
  }
});

/**
 * @swagger
 * /cohorts/{id}:
 *   get:
 *     summary: Get cohort by ID
 *     tags: [Cohorts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cohort details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cohort not found
 */
router.get('/:id', authenticate, validate('idParam'), async (req, res) => {
  try {
    const { id } = req.params;
    const cohort = await Cohort.findByPk(id, {
      include: [{ 
        model: Student, 
        as: 'students',
        include: [{
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email']
        }]
      }]
    });

    if (!cohort) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Cohort not found'
      });
    }

    res.json({ cohort });
  } catch (error) {
    logger.error('Get cohort error:', error);
    res.status(500).json({ error: 'Failed to fetch cohort' });
  }
});

module.exports = router;