'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable( 'EntryCategories', { 
      CategoryId: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'Categories',
          key: 'id'
        }
      },
      EntryId: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'Entries',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });   
  },

  down: (queryInterface, Sequelize) => {    
    return queryInterface.dropTable( 'EntryCategories' );
  }
};
