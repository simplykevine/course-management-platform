const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ActivityTracker = sequelize.define('ActivityTracker', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    allocationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'allocation_id',
      references: {
        model: 'course_offerings',
        key: 'id'
      }
    },
    weekNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'week_number',
      validate: {
        min: 1,
        max: 16
      }
    },
    attendance: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidAttendanceArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Attendance must be an array');
          }
          if (value.some(item => typeof item !== 'boolean')) {
            throw new Error('All attendance values must be boolean');
          }
        }
      }
    },
    formativeOneGrading: {
      type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
      defaultValue: 'Not Started',
      field: 'formative_one_grading'
    },
    formativeTwoGrading: {
      type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
      defaultValue: 'Not Started',
      field: 'formative_two_grading'
    },
    summativeGrading: {
      type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
      defaultValue: 'Not Started',
      field: 'summative_grading'
    },
    courseModeration: {
      type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
      defaultValue: 'Not Started',
      field: 'course_moderation'
    },
    intranetSync: {
      type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
      defaultValue: 'Not Started',
      field: 'intranet_sync'
    },
    gradeBookStatus: {
      type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
      defaultValue: 'Not Started',
      field: 'grade_book_status'
    },
    submittedAt: {
      type: DataTypes.DATE,
      field: 'submitted_at'
    },
    lastReminderSent: {
      type: DataTypes.DATE,
      field: 'last_reminder_sent'
    },
    reminderCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'reminder_count'
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'activity_trackers',
    timestamps: true,
    underscored: true,
    paranoid: true,
    indexes: [
      {
        name: 'activity_unique_idx',
        unique: true,
        fields: ['allocation_id', 'week_number']
      },
      {
        fields: ['week_number']
      },
      {
        fields: ['submitted_at']
      },
      // Add composite index for common filtering queries
      {
        name: 'activity_status_week_idx',
        fields: ['week_number', 'submitted_at']
      },
      // Add index for facilitator queries
      {
        name: 'activity_allocation_week_idx',
        fields: ['allocation_id', 'week_number', 'submitted_at']
      }
    ]
  });

  // Instance methods
  ActivityTracker.prototype.isComplete = function () {
    return this.formativeOneGrading === 'Done' &&
      this.formativeTwoGrading === 'Done' &&
      this.summativeGrading === 'Done' &&
      this.courseModeration === 'Done' &&
      this.intranetSync === 'Done' &&
      this.gradeBookStatus === 'Done' &&
      this.attendance.length > 0;
  };

  ActivityTracker.prototype.getCompletionPercentage = function () {
    const statuses = [
      this.formativeOneGrading,
      this.formativeTwoGrading,
      this.summativeGrading,
      this.courseModeration,
      this.intranetSync,
      this.gradeBookStatus
    ];

    const completed = statuses.filter(status => status === 'Done').length;
    const hasAttendance = this.attendance.length > 0 ? 1 : 0;

    return Math.round(((completed + hasAttendance) / 7) * 100);
  };

  ActivityTracker.prototype.markSubmitted = async function () {
    this.submittedAt = new Date();
    await this.save();
  };

  ActivityTracker.prototype.incrementReminderCount = async function () {
    this.reminderCount += 1;
    this.lastReminderSent = new Date();
    await this.save();
  };

  return ActivityTracker;
};