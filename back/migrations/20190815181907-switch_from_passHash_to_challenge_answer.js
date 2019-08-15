'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.removeColumn( 'Users', 'passHash' ).then( () => {
      return queryInterface.addColumn( 'Users', 'challengeAnswer', {
        type: Sequelize.STRING
      } )
    } )
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.removeColumn( 'Users', 'challengeAnswer' ).then( () => {
      return queryInterface.addColumn( 'Users', 'passHash', {
        allowNull: false,
        type: Sequelize.TEXT
      } )
    } )
  }
};
