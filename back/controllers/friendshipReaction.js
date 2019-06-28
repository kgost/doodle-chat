const
  db             = require( '../models' ),
  Friendship     = db.Friendship,
  User           = db.User,
  Notification   = db.FriendshipNotification,
  Message        = db.FriendshipMessage,
  Reaction       = db.FriendshipReaction,
  responseHelper = require( '../functions/responseHelper' )

const actions = {
  create: async ( req ) => {
    await Reaction.destroy({
      where: { userId: req.user.id, friendshipMessageId: req.params.messageId }
    })

    await Reaction.create({
      userId: req.user.id,
      friendshipMessageId: req.params.messageId,
      emoji: req.body.emoji,
    })
  },
}

module.exports = responseHelper.handleActions( actions )
