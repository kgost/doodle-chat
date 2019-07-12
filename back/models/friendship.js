'use strict';
module.exports = (sequelize, DataTypes) => {
  const Friendship = sequelize.define('Friendship', {
    userOneId: DataTypes.INTEGER,
    userTwoId: DataTypes.INTEGER,
    userOneAccessKey: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    userTwoAccessKey: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    userOneAccepted: {
      allowNull: false,
      type: DataTypes.BOOLEAN
    },
    userTwoAccepted: {
      allowNull: false,
      type: DataTypes.BOOLEAN
    },
  }, {});
  Friendship.associate = function(models) {
    Friendship.hasMany( models.FriendshipMessage, { as: 'messages', foreignKey: 'friendshipId', onDelete: 'CASCADE' } )
    Friendship.hasMany( models.FriendshipNotification, { as: 'notifications', foreignKey: 'friendshipId', onDelete: 'CASCADE' } )
    Friendship.belongsTo( models.User, { as: 'userOne', foreignKey: 'userOneId' } )
    Friendship.belongsTo( models.User, { as: 'userTwo', foreignKey: 'userTwoId' } )
  };
  return Friendship;
};
