'use strict';
module.exports = (sequelize, DataTypes) => {
  const FriendshipMessage = sequelize.define('FriendshipMessage', {
    message: DataTypes.TEXT,
    userId: DataTypes.INTEGER,
    friendshipId: DataTypes.INTEGER
  }, {});
  FriendshipMessage.associate = function(models) {
    FriendshipMessage.belongsTo( models.User, { as: 'user', foreignKey: 'userId', onDelete: 'CASCADE' } )
    FriendshipMessage.belongsTo( models.Friendship, { as: 'friendship', foreignKey: 'friendshipId', onDelete: 'CASCADE' } )
    FriendshipMessage.hasMany( models.FriendshipReaction, { as: 'reactions', foreignKey: 'friendshipMessageId' } )
  };
  return FriendshipMessage;
};
