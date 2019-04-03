'use strict';
module.exports = (sequelize, DataTypes) => {
  const ConversationReaction = sequelize.define('ConversationReaction', {
    userId: DataTypes.INTEGER,
    conversationMessageId: DataTypes.INTEGER,
    emoji: {
      allowNull: false,
      type: DataTypes.STRING
    }
  }, {});
  ConversationReaction.associate = function(models) {
    ConversationReaction.belongsTo( models.User, { as: 'user', foreignKey: 'userId', onDelete: 'CASCADE' } )
    ConversationReaction.belongsTo( models.ConversationMessage, { as: 'message', foreignKey: 'conversationMessageId', onDelete: 'CASCADE' } )
  };
  return ConversationReaction;
};
