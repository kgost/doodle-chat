'use strict';
module.exports = (sequelize, DataTypes) => {
  const Participant = sequelize.define('Participant', {
    conversationId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    nickname: {
      allowNull: false,
      type: DataTypes.STRING
    },
    accessKey: {
      allowNull: false,
      type: DataTypes.TEXT
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['conversationId', 'userId'],
      }
    ]
  });
  Participant.associate = function(models) {
    Participant.belongsTo( models.Conversation, { as: 'conversation', foreignKey: 'conversationId', onDelete: 'CASCADE' } )
    Participant.belongsTo( models.User, { as: 'user', foreignKey: 'userId', onDelete: 'CASCADE' } )
  };
  Participant.removeAttribute('id');
  return Participant;
};
