'use strict';
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    UserId: {
      type: DataTypes.INTEGER(11),
      onDelete: 'CASCADE',
      references: {
        model: 'Users',
        key: 'id'
      }
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

    Category.belongsToMany( models.Entry, {
        through: 'EntryCategories',
        foreignKey: 'CategoryId'
    });
  };
  return Category;
};