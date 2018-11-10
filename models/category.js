'use strict';
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    label: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: false,
    }
  }, {});
  Category.associate = function(models) {
    // associations can be defined here
    Category.belongsTo(models.User, {
      foreignKey: 'UserId',
      onDelete: 'CASCADE'
    });

    Category.belongsToMany( models.Favorite, {
        through: 'CategoryFavorites',
        foreignKey: 'CategoryId'
    });
  };
  return Category;
};