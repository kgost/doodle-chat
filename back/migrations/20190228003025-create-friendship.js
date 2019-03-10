'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Friendships', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userOneId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      userTwoId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      userOneAccessKey: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      userTwoAccessKey: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      userOneAccepted: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      userTwoAccepted: {
        allowNull: false,
        type: Sequelize.BOOLEAN
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
    return queryInterface.dropTable('Friendships');
  }
};
