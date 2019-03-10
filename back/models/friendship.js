'use strict';
module.exports = (sequelize, DataTypes) => {
  const Friendship = sequelize.define('Friendship', {
    userOneId: DataTypes.INTEGER,
    userTwoId: DataTypes.INTEGER,
    userOneAccessKey: DataTypes.TEXT,
    userTwoAccessKey: DataTypes.TEXT,
    userOneAccepted: DataTypes.BOOLEAN,
    userTwoAccepted: DataTypes.BOOLEAN
  }, {});
  Friendship.associate = function(models) {
    Friendship.hasMany( models.FriendshipMessage, { as: 'messages', foreignKey: 'friendshipId', onDelete: 'CASCADE' } )
    Friendship.belongsTo( models.User, { as: 'userOne', foreignKey: 'userOneId' } )
    Friendship.belongsTo( models.User, { as: 'userTwo', foreignKey: 'userTwoId' } )
  };
  return Friendship;
};
