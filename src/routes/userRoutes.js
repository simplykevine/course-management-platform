const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")
const { authenticate, authorize } = require("../middleware/auth")
const { requireRole } = require("../middleware/roleCheck")
const { validate } = require("../middleware/validation")

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users with filtering and pagination
 *     tags: [Users]
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, manager, facilitator, student]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get("/", authenticate, requireRole("admin"), validate("paginationQuery"), userController.getAllUsers)

/**
 * @swagger
 * /users/stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get("/stats", authenticate, requireRole("admin"), userController.getUserStats)

/**
 * @swagger
 * /users/facilitators:
 *   get:
 *     summary: Get all facilitators
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all facilitators
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Managers and Admins only
 */
router.get("/facilitators", authenticate, requireRole("manager", "admin"), async (req, res) => {
  try {
    const { Facilitator, User } = require("../models")
    const facilitators = await Facilitator.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: { exclude: ["password", "resetPasswordToken", "resetPasswordExpires"] },
        },
      ],
      order: [["createdAt", "DESC"]],
    })
    res.json({ facilitators })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch facilitators" })
  }
})

/**
 * @swagger
 * /users/students:
 *   get:
 *     summary: Get all students
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all students
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Managers, Facilitators and Admins only
 */
router.get("/students", authenticate, requireRole("manager", "facilitator", "admin"), async (req, res) => {
  try {
    const { Student, User, Cohort } = require("../models")
    const students = await Student.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: { exclude: ["password", "resetPasswordToken", "resetPasswordExpires"] },
        },
        {
          model: Cohort,
          as: "cohort",
        },
      ],
      order: [["createdAt", "DESC"]],
    })
    res.json({ students })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch students" })
  }
})

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
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
 *         description: User details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.get("/:id", authenticate, requireRole("admin", "manager"), validate("idParam"), userController.getUserById)

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
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
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: User not found
 */
router.put("/:id", authenticate, requireRole("admin"), validate("idParam"), userController.updateUser)

/**
 * @swagger
 * /users/{id}/deactivate:
 *   patch:
 *     summary: Deactivate user
 *     tags: [Users]
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
 *         description: User deactivated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: User not found
 */
router.patch("/:id/deactivate", authenticate, requireRole("admin"), validate("idParam"), userController.deactivateUser)

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
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
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: User not found
 */
router.delete("/:id", authenticate, requireRole("admin"), validate("idParam"), userController.deleteUser)

module.exports = router
