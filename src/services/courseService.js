const { 
  CourseOffering, 
  Module, 
  Class, 
  Cohort, 
  Facilitator, 
  Mode,
  User,
  ActivityTracker,
  sequelize
} = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class CourseService {
  async createCourseOffering(data) {
    try {
      // Check for duplicate course offering
      const existing = await CourseOffering.findOne({
        where: {
          moduleId: data.moduleId,
          classId: data.classId,
          cohortId: data.cohortId,
          trimester: data.trimester,
          intakePeriod: data.intakePeriod
        }
      });
      
      if (existing) {
        throw new Error('Course offering already exists for this combination');
      }
      
      // Create course offering
      const courseOffering = await CourseOffering.create(data);
      
      // Update facilitator course load if assigned
      if (data.facilitatorId) {
        await this.updateFacilitatorLoad(data.facilitatorId, 1);
      }
      
      // Return with associations
      return this.getCourseOfferingById(courseOffering.id);
    } catch (error) {
      logger.error('Create course offering error:', error);
      throw error;
    }
  }
  
  async getAllCourseOfferings(filters = {}, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const where = {};
      
      // Apply filters
      if (filters.trimester) where.trimester = filters.trimester;
      if (filters.cohortId) where.cohortId = filters.cohortId;
      if (filters.facilitatorId) where.facilitatorId = filters.facilitatorId;
      if (filters.intakePeriod) where.intakePeriod = filters.intakePeriod;
      if (filters.modeId) where.modeId = filters.modeId;
      if (filters.status) where.status = filters.status;
      
      const { count, rows } = await CourseOffering.findAndCountAll({
        where,
        include: [
          { model: Module, as: 'module' },
          { model: Class, as: 'class' },
          { model: Cohort, as: 'cohort' },
          { 
            model: Facilitator, 
            as: 'facilitator',
            include: [{ model: User, as: 'user' }]
          },
          { model: Mode, as: 'mode' }
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });
      
      return {
        courseOfferings: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error('Get course offerings error:', error);
      throw error;
    }
  }
  
  async getCourseOfferingById(id) {
    try {
      const courseOffering = await CourseOffering.findByPk(id, {
        include: [
          { model: Module, as: 'module' },
          { model: Class, as: 'class' },
          { model: Cohort, as: 'cohort' },
          { 
            model: Facilitator, 
            as: 'facilitator',
            include: [{ model: User, as: 'user' }]
          },
          { model: Mode, as: 'mode' },
          { 
            model: ActivityTracker, 
            as: 'activityLogs',
            order: [['weekNumber', 'ASC']]
          }
        ]
      });
      
      return courseOffering;
    } catch (error) {
      logger.error('Get course offering by ID error:', error);
      throw error;
    }
  }
  
  async updateCourseOffering(id, updates) {
    try {
      const courseOffering = await CourseOffering.findByPk(id);
      
      if (!courseOffering) {
        return null;
      }
      
      // Handle facilitator change
      if (updates.facilitatorId && updates.facilitatorId !== courseOffering.facilitatorId) {
        // Decrease old facilitator's load
        if (courseOffering.facilitatorId) {
          await this.updateFacilitatorLoad(courseOffering.facilitatorId, -1);
        }
        // Increase new facilitator's load
        await this.updateFacilitatorLoad(updates.facilitatorId, 1);
      }
      
      // Update course offering
      await courseOffering.update(updates);
      
      return this.getCourseOfferingById(id);
    } catch (error) {
      logger.error('Update course offering error:', error);
      throw error;
    }
  }
  
  async deleteCourseOffering(id) {
    try {
      const courseOffering = await CourseOffering.findByPk(id);
      
      if (!courseOffering) {
        return false;
      }
      
      // Update facilitator load
      if (courseOffering.facilitatorId) {
        await this.updateFacilitatorLoad(courseOffering.facilitatorId, -1);
      }
      
      // Soft delete
      await courseOffering.destroy();
      
      return true;
    } catch (error) {
      logger.error('Delete course offering error:', error);
      throw error;
    }
  }
  
  async assignFacilitator(courseOfferingId, facilitatorId) {
    const transaction = await sequelize.transaction();
    
    try {
      const courseOffering = await CourseOffering.findByPk(courseOfferingId, { transaction });
      
      if (!courseOffering) {
        throw new Error('Course offering not found');
      }
      
      const facilitator = await Facilitator.findByPk(facilitatorId, { transaction });
      
      if (!facilitator) {
        throw new Error('Facilitator not found');
      }
      
      if (!facilitator.isAvailable) {
        throw new Error('Facilitator is not available');
      }
      
      if (!facilitator.canTakeMoreCourses()) {
        throw new Error(`Facilitator has reached maximum course load (${facilitator.maxCourseLoad})`);
      }
      
      // Update facilitator assignment
      const oldFacilitatorId = courseOffering.facilitatorId;
      courseOffering.facilitatorId = facilitatorId;
      await courseOffering.save({ transaction });
      
      // Update course loads
      if (oldFacilitatorId && oldFacilitatorId !== facilitatorId) {
        await this.updateFacilitatorLoad(oldFacilitatorId, -1, transaction);
      }
      await this.updateFacilitatorLoad(facilitatorId, 1, transaction);
      
      await transaction.commit();
      
      return this.getCourseOfferingById(courseOfferingId);
    } catch (error) {
      await transaction.rollback();
      logger.error('Assign facilitator error:', error);
      throw error;
    }
  }
  
  async getFacilitatorCourses(facilitatorId) {
    try {
      const courses = await CourseOffering.findAll({
        where: { 
          facilitatorId,
          status: { [Op.in]: ['planned', 'active'] }
        },
        include: [
          { model: Module, as: 'module' },
          { model: Class, as: 'class' },
          { model: Cohort, as: 'cohort' },
          { model: Mode, as: 'mode' },
          { 
            model: ActivityTracker, 
            as: 'activityLogs',
            required: false
          }
        ],
        order: [['startDate', 'ASC']]
      });
      
      return courses;
    } catch (error) {
      logger.error('Get facilitator courses error:', error);
      throw error;
    }
  }
  
  async updateFacilitatorLoad(facilitatorId, change, transaction = null) {
    try {
      const facilitator = await Facilitator.findByPk(facilitatorId, { transaction });
      if (facilitator) {
        facilitator.currentCourseLoad += change;
        await facilitator.save({ transaction });
      }
    } catch (error) {
      logger.error('Update facilitator load error:', error);
      throw error;
    }
  }
  
  async createModule(moduleData) {
    try {
      const module = await Module.create(moduleData);
      return module;
    } catch (error) {
      logger.error('Create module error:', error);
      throw error;
    }
  }
  
  async getAllModules() {
    try {
      const modules = await Module.findAll({
        where: { isActive: true },
        order: [['code', 'ASC']]
      });
      return modules;
    } catch (error) {
      logger.error('Get modules error:', error);
      throw error;
    }
  }
  
  async createClass(classData) {
    try {
      const classEntity = await Class.create(classData);
      return classEntity;
    } catch (error) {
      logger.error('Create class error:', error);
      throw error;
    }
  }
  
  async createCohort(cohortData) {
    try {
      const cohort = await Cohort.create(cohortData);
      return cohort;
    } catch (error) {
      logger.error('Create cohort error:', error);
      throw error;
    }
  }
  
  async getAvailableFacilitators() {
    try {
      const facilitators = await Facilitator.findAll({
        where: { isAvailable: true },
        include: [{ model: User, as: 'user' }],
        order: [['currentCourseLoad', 'ASC']]
      });
      
      return facilitators.filter(f => f.canTakeMoreCourses());
    } catch (error) {
      logger.error('Get available facilitators error:', error);
      throw error;
    }
  }
}

module.exports = new CourseService();