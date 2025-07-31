const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CourseOffering = sequelize.define('CourseOffering', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    moduleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'module_id',
      references: {
        model: 'modules',
        key: 'id'
      }
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'class_id',
      references: {
        model: 'classes',
        key: 'id'
      }
    },
    cohortId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'cohort_id',
      references: {
        model: 'cohorts',
        key: 'id'
      }
    },
    facilitatorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'facilitator_id',
      references: {
        model: 'facilitators',
        key: 'id'
      }
    },
    modeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'mode_id',
      references: {
        model: 'modes',
        key: 'id'
      }
    },
    trimester: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 3
      }
    },
    intakePeriod: {
      type: DataTypes.ENUM('HT1', 'HT2', 'FT'),
      allowNull: false,
      field: 'intake_period'
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_date'
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'end_date'
    },
    maxStudents: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
      field: 'max_students',
      validate: {
        min: 1
      }
    },
    enrolledStudents: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'enrolled_students',
      validate: {
        min: 0
      }
    },
    status: {
      type: DataTypes.ENUM('planned', 'active', 'completed', 'cancelled'),
      defaultValue: 'planned'
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'course_offerings',
    timestamps: true,
    underscored: true,
    paranoid: true,
    indexes: [
      {
        // Shortened index name to avoid MySQL length limit
        name: 'course_unique_idx',
        unique: true,
        fields: ['module_id', 'class_id', 'cohort_id', 'trimester', 'intake_period']
      },
      {
        fields: ['facilitator_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['trimester', 'intake_period']
      }
    ],
    validate: {
      endDateAfterStartDate() {
        if (this.endDate <= this.startDate) {
          throw new Error('End date must be after start date');
        }
      },
      enrollmentNotExceedMax() {
        if (this.enrolledStudents > this.maxStudents) {
          throw new Error('Enrolled students cannot exceed maximum students');
        }
      }
    }
  });

  // Instance methods
  CourseOffering.prototype.isAvailable = function() {
    return this.enrolledStudents < this.maxStudents && this.status === 'active';
  };

  CourseOffering.prototype.getRemainingSlots = function() {
    return this.maxStudents - this.enrolledStudents;
  };

  CourseOffering.prototype.incrementEnrollment = async function() {
    if (this.enrolledStudents >= this.maxStudents) {
      throw new Error('Course is full');
    }
    this.enrolledStudents += 1;
    await this.save();
  };

  CourseOffering.prototype.decrementEnrollment = async function() {
    if (this.enrolledStudents <= 0) {
      throw new Error('No students enrolled');
    }
    this.enrolledStudents -= 1;
    await this.save();
  };

  return CourseOffering;
};