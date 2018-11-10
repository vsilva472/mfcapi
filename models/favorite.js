'use strict';
module.exports = (sequelize, DataTypes) => {
  const Favorite = sequelize.define('Favorite', {
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
    price: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    }
  }, {});
  Favorite.associate = function(models) {
    // associations can be defined here
    Favorite.belongsTo(models.User, {
      foreignKey: 'UserId',
      onDelete: 'CASCADE'
    });

    Favorite.belongsToMany(models.Category, {
        through: 'CategoryFavorites',
        foreignKey: 'FavoriteId'
    });
  };

  return Favorite;
};