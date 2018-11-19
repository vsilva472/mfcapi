'use strict';
module.exports = (sequelize, DataTypes) => {
  const Entry = sequelize.define( 'Entry', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    UserId: {
      type: DataTypes.INTEGER(11),
      onDelete: 'RESTRICT',
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    label: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    type: {
      type: DataTypes.INTEGER(1),
      allowNull: false
    },
    value: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    registeredAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {});
  Entry.associate = function(models) {
    // associations can be defined here
    Entry.belongsTo(models.User, {
      foreignKey: 'UserId',
      onDelete: 'RESTRICT'
    });

    Entry.belongsToMany(models.Category, {
      through: 'EntryCategories',
      foreignKey: 'EntryId',
      onDelete: 'RESTRICT'
    });
  };
  return Entry;
};