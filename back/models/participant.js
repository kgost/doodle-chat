'use strict';
module.exports = (sequelize, DataTypes) => {
  const Participant = sequelize.define('Participant', {
    conversationId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    nickname: DataTypes.STRING,
    accessKey: DataTypes.TEXT
  }, {});
  Participant.associate = function(models) {
    Participant.belongsTo( models.Conversation, { as: 'conversation', foreignKey: 'conversationId', onDelete: 'CASCADE' } )
    Participant.belongsTo( models.User, { as: 'user', foreignKey: 'userId', onDelete: 'CASCADE' } )
  };
  return Participant;
};
