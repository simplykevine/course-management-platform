const { validationResult } = require('express-validator');
const activityService = require('../services/activityService');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

const createActivityLog = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: errors.array()
      });
    }

    // Get facilitator ID from authenticated user
    const facilitatorId = req.user.facilitator?.id;
    
    if (!facilitatorId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only facilitators can submit activity logs'
      });
    }

    const logData = req.body;
    const activityLog = await activityService.createActivityLog(logData, facilitatorId);
    
    // Notify managers if log is complete
    if (activityLog.isComplete()) {
      await notificationService.notifyActivitySubmission(activityLog.id);
    }
    
    logger.info(`Activity log created: ${activityLog.id}`);
    
    res.status(201).json({
      message: 'Activity log created successfully',
      activityLog
    });
  } catch (error) {
    logger.error('Create activity log error:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        error: 'Duplicate activity log',
        message: error.message
      });
    }
    
    res.status(500).json({
      error: 'Failed to create activity log',
      message: error.message || 'Unable to create activity log'
    });
  }
};

const getAllActivityLogs = async (req, res) => {
  try {
    const filters = {
      allocationId: req.query.allocationId,
      weekNumber: req.query.weekNumber,
      facilitatorId: req.query.facilitatorId,
      status: req.query.status
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => 
      filters[key] === undefined && delete filters[key]
    );

    const { page = 1, limit = 10 } = req.query;
    
    // Check access - facilitators can only see their own logs
    if (req.user.role === 'facilitator' && !filters.facilitatorId) {
      filters.facilitatorId = req.user.facilitator?.id;
    }
    
    const logs = await activityService.getAllActivityLogs(filters, page, limit);
    
    res.json(logs);
  } catch (error) {
    logger.error('Get activity logs error:', error);
    res.status(500).json({
      error: 'Failed to retrieve activity logs',
      message: 'Unable to fetch activity logs'
    });
  }
};

const getActivityLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const activityLog = await activityService.getActivityLogById(id);
    
    if (!activityLog) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Activity log not found'
      });
    }
    
    // Check access - facilitators can only see their own logs
    if (req.user.role === 'facilitator') {
      const facilitatorId = req.user.facilitator?.id;
      if (activityLog.courseOffering.facilitatorId !== facilitatorId) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You can only view your own activity logs'
        });
      }
    }
    
    res.json({ activityLog });
  } catch (error) {
    logger.error('Get activity log error:', error);
    res.status(500).json({
      error: 'Failed to retrieve activity log',
      message: 'Unable to fetch activity log details'
    });
  }
};

const updateActivityLog = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updates = req.body;
    
    // Check ownership for facilitators
    if (req.user.role === 'facilitator') {
      const facilitatorId = req.user.facilitator?.id;
      const canUpdate = await activityService.checkFacilitatorOwnership(id, facilitatorId);
      
      if (!canUpdate) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You can only update your own activity logs'
        });
      }
    }
    
    const activityLog = await activityService.updateActivityLog(id, updates);
    
    if (!activityLog) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Activity log not found'
      });
    }
    
    // Notify managers if log is now complete
    if (activityLog.isComplete() && !activityLog.submittedAt) {
      await activityLog.markSubmitted();
      await notificationService.notifyActivitySubmission(activityLog.id);
    }
    
    logger.info(`Activity log updated: ${id}`);
    
    res.json({
      message: 'Activity log updated successfully',
      activityLog
    });
  } catch (error) {
    logger.error('Update activity log error:', error);
    res.status(500).json({
      error: 'Failed to update activity log',
      message: error.message || 'Unable to update activity log'
    });
  }
};

const deleteActivityLog = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only managers can delete activity logs
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only managers can delete activity logs'
      });
    }
    
    const result = await activityService.deleteActivityLog(id);
    
    if (!result) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Activity log not found'
      });
    }
    
    logger.info(`Activity log deleted: ${id}`);
    
    res.json({
      message: 'Activity log deleted successfully'
    });
  } catch (error) {
    logger.error('Delete activity log error:', error);
    res.status(500).json({
      error: 'Failed to delete activity log',
      message: 'Unable to delete activity log'
    });
  }
};

const getMyActivityLogs = async (req, res) => {
  try {
    // For facilitators to view their own logs
    const facilitatorId = req.user.facilitator?.id;
    
    if (!facilitatorId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You must be a facilitator to view activity logs'
      });
    }
    
    const filters = {
      weekNumber: req.query.weekNumber,
      allocationId: req.query.allocationId
    };
    
    // Remove undefined values
    Object.keys(filters).forEach(key => 
      filters[key] === undefined && delete filters[key]
    );
    
    const logs = await activityService.getFacilitatorLogs(facilitatorId, filters);
    
    res.json({
      activityLogs: logs,
      total: logs.length
    });
  } catch (error) {
    logger.error('Get my activity logs error:', error);
    res.status(500).json({
      error: 'Failed to retrieve activity logs',
      message: 'Unable to fetch your activity logs'
    });
  }
};

const getWeeklySummary = async (req, res) => {
  try {
    const { weekNumber } = req.query;
    
    if (!weekNumber) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Week number is required'
      });
    }
    
    // Only managers can view weekly summaries
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only managers can view weekly summaries'
      });
    }
    
    const summary = await activityService.getWeeklySummary(parseInt(weekNumber));
    
    res.json(summary);
  } catch (error) {
    logger.error('Get weekly summary error:', error);
    res.status(500).json({
      error: 'Failed to retrieve weekly summary',
      message: 'Unable to fetch weekly summary'
    });
  }
};

module.exports = {
  createActivityLog,
  getAllActivityLogs,
  getActivityLogById,
  updateActivityLog,
  deleteActivityLog,
  getMyActivityLogs,
  getWeeklySummary
};