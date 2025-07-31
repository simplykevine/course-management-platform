const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

/**
 * @swagger
 * /courses/modules:
 *   post:
 *     summary: Create a new module
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - credits
 *               - level
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               credits:
 *                 type: integer
 *               level:
 *                 type: string
 *                 enum: ['100', '200', '300', '400', '500', '600']
 *     responses:
 *       201:
 *         description: Module created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Managers only
 */
router.post('/modules', authenticate, authorize('manager', 'admin'), courseController.createModule);

/**
 * @swagger
 * /courses/modules:
 *   get:
 *     summary: Get all modules
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of modules
 *       401:
 *         description: Unauthorized
 */
router.get('/modules', authenticate, courseController.getAllModules);

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Create a new course offering
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseOffering'
 *     responses:
 *       201:
 *         description: Course offering created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Managers only
 *       409:
 *         description: Course offering already exists
 */
router.post('/', 
  authenticate, 
  authorize('manager', 'admin'), 
  validate('createCourseOffering'), 
  courseController.createCourseOffering
);

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get all course offerings with filters
 *     tags: [Courses]
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
 *         name: trimester
 *         schema:
 *           type: integer
 *           enum: [1, 2, 3]
 *       - in: query
 *         name: cohortId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: facilitatorId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: intakePeriod
 *         schema:
 *           type: string
 *           enum: [HT1, HT2, FT]
 *       - in: query
 *         name: modeId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planned, active, completed, cancelled]
 *     responses:
 *       200:
 *         description: List of course offerings with pagination
 *       401:
 *         description: Unauthorized
 */
router.get('/', 
  authenticate, 
  validate('courseFilters'), 
  validate('paginationQuery'), 
  courseController.getAllCourseOfferings
);

/**
 * @swagger
 * /courses/my-courses:
 *   get:
 *     summary: Get facilitator's assigned courses
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of assigned courses
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Facilitators only
 */
router.get('/my-courses', 
  authenticate, 
  authorize('facilitator'), 
  courseController.getMyAssignedCourses
);

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Get course offering by ID
 *     tags: [Courses]
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
 *         description: Course offering details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course offering not found
 */
router.get('/:id', 
  authenticate, 
  validate('idParam'), 
  courseController.getCourseOfferingById
);

/**
 * @swagger
 * /courses/{id}:
 *   put:
 *     summary: Update course offering
 *     tags: [Courses]
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
 *               facilitatorId:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [planned, active, completed, cancelled]
 *               maxStudents:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Course offering updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Managers only
 *       404:
 *         description: Course offering not found
 */
router.put('/:id', 
  authenticate, 
  authorize('manager', 'admin'), 
  validate('updateCourseOffering'), 
  courseController.updateCourseOffering
);

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Delete course offering
 *     tags: [Courses]
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
 *         description: Course offering deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Managers only
 *       404:
 *         description: Course offering not found
 */
router.delete('/:id', 
  authenticate, 
  authorize('manager', 'admin'), 
  validate('idParam'), 
  courseController.deleteCourseOffering
);

/**
 * @swagger
 * /courses/{id}/assign-facilitator:
 *   post:
 *     summary: Assign facilitator to course offering
 *     tags: [Courses]
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
 *             required:
 *               - facilitatorId
 *             properties:
 *               facilitatorId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Facilitator assigned successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Managers only
 *       404:
 *         description: Course offering not found
 */
router.post('/:id/assign-facilitator', 
  authenticate, 
  authorize('manager', 'admin'), 
  validate('idParam'),
  courseController.assignFacilitator
);

module.exports = router;