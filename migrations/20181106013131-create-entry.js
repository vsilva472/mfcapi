'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Entries', {
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
      registeredAt: {
        allowNull: false,
        type: Sequelize.DATE
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
    return queryInterface.dropTable('Entries');
  }
};