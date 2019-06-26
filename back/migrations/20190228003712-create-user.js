'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
      },
      passHash: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      publicKey: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      encPrivateKey: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      pushSub: {
        allowNull: false,
        type: Sequelize.JSON
      },
      nonce: {
        type: Sequelize.STRING
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
    return queryInterface.dropTable('Users');
  }
};
