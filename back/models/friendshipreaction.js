'use strict';
module.exports = (sequelize, DataTypes) => {
  const FriendshipReaction = sequelize.define('FriendshipReaction', {
    friendshipMessageId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    emoji: {
      allowNull: false,
      type: DataTypes.STRING
    }
  }, {});
  FriendshipReaction.associate = function(models) {
    FriendshipReaction.belongsTo( models.FriendshipMessage, { as: 'message', foreignKey: 'friendshipMessageId', onDelete: 'CASCADE' } )
    FriendshipReaction.belongsTo( models.User, { as: 'user', foreignKey: 'userId', onDelete: 'CASCADE' } )
  };
  return FriendshipReaction;
};
