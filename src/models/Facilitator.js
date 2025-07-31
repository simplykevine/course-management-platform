const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Facilitator = sequelize.define('Facilitator', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    employeeId: {
      type: DataTypes.STRING(50),
      unique: true,
      field: 'employee_id'
    },
    department: {
      type: DataTypes.STRING(100)
    },
    specialization: {
      type: DataTypes.STRING(255)
    },
    qualifications: {
      type: DataTypes.TEXT
    },
    experienceYears: {
      type: DataTypes.INTEGER,
      field: 'experience_years',
      validate: {
        min: 0
      }
    },
    maxCourseLoad: {
      type: DataTypes.INTEGER,
      defaultValue: 4,
      field: 'max_course_load',
      validate: {
        min: 1,
        max: 10
      }
    },
    currentCourseLoad: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'current_course_load',
      validate: {
        min: 0
      }
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_available'
    }
  }, {
    tableName: 'facilitators',
    timestamps: true,
    underscored: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id']
      },
      {
        unique: true,
        fields: ['employee_id']
      }
    ]
  });

  // Instance methods
  Facilitator.prototype.canTakeMoreCourses = function() {
    return this.currentCourseLoad < this.maxCourseLoad && this.isAvailable;
  };

  Facilitator.prototype.getRemainingCapacity = function() {
    return this.maxCourseLoad - this.currentCourseLoad;
  };

  return Facilitator;
};