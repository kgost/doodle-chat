const
  db             = require( '../models' ),
  Conversation   = db.Conversation,
  Participant    = db.Participant,
  User           = db.User,
  Notification   = db.ConversationNotification,
  Message        = db.ConversationMessage,
  Reaction       = db.ConversationReaction,
  responseHelper = require( '../functions/responseHelper' )

const actions = {
  create: async ( req ) => {
    await Reaction.destroy({
      where: { userId: req.user.id, conversationMessageId: req.params.messageId }
    })

    await Reaction.create({
      userId: req.user.id,
      conversationMessageId: req.params.messageId,
      emoji: req.body.emoji,
    })
  },
}

module.exports = responseHelper.handleActions( actions )
