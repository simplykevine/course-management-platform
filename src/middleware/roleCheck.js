const { hasRole } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * Role-based access control middleware
 * @param {...string} allowedRoles - Roles that are allowed to access the resource
 * @returns {Function} Express middleware function
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please login to access this resource'
        });
      }

      if (!hasRole(req.user, allowedRoles)) {
        logger.warn(`Access denied for user ${req.user.id} with role ${req.user.role}`, {
          userId: req.user.id,
          userRole: req.user.role,
          requiredRoles: allowedRoles,
          resource: req.originalUrl
        });

        return res.status(403).json({
          error: 'Access denied',
          message: `This resource requires one of the following roles: ${allowedRoles.join(', ')}`
        });
      }

      next();
    } catch (error) {
      logger.error('Role check error:', error);
      res.status(500).json({
        error: 'Authorization failed',
        message: 'Unable to verify user permissions'
      });
    }
  };
};

/**
 * Check if user owns the resource or has admin/manager role
 * @param {Function} getResourceOwnerId - Function to get the owner ID of the resource
 * @returns {Function} Express middleware function
 */
const requireOwnershipOrRole = (getResourceOwnerId, ...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please login to access this resource'
        });
      }

      // Check if user has allowed role
      if (hasRole(req.user, allowedRoles)) {
        return next();
      }

      // Check ownership
      const resourceOwnerId = await getResourceOwnerId(req);
      
      if (req.user.id === resourceOwnerId) {
        return next();
      }

      // Check role-specific ownership (e.g., facilitator owns their courses)
      if (req.user.role === 'facilitator' && req.user.facilitator) {
        if (req.user.facilitator.id === resourceOwnerId) {
          return next();
        }
      }

      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only access your own resources'
      });
    } catch (error) {
      logger.error('Ownership check error:', error);
      res.status(500).json({
        error: 'Authorization failed',
        message: 'Unable to verify resource ownership'
      });
    }
  };
};

/**
 * Dynamic role check based on request context
 * @param {Function} getRolesForContext - Function that returns allowed roles based on context
 * @returns {Function} Express middleware function
 */
const requireDynamicRole = (getRolesForContext) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please login to access this resource'
        });
      }

      const allowedRoles = await getRolesForContext(req);
      
      if (!hasRole(req.user, allowedRoles)) {
        return res.status(403).json({
          error: 'Access denied',
          message: `Insufficient permissions for this operation`
        });
      }

      next();
    } catch (error) {
      logger.error('Dynamic role check error:', error);
      res.status(500).json({
        error: 'Authorization failed',
        message: 'Unable to verify permissions'
      });
    }
  };
};

/**
 * Check if user can manage a specific facilitator
 * @param {Function} getFacilitatorId - Function to get facilitator ID from request
 * @returns {Function} Express middleware function
 */
const canManageFacilitator = (getFacilitatorId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required'
        });
      }

      // Admins can manage anyone
      if (req.user.role === 'admin') {
        return next();
      }

      // Managers can manage facilitators in their department
      if (req.user.role === 'manager' && req.user.manager) {
        const facilitatorId = await getFacilitatorId(req);
        const { Facilitator, User } = require('../models');
        
        const facilitator = await Facilitator.findByPk(facilitatorId, {
          include: [{ model: User, as: 'user' }]
        });

        if (facilitator && facilitator.department === req.user.manager.department) {
          return next();
        }
      }

      // Facilitators can only manage themselves
      if (req.user.role === 'facilitator' && req.user.facilitator) {
        const facilitatorId = await getFacilitatorId(req);
        if (req.user.facilitator.id === facilitatorId) {
          return next();
        }
      }

      return res.status(403).json({
        error: 'Access denied',
        message: 'You cannot manage this facilitator'
      });
    } catch (error) {
      logger.error('Facilitator management check error:', error);
      res.status(500).json({
        error: 'Authorization failed'
      });
    }
  };
};

module.exports = {
  requireRole,
  requireOwnershipOrRole,
  requireDynamicRole,
  canManageFacilitator
};
