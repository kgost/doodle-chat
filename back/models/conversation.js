'use strict';
module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define('Conversation', {
    name: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {});
  Conversation.associate = function(models) {
    Conversation.belongsToMany( models.User, { as: 'participants', through: 'Participants', foreignKey: 'conversationId' } )
    Conversation.hasMany( models.ConversationMessage, { as: 'messages', foreignKey: 'conversationId', onDelete: 'CASCADE' } )
    Conversation.belongsTo( models.User, { as: 'owner' } )
  };
  return Conversation;
};
