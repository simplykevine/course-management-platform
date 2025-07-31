const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Student = sequelize.define('Student', {
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
    studentId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'student_id'
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
    enrollmentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'enrollment_date'
    },
    expectedGraduation: {
      type: DataTypes.DATE,
      field: 'expected_graduation'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'graduated', 'withdrawn'),
      defaultValue: 'active'
    },
    gpa: {
      type: DataTypes.DECIMAL(3, 2),
      validate: {
        min: 0.0,
        max: 4.0
      }
    }
  }, {
    tableName: 'students',
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
        fields: ['student_id']
      },
      {
        fields: ['cohort_id']
      },
      {
        fields: ['status']
      }
    ]
  });

  return Student;
};