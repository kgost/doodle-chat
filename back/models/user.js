'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      allowNull: false,
      type: DataTypes.STRING
    },
    challengeAnswer: {
      type: DataTypes.STRING
    },
    publicKey: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    encPrivateKey: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    pushSub: {
      type: DataTypes.JSON
    },
    nonce: {
      type: DataTypes.STRING
    },
  }, {});
  User.associate = function(models) {
    User.belongsToMany( models.Conversation, { as: 'conversations', through: models.Participant, foreignKey: 'userId' } )
    User.hasMany( models.Friendship, { as: 'friendshipsOne', foreignKey: 'userOneId' } )
    User.hasMany( models.Friendship, { as: 'friendshipsTwo', foreignKey: 'userTwoId' } )
    User.hasMany( models.ConversationNotification, { as: 'conversationNotifications', foreignKey: 'userId' } )
    User.hasMany( models.FriendshipNotification, { as: 'friendshipNotifications', foreignKey: 'userId' } )
  };
  return User;
};
