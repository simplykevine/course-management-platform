const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Cohort = sequelize.define('Cohort', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
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
    program: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'cohorts',
    timestamps: true,
    underscored: true,
    paranoid: true,
    validate: {
      endDateAfterStartDate() {
        if (this.endDate <= this.startDate) {
          throw new Error('End date must be after start date');
        }
      }
    }
  });

  return Cohort;
};