const { validationResult } = require('express-validator');
const courseService = require('../services/courseService');
const logger = require('../utils/logger');

const createCourseOffering = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: errors.array()
      });
    }

    const courseData = req.body;
    const courseOffering = await courseService.createCourseOffering(courseData);
    
    logger.info(`Course offering created: ${courseOffering.id}`);
    
    res.status(201).json({
      message: 'Course offering created successfully',
      courseOffering
    });
  } catch (error) {
    logger.error('Create course offering error:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        error: 'Duplicate course offering',
        message: error.message
      });
    }
    
    res.status(500).json({
      error: 'Failed to create course offering',
      message: error.message || 'Unable to create course offering'
    });
  }
};

const getAllCourseOfferings = async (req, res) => {
  try {
    const filters = {
      trimester: req.query.trimester,
      cohortId: req.query.cohortId,
      facilitatorId: req.query.facilitatorId,
      intakePeriod: req.query.intakePeriod,
      modeId: req.query.modeId,
      status: req.query.status
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => 
      filters[key] === undefined && delete filters[key]
    );

    const { page = 1, limit = 10 } = req.query;
    const offerings = await courseService.getAllCourseOfferings(filters, page, limit);
    
    res.json(offerings);
  } catch (error) {
    logger.error('Get course offerings error:', error);
    res.status(500).json({
      error: 'Failed to retrieve course offerings',
      message: 'Unable to fetch course offerings'
    });
  }
};

const getCourseOfferingById = async (req, res) => {
  try {
    const { id } = req.params;
    const courseOffering = await courseService.getCourseOfferingById(id);
    
    if (!courseOffering) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Course offering not found'
      });
    }
    
    res.json({ courseOffering });
  } catch (error) {
    logger.error('Get course offering error:', error);
    res.status(500).json({
      error: 'Failed to retrieve course offering',
      message: 'Unable to fetch course offering details'
    });
  }
};

const updateCourseOffering = async (req, res) => {
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
    
    const courseOffering = await courseService.updateCourseOffering(id, updates);
    
    if (!courseOffering) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Course offering not found'
      });
    }
    
    logger.info(`Course offering updated: ${id}`);
    
    res.json({
      message: 'Course offering updated successfully',
      courseOffering
    });
  } catch (error) {
    logger.error('Update course offering error:', error);
    res.status(500).json({
      error: 'Failed to update course offering',
      message: error.message || 'Unable to update course offering'
    });
  }
};

const deleteCourseOffering = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await courseService.deleteCourseOffering(id);
    
    if (!result) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Course offering not found'
      });
    }
    
    logger.info(`Course offering deleted: ${id}`);
    
    res.json({
      message: 'Course offering deleted successfully'
    });
  } catch (error) {
    logger.error('Delete course offering error:', error);
    res.status(500).json({
      error: 'Failed to delete course offering',
      message: 'Unable to delete course offering'
    });
  }
};

const assignFacilitator = async (req, res) => {
  try {
    const { id } = req.params;
    const { facilitatorId } = req.body;
    
    if (!facilitatorId) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Facilitator ID is required'
      });
    }
    
    const courseOffering = await courseService.assignFacilitator(id, facilitatorId);
    
    logger.info(`Facilitator ${facilitatorId} assigned to course offering ${id}`);
    
    res.json({
      message: 'Facilitator assigned successfully',
      courseOffering
    });
  } catch (error) {
    logger.error('Assign facilitator error:', error);
    res.status(500).json({
      error: 'Failed to assign facilitator',
      message: error.message || 'Unable to assign facilitator'
    });
  }
};

const getMyAssignedCourses = async (req, res) => {
  try {
    // For facilitators to view their assigned courses
    const facilitatorId = req.user.facilitator?.id;
    
    if (!facilitatorId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You must be a facilitator to view assigned courses'
      });
    }
    
    const courses = await courseService.getFacilitatorCourses(facilitatorId);
    
    res.json({
      courses,
      total: courses.length
    });
  } catch (error) {
    logger.error('Get assigned courses error:', error);
    res.status(500).json({
      error: 'Failed to retrieve assigned courses',
      message: 'Unable to fetch your assigned courses'
    });
  }
};

const createModule = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: errors.array()
      });
    }

    const moduleData = req.body;
    const module = await courseService.createModule(moduleData);
    
    logger.info(`Module created: ${module.code}`);
    
    res.status(201).json({
      message: 'Module created successfully',
      module
    });
  } catch (error) {
    logger.error('Create module error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        error: 'Duplicate module',
        message: 'A module with this code already exists'
      });
    }
    
    res.status(500).json({
      error: 'Failed to create module',
      message: 'Unable to create module'
    });
  }
};

const getAllModules = async (req, res) => {
  try {
    const modules = await courseService.getAllModules();
    res.json({ modules });
  } catch (error) {
    logger.error('Get modules error:', error);
    res.status(500).json({
      error: 'Failed to retrieve modules',
      message: 'Unable to fetch modules'
    });
  }
};

module.exports = {
  createCourseOffering,
  getAllCourseOfferings,
  getCourseOfferingById,
  updateCourseOffering,
  deleteCourseOffering,
  assignFacilitator,
  getMyAssignedCourses,
  createModule,
  getAllModules
};