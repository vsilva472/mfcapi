'use strict';
module.exports = (sequelize, DataTypes) => {
  const Entry = sequelize.define( 'Entry', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
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
      onDelete: 'CASCADE'
    });

    Entry.belongsToMany(models.Category, {
      through: 'EntryCategories',
      foreignKey: 'EntryId'
    });
  };
  return Entry;
};