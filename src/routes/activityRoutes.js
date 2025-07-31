const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

/**
 * @swagger
 * /activities:
 *   post:
 *     summary: Create a new activity log
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActivityTracker'
 *     responses:
 *       201:
 *         description: Activity log created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Facilitators only
 *       409:
 *         description: Activity log already exists for this week
 */
router.post('/', 
  authenticate, 
  authorize('facilitator'), 
  validate('createActivityLog'), 
  activityController.createActivityLog
);

/**
 * @swagger
 * /activities:
 *   get:
 *     summary: Get all activity logs with filters
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: allocationId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: weekNumber
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 16
 *       - in: query
 *         name: facilitatorId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [complete, incomplete]
 *     responses:
 *       200:
 *         description: List of activity logs with pagination
 *       401:
 *         description: Unauthorized
 */
router.get('/', 
  authenticate, 
  validate('paginationQuery'), 
  activityController.getAllActivityLogs
);

/**
 * @swagger
 * /activities/my-logs:
 *   get:
 *     summary: Get facilitator's own activity logs
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: weekNumber
 *         schema:
 *           type: integer
 *       - in: query
 *         name: allocationId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of facilitator's activity logs
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Facilitators only
 */
router.get('/my-logs', 
  authenticate, 
  authorize('facilitator'), 
  activityController.getMyActivityLogs
);

/**
 * @swagger
 * /activities/summary:
 *   get:
 *     summary: Get weekly summary of activity logs
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: weekNumber
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 16
 *     responses:
 *       200:
 *         description: Weekly summary of submissions
 *       400:
 *         description: Week number is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Managers only
 */
router.get('/summary', 
  authenticate, 
  authorize('manager', 'admin'), 
  activityController.getWeeklySummary
);

/**
 * @swagger
 * /activities/{id}:
 *   get:
 *     summary: Get activity log by ID
 *     tags: [Activities]
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
 *         description: Activity log details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only view own logs
 *       404:
 *         description: Activity log not found
 */
router.get('/:id', 
  authenticate, 
  validate('idParam'), 
  activityController.getActivityLogById
);

/**
 * @swagger
 * /activities/{id}:
 *   put:
 *     summary: Update activity log
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attendance:
 *                 type: array
 *                 items:
 *                   type: boolean
 *               formativeOneGrading:
 *                 type: string
 *                 enum: [Done, Pending, Not Started]
 *               formativeTwoGrading:
 *                 type: string
 *                 enum: [Done, Pending, Not Started]
 *               summativeGrading:
 *                 type: string
 *                 enum: [Done, Pending, Not Started]
 *               courseModeration:
 *                 type: string
 *                 enum: [Done, Pending, Not Started]
 *               intranetSync:
 *                 type: string
 *                 enum: [Done, Pending, Not Started]
 *               gradeBookStatus:
 *                 type: string
 *                 enum: [Done, Pending, Not Started]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Activity log updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only update own logs
 *       404:
 *         description: Activity log not found
 */
router.put('/:id', 
  authenticate, 
  validate('idParam'), 
  activityController.updateActivityLog
);

/**
 * @swagger
 * /activities/{id}:
 *   delete:
 *     summary: Delete activity log
 *     tags: [Activities]
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
 *         description: Activity log deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Managers only
 *       404:
 *         description: Activity log not found
 */
router.delete('/:id', 
  authenticate, 
  authorize('manager', 'admin'), 
  validate('idParam'), 
  activityController.deleteActivityLog
);

module.exports = router;