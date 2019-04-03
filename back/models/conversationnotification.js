'use strict';
module.exports = (sequelize, DataTypes) => {
  const ConversationNotification = sequelize.define('ConversationNotification', {
    conversationId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    sent: {
      allowNull: false,
      type: DataTypes.BOOLEAN
    }
  }, {});
  ConversationNotification.associate = function(models) {
    ConversationNotification.belongsTo( models.Conversation, { as: 'conversation', foreignKey: 'conversationId', onDelete: 'CASCADE' } )
    ConversationNotification.belongsTo( models.User, { as: 'user', foreignKey: 'userId', onDelete: 'CASCADE' } )
  };
  return ConversationNotification;
};
