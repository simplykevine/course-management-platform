const { Sequelize } = require('sequelize');
const config = require('../config/database');
const logger = require('../utils/logger');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    ...dbConfig,
    logging: (msg) => logger.debug(msg)
  }
);

// Import models
const User = require('./User')(sequelize);
const Manager = require('./Manager')(sequelize);
const Facilitator = require('./Facilitator')(sequelize);
const Student = require('./Student')(sequelize);
const Module = require('./Module')(sequelize);
const Cohort = require('./Cohort')(sequelize);
const Class = require('./Class')(sequelize);
const Mode = require('./Mode')(sequelize);
const CourseOffering = require('./CourseOffering')(sequelize);
const ActivityTracker = require('./ActivityTracker')(sequelize);

// Define associations
const models = {
  User,
  Manager,
  Facilitator,
  Student,
  Module,
  Cohort,
  Class,
  Mode,
  CourseOffering,
  ActivityTracker
};

// User associations
User.hasOne(Manager, { foreignKey: 'user_id', as: 'manager' });
User.hasOne(Facilitator, { foreignKey: 'user_id', as: 'facilitator' });
User.hasOne(Student, { foreignKey: 'user_id', as: 'student' });

Manager.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Facilitator.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Student.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Course Offering associations
CourseOffering.belongsTo(Module, { foreignKey: 'module_id', as: 'module' });
CourseOffering.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
CourseOffering.belongsTo(Cohort, { foreignKey: 'cohort_id', as: 'cohort' });
CourseOffering.belongsTo(Facilitator, { foreignKey: 'facilitator_id', as: 'facilitator' });
CourseOffering.belongsTo(Mode, { foreignKey: 'mode_id', as: 'mode' });

Module.hasMany(CourseOffering, { foreignKey: 'module_id', as: 'courseOfferings' });
Class.hasMany(CourseOffering, { foreignKey: 'class_id', as: 'courseOfferings' });
Cohort.hasMany(CourseOffering, { foreignKey: 'cohort_id', as: 'courseOfferings' });
Facilitator.hasMany(CourseOffering, { foreignKey: 'facilitator_id', as: 'courseOfferings' });
Mode.hasMany(CourseOffering, { foreignKey: 'mode_id', as: 'courseOfferings' });

// Activity Tracker associations
ActivityTracker.belongsTo(CourseOffering, { foreignKey: 'allocation_id', as: 'courseOffering' });
CourseOffering.hasMany(ActivityTracker, { foreignKey: 'allocation_id', as: 'activityLogs' });

// Student-Cohort association
Student.belongsTo(Cohort, { foreignKey: 'cohort_id', as: 'cohort' });
Cohort.hasMany(Student, { foreignKey: 'cohort_id', as: 'students' });

// Execute association methods if they exist
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  sequelize,
  Sequelize,
  ...models
};