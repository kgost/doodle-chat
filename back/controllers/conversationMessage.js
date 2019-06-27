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
    const message = await Message.create({
      conversationId: req.params.id,
      userId: req.user.id,
      message: req.body.message,
    })

    const result = await Message.findByPk( message.id, {
      include: [
        { model: User, as: 'author', attributes: ['username'] },
        { model: Reaction, as: 'reactions' },
      ],
    } )

    return { status: 201, body: result }
  },

  index: async ( req ) => {
    const messages = await Message.findAll({
      where: {
        conversationId: req.params.id
      },
      limit: 20,
      offset: parseInt( req.query.offset ),
      include: [
        { model: User, as: 'author', attributes: ['username'] },
        { model: Reaction, as: 'reactions' },
      ],
    })

    if ( !messages.length ) {
      throw { status: 404, message: 'no messages found' }
    }

    return { body: messages }
  },

  update: async ( req ) => {
    await Message.update({
      message: req.body.message
    }, { where: { id: req.params.messageId } })

    const result = await Message.findByPk( req.params.messageId, {
      include: [
        { model: User, as: 'author', attributes: ['username'] },
        { model: Reaction, as: 'reactions' },
      ],
    } )

    return { body: result }
  },

  destroy: async ( req ) => {
    await Message.destroy({ where: { id: req.params.messageId } })

    await Reaction.destroy({ where: { conversationMessageId: req.params.messageId } })
  },
}

module.exports = responseHelper.handleActions( actions )
