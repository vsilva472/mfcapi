'use strict';
module.exports = (sequelize, DataTypes) => {
  const Favorite = sequelize.define('Favorite', {
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
    }
  }, {});
  Favorite.associate = function(models) {
    // associations can be defined here
    Favorite.belongsTo(models.User, {
      foreignKey: 'UserId',
      onDelete: 'RESTRICT'
    });
  };

  return Favorite;
};