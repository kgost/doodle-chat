'use strict';
module.exports = (sequelize, DataTypes) => {
  const FriendshipNotification = sequelize.define('FriendshipNotification', {
    userId: DataTypes.INTEGER,
    friendshipId: DataTypes.INTEGER,
    sent: {
      allowNull: false,
      type: DataTypes.BOOLEAN
    }
  }, {});
  FriendshipNotification.associate = function(models) {
    FriendshipNotification.belongsTo( models.User, { as: 'user', foreignKey: 'userId' } )
    FriendshipNotification.belongsTo( models.Friendship, { as: 'friendship', foreignKey: 'friendshipId' } )
  };
  return FriendshipNotification;
};
