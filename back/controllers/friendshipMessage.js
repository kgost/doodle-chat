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
    const t = await db.sequelize.transaction()

    let message

    try {
      message = await Message.create({
        friendshipId: req.params.id,
        userId: req.user.id,
        message: req.body.message,
      }, { transaction: t })

      const friendship = await Friendship.findByPk( req.params.id, {
        transaction: t
      } )

      await Notification.create({
        friendshipId: req.params.id,
        userId: friendship.userOneId == req.user.id ? friendship.userTwoId : friendship.userOneId,
        sent: false,
      }, { transaction: t })
    } catch ( err ) {
      await t.rollback()
      throw err
    }

    await t.commit()

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
        friendshipId: req.params.id
      },
      limit: 20,
      offset: parseInt( req.query.offset ) * 20,
      order: [['createdAt', 'DESC']],
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

  show: async ( req ) => {
    const message = await Message.findByPk( req.params.messageId, {
      include: [
        { model: User, as: 'author', attributes: ['username'] },
        { model: Reaction, as: 'reactions' },
      ],
    } )

    if ( !message ) {
      throw { status: 404, message: 'no message found' }
    }

    return { body: message }
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

    await Reaction.destroy({ where: { friendshipMessageId: req.params.messageId } })
  },
}

module.exports = responseHelper.handleActions( actions )
