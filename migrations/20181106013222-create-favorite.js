'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Favorites', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      UserId: {
        type: Sequelize.INTEGER(11),
        onDelete: 'RESTRICT',
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      label: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      type: {
        type: Sequelize.INTEGER(1),
        allowNull: false
      },
      value: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Favorites');
  }
};