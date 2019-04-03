'use strict';
module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define('Conversation', {
    name: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    userId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
  }, {});
  Conversation.associate = function(models) {
    Conversation.belongsToMany( models.User, { as: 'users', through: models.Participant, foreignKey: 'conversationId', onDelete: 'CASCADE' } )
    Conversation.hasMany( models.Participant, { as: 'participants', foreignKey: 'conversationId', onDelete: 'CASCADE' } )
    Conversation.hasMany( models.ConversationMessage, { as: 'messages', foreignKey: 'conversationId', onDelete: 'CASCADE' } )
    Conversation.hasMany( models.ConversationNotification, { as: 'notifications', foreignKey: 'conversationId', onDelete: 'CASCADE' } )
    Conversation.belongsTo( models.User, { as: 'owner', foreignKey: 'userId' } )
  };
  return Conversation;
};
