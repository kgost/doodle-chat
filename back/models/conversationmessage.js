'use strict';
module.exports = (sequelize, DataTypes) => {
  const ConversationMessage = sequelize.define('ConversationMessage', {
    conversationId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    message: {
      allowNull: false,
      type: DataTypes.TEXT( 'medium' )
    },
  }, {});
  ConversationMessage.associate = function(models) {
    ConversationMessage.belongsTo( models.User, { as: 'author', foreignKey: 'userId', onDelete: 'CASCADE' } )
    ConversationMessage.belongsTo( models.Conversation, { as: 'conversation', foreignKey: 'conversationId', onDelete: 'CASCADE' } )
    ConversationMessage.hasMany( models.ConversationReaction, { as: 'reactions', foreignKey: 'conversationMessageId', onDelete: 'CASCADE' } )
  };
  return ConversationMessage;
};
