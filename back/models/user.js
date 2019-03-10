'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: DataTypes.STRING,
    passHash: DataTypes.TEXT,
    publicKey: DataTypes.TEXT,
    encPrivateKey: DataTypes.TEXT,
    pushSub: DataTypes.JSON
  }, {});
  User.associate = function(models) {
    User.belongsToMany( models.Conversation, { as: 'conversations', through: 'Participants', foreignKey: 'userId' } )
    User.hasMany( models.Friendship, { as: 'friendshipsOne', foreignKey: 'userOneId' } )
    User.hasMany( models.Friendship, { as: 'friendshipsTwo', foreignKey: 'userTwoId' } )
    User.hasMany( models.ConversationNotification, { as: 'conversationNotifications', foreignKey: 'userId' } )
    User.hasMany( models.FriendshipNotification, { as: 'friendshipNotifications', foreignKey: 'userId' } )
  };
  return User;
};
