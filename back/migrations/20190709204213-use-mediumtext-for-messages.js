'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.changeColumn( 'ConversationMessages', 'message', {
      allowNull: false,
      type: Sequelize.TEXT( 'medium' ),
    } ).then( () => {
      return queryInterface.changeColumn( 'FriendshipMessages', 'message', {
        allowNull: false,
        type: Sequelize.TEXT( 'medium' ),
      } );
    } );
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.changeColumn( 'ConversationMessages', 'message', {
      allowNull: false,
      type: Sequelize.TEXT,
    } ).then( () => {
      return queryInterface.changeColumn( 'FriendshipMessages', 'message', {
        allowNull: false,
        type: Sequelize.TEXT,
      } );
    } );
  }
};
