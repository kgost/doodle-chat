'use strict';
module.exports = (sequelize, DataTypes) => {
  const FriendshipMessage = sequelize.define('FriendshipMessage', {
    message: {
      allowNull: false,
      type: DataTypes.TEXT( 'medium' )
    },
    userId: DataTypes.INTEGER,
    friendshipId: DataTypes.INTEGER
  }, {});
  FriendshipMessage.associate = function(models) {
    FriendshipMessage.belongsTo( models.User, { as: 'author', foreignKey: 'userId', onDelete: 'CASCADE' } )
    FriendshipMessage.belongsTo( models.Friendship, { as: 'friendship', foreignKey: 'friendshipId', onDelete: 'CASCADE' } )
    FriendshipMessage.hasMany( models.FriendshipReaction, { as: 'reactions', foreignKey: 'friendshipMessageId' } )
  };
  return FriendshipMessage;
};
