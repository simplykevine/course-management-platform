const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Manager = sequelize.define('Manager', {
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
    managementLevel: {
      type: DataTypes.ENUM('senior', 'middle', 'junior'),
      defaultValue: 'junior',
      field: 'management_level'
    },
    canApproveAllocations: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'can_approve_allocations'
    }
  }, {
    tableName: 'managers',
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

  return Manager;
};