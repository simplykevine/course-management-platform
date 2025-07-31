const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Mode = sequelize.define('Mode', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 50]
      }
    },
    description: {
      type: DataTypes.TEXT,
      validate: {
        len: [0, 500]
      }
    },
    requiresPhysicalPresence: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'requires_physical_presence'
    }
  }, {
    tableName: 'modes',
    timestamps: true,
    underscored: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['name']
      }
    ]
  });

  // Instance methods
  Mode.prototype.isOnline = function() {
    return this.name.toLowerCase().includes('online') && !this.requiresPhysicalPresence;
  };

  Mode.prototype.isInPerson = function() {
    return this.name.toLowerCase().includes('person') && this.requiresPhysicalPresence;
  };

  Mode.prototype.isHybrid = function() {
    return this.name.toLowerCase().includes('hybrid');
  };

  return Mode;
};