const { validationResult } = require("express-validator")
const { User, Manager, Facilitator, Student, Cohort } = require("../models")
const { formatPaginationResponse } = require("../utils/helpers")
const logger = require("../utils/logger")

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, isActive, search } = req.query
    const offset = (page - 1) * limit
    const where = {}

    // Apply filters
    if (role) where.role = role
    if (isActive !== undefined) where.isActive = isActive === "true"
    if (search) {
      const { Op } = require("sequelize")
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ]
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ["password", "resetPasswordToken", "resetPasswordExpires"] },
      include: [
        { model: Manager, as: "manager", required: false },
        { model: Facilitator, as: "facilitator", required: false },
        {
          model: Student,
          as: "student",
          required: false,
          include: [{ model: Cohort, as: "cohort" }],
        },
      ],
      limit: Number.parseInt(limit),
      offset,
      order: [["createdAt", "DESC"]],
    })

    res.json({
      users: rows,
      pagination: formatPaginationResponse(count, page, limit),
    })
  } catch (error) {
    logger.error("Get all users error:", error)
    res.status(500).json({
      error: "Failed to fetch users",
      message: "Unable to retrieve users list",
    })
  }
}

const getUserById = async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password", "resetPasswordToken", "resetPasswordExpires"] },
      include: [
        { model: Manager, as: "manager" },
        { model: Facilitator, as: "facilitator" },
        {
          model: Student,
          as: "student",
          include: [{ model: Cohort, as: "cohort" }],
        },
      ],
    })

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        message: "The requested user does not exist",
      })
    }

    res.json({ user })
  } catch (error) {
    logger.error("Get user by ID error:", error)
    res.status(500).json({
      error: "Failed to fetch user",
      message: "Unable to retrieve user details",
    })
  }
}

const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        errors: errors.array(),
      })
    }

    const { id } = req.params
    const updates = req.body

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({
        error: "User not found",
        message: "The requested user does not exist",
      })
    }

    // Only allow certain fields to be updated
    const allowedFields = ["firstName", "lastName", "isActive"]
    const filteredUpdates = {}

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field]
      }
    })

    await user.update(filteredUpdates)

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ["password", "resetPasswordToken", "resetPasswordExpires"] },
      include: [
        { model: Manager, as: "manager" },
        { model: Facilitator, as: "facilitator" },
        { model: Student, as: "student" },
      ],
    })

    logger.info(`User updated: ${id}`)

    res.json({
      message: "User updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    logger.error("Update user error:", error)
    res.status(500).json({
      error: "Failed to update user",
      message: "Unable to update user information",
    })
  }
}

const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({
        error: "User not found",
        message: "The requested user does not exist",
      })
    }

    await user.update({ isActive: false })

    logger.info(`User deactivated: ${id}`)

    res.json({
      message: "User deactivated successfully",
    })
  } catch (error) {
    logger.error("Deactivate user error:", error)
    res.status(500).json({
      error: "Failed to deactivate user",
      message: "Unable to deactivate user account",
    })
  }
}

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({
        error: "User not found",
        message: "The requested user does not exist",
      })
    }

    // Soft delete
    await user.destroy()

    logger.info(`User deleted: ${id}`)

    res.json({
      message: "User deleted successfully",
    })
  } catch (error) {
    logger.error("Delete user error:", error)
    res.status(500).json({
      error: "Failed to delete user",
      message: "Unable to delete user account",
    })
  }
}

const getUserStats = async (req, res) => {
  try {
    const stats = await User.findAll({
      attributes: ["role", [require("sequelize").fn("COUNT", require("sequelize").col("id")), "count"]],
      where: { isActive: true },
      group: ["role"],
    })

    const totalUsers = await User.count({ where: { isActive: true } })
    const inactiveUsers = await User.count({ where: { isActive: false } })

    res.json({
      totalUsers,
      inactiveUsers,
      roleDistribution: stats.reduce((acc, stat) => {
        acc[stat.role] = Number.parseInt(stat.dataValues.count)
        return acc
      }, {}),
    })
  } catch (error) {
    logger.error("Get user stats error:", error)
    res.status(500).json({
      error: "Failed to fetch user statistics",
      message: "Unable to retrieve user statistics",
    })
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  deleteUser,
  getUserStats,
}
