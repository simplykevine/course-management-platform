const { 
  ActivityTracker, 
  CourseOffering, 
  Module, 
  Class,
  Cohort,
  Facilitator,
  User
} = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class ActivityService {
  async createActivityLog(data, facilitatorId) {
    try {
      // Verify facilitator owns the course offering
      const courseOffering = await CourseOffering.findByPk(data.allocationId);
      
      if (!courseOffering) {
        throw new Error('Course offering not found');
      }
      
      if (courseOffering.facilitatorId !== facilitatorId) {
        throw new Error('You are not assigned to this course offering');
      }
      
      // Check for duplicate log
      const existing = await ActivityTracker.findOne({
        where: {
          allocationId: data.allocationId,
          weekNumber: data.weekNumber
        }
      });
      
      if (existing) {
        throw new Error(`Activity log already exists for week ${data.weekNumber}`);
      }
      
      // Create activity log
      const activityLog = await ActivityTracker.create(data);
      
      // Return with associations
      return this.getActivityLogById(activityLog.id);
    } catch (error) {
      logger.error('Create activity log error:', error);
      throw error;
    }
  }
  
  async getAllActivityLogs(filters = {}, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const where = {};
      const courseOfferingWhere = {};
      
      // Apply filters
      if (filters.allocationId) where.allocationId = filters.allocationId;
      if (filters.weekNumber) where.weekNumber = filters.weekNumber;
      if (filters.facilitatorId) courseOfferingWhere.facilitatorId = filters.facilitatorId;
      
      // Status filter (based on completion)
      if (filters.status === 'complete') {
        where.submittedAt = { [Op.not]: null };
      } else if (filters.status === 'incomplete') {
        where.submittedAt = null;
      }
      
      const { count, rows } = await ActivityTracker.findAndCountAll({
        where,
        include: [
          {
            model: CourseOffering,
            as: 'courseOffering',
            where: courseOfferingWhere,
            include: [
              { model: Module, as: 'module' },
              { 
                model: Facilitator, 
                as: 'facilitator',
                include: [{ model: User, as: 'user' }]
              }
            ]
          }
        ],
        limit,
        offset,
        order: [['weekNumber', 'DESC'], ['createdAt', 'DESC']]
      });
      
      return {
        activityLogs: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error('Get activity logs error:', error);
      throw error;
    }
  }
  
  async getActivityLogById(id) {
    try {
      const activityLog = await ActivityTracker.findByPk(id, {
        include: [
          {
            model: CourseOffering,
            as: 'courseOffering',
            include: [
              { model: Module, as: 'module' },
              { model: Class, as: 'class' },
              { model: Cohort, as: 'cohort' },
              { 
                model: Facilitator, 
                as: 'facilitator',
                include: [{ model: User, as: 'user' }]
              }
            ]
          }
        ]
      });
      
      return activityLog;
    } catch (error) {
      logger.error('Get activity log by ID error:', error);
      throw error;
    }
  }
  
  async updateActivityLog(id, updates) {
    try {
      const activityLog = await ActivityTracker.findByPk(id);
      
      if (!activityLog) {
        return null;
      }
      
      // Don't allow changing allocation or week number
      delete updates.allocationId;
      delete updates.weekNumber;
      
      await activityLog.update(updates);
      
      return this.getActivityLogById(id);
    } catch (error) {
      logger.error('Update activity log error:', error);
      throw error;
    }
  }
  
  async deleteActivityLog(id) {
    try {
      const activityLog = await ActivityTracker.findByPk(id);
      
      if (!activityLog) {
        return false;
      }
      
      await activityLog.destroy();
      
      return true;
    } catch (error) {
      logger.error('Delete activity log error:', error);
      throw error;
    }
  }
  
  async getFacilitatorLogs(facilitatorId, filters = {}) {
    try {
      const where = {};
      
      if (filters.weekNumber) where.weekNumber = filters.weekNumber;
      if (filters.allocationId) where.allocationId = filters.allocationId;
      
      const logs = await ActivityTracker.findAll({
        where,
        include: [
          {
            model: CourseOffering,
            as: 'courseOffering',
            where: { facilitatorId },
            include: [
              { model: Module, as: 'module' },
              { model: Class, as: 'class' },
              { model: Cohort, as: 'cohort' }
            ]
          }
        ],
        order: [['weekNumber', 'DESC'], ['createdAt', 'DESC']]
      });
      
      return logs;
    } catch (error) {
      logger.error('Get facilitator logs error:', error);
      throw error;
    }
  }
  
  async checkFacilitatorOwnership(activityLogId, facilitatorId) {
    try {
      const activityLog = await ActivityTracker.findByPk(activityLogId, {
        include: [{
          model: CourseOffering,
          as: 'courseOffering',
          attributes: ['facilitatorId']
        }]
      });
      
      if (!activityLog) {
        return false;
      }
      
      return activityLog.courseOffering.facilitatorId === facilitatorId;
    } catch (error) {
      logger.error('Check facilitator ownership error:', error);
      throw error;
    }
  }
  
  async getWeeklySummary(weekNumber) {
    try {
      const logs = await ActivityTracker.findAll({
        where: { weekNumber },
        include: [
          {
            model: CourseOffering,
            as: 'courseOffering',
            include: [
              { model: Module, as: 'module' },
              { 
                model: Facilitator, 
                as: 'facilitator',
                include: [{ model: User, as: 'user' }]
              }
            ]
          }
        ]
      });
      
      const summary = {
        weekNumber,
        totalExpected: await CourseOffering.count({ where: { status: 'active' } }),
        totalSubmitted: logs.length,
        completeSubmissions: logs.filter(log => log.isComplete()).length,
        incompleteSubmissions: logs.filter(log => !log.isComplete()).length,
        submissions: logs.map(log => ({
          id: log.id,
          courseName: log.courseOffering.module.name,
          facilitatorName: log.courseOffering.facilitator.user.getFullName(),
          completionPercentage: log.getCompletionPercentage(),
          submittedAt: log.submittedAt,
          status: log.isComplete() ? 'Complete' : 'Incomplete'
        }))
      };
      
      return summary;
    } catch (error) {
      logger.error('Get weekly summary error:', error);
      throw error;
    }
  }
  
  async getMissingLogs(weekNumber) {
    try {
      // Get all active course offerings
      const activeCourses = await CourseOffering.findAll({
        where: { status: 'active' },
        include: [
          { model: Module, as: 'module' },
          { 
            model: Facilitator, 
            as: 'facilitator',
            include: [{ model: User, as: 'user' }]
          }
        ]
      });
      
      // Get submitted logs for the week
      const submittedLogs = await ActivityTracker.findAll({
        where: { weekNumber },
        attributes: ['allocationId']
      });
      
      const submittedAllocationIds = submittedLogs.map(log => log.allocationId);
      
      // Find courses without logs
      const missingLogs = activeCourses.filter(
        course => !submittedAllocationIds.includes(course.id)
      );
      
      return missingLogs.map(course => ({
        courseOfferingId: course.id,
        courseName: course.module.name,
        facilitatorName: course.facilitator.user.getFullName(),
        facilitatorEmail: course.facilitator.user.email
      }));
    } catch (error) {
      logger.error('Get missing logs error:', error);
      throw error;
    }
  }
}

module.exports = new ActivityService();