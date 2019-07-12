const
  db             = require( '../models' ),
  Conversation   = db.Conversation,
  Participant    = db.Participant,
  User           = db.User,
  Notification   = db.ConversationNotification,
  responseHelper = require( '../functions/responseHelper' )

const actions = {
  create: async ( req ) => {
    const t = await db.sequelize.transaction()

    let conversation

    try {
      conversation = await Conversation.create({
        name: req.body.conversation.name,
        userId: req.user.id,
      }, { transaction: t })

      for ( const participant of req.body.participants ) {
        await Participant.create({
          conversationId: conversation.id,
          userId: participant.userId,
          nickname: participant.nickname,
          accessKey: participant.accessKey,
        }, { transaction: t })
      }
    } catch ( err ) {
      await t.rollback()
      throw err
    }

    await t.commit()

    const result = await Conversation.findByPk( conversation.id, {
      include: [
        {
          model: Notification,
          as: 'notifications',
          where: { userId: req.user.id },
          required: false,
        },
        {
          model: Participant,
          as: 'participants',
          include: [{
            model: User,
            as: 'user',
            attributes: ['username', 'publicKey'],
          }],
        }
      ],
    })

    return { body: result, status: 201 }
  },

  index: async ( req ) => {
    const user = await User.findByPk( req.user.id, {
      include: [{
        model: Conversation,
        as: 'conversations',
        include: [
          {
            model: Notification,
            as: 'notifications',
            where: { userId: req.user.id },
            required: false,
          },
          {
            model: Participant,
            as: 'participants',
            include: [{
              model: User,
              as: 'user',
              attributes: ['username', 'publicKey'],
            }],
          }
        ],
      }],
    } )

    if ( !user.conversations.length ) {
      throw { status: 404, message: 'no conversations found' }
    }

    for ( const conversation of user.conversations ) {
      for ( const participant of conversation.participants ) {
        participant.dataValues.username = participant.user.username
        participant.dataValues.publicKey = participant.user.publicKey
      }
    }

    return { body: user.conversations }
  },

  show: async ( req ) => {
    const conversation = await Conversation.findByPk( req.params.id, {
      include: [
        {
          model: Notification,
          as: 'notifications',
          where: { userId: req.user.id },
          required: false,
        },
        {
          model: Participant,
          as: 'participants',
          include: [{
            model: User,
            as: 'user',
            attributes: ['username', 'publicKey'],
          }],
        }
      ]
    } )

    if ( !conversation ) {
      throw { status: 404, message: 'no conversation found' }
    }

    for ( const participant of conversation.participants ) {
      participant.dataValues.username = participant.user.username
      participant.dataValues.publicKey = participant.user.publicKey
    }

    return { body: conversation }
  },

  update: async ( req ) => {
    const t = await db.sequelize.transaction()

    try {
      await Conversation.update({
        name: req.body.conversation.name,
      }, {
        where: { id: req.params.id },
        transaction: t
      })

      await Participant.destroy({
        where: { conversationId: req.params.id },
        transaction: t
      })

      for ( const participant of req.body.participants ) {
        await Participant.create({
          conversationId: req.params.id,
          userId: participant.userId,
          nickname: participant.nickname,
          accessKey: participant.accessKey,
        }, { transaction: t })
      }
    } catch ( err ) {
      await t.rollback()
      throw err
    }

    await t.commit()

    return actions.show( req )
  },

  destroy: async ( req ) => {
    const t = await db.sequelize.transaction()

    try {
      await Conversation.destroy({
        where: { id: req.params.id },
        transaction: t
      })

      await Participant.destroy({
        where: { conversationId: req.params.id },
        transaction: t
      })
    } catch ( err ) {
      await t.rollback()
      throw err
    }

    await t.commit()
  },

  leave: async ( req ) => {
    const t = await db.sequelize.transaction()

    try {
      await Participant.destroy({
        where: { conversationId: req.params.id, userId: req.user.id },
        transaction: t
      })

      await Notification.destroy({
        where: { conversationId: req.params.id, userId: req.user.id },
        transaction: t
      })

      const count = await Participant.count({
        where: { conversationId: req.params.id },
        transaction: t
      })

      if ( count < 2 ) {
        await Conversation.destroy({
          where: { id: req.params.id },
          transaction: t
        })

        await Participant.destroy({
          where: { conversationId: req.params.id },
          transaction: t
        })
      }
    } catch ( err ) {
      await t.rollback()
      throw err
    }

    await t.commit()
  },

  changeCosmetic: async ( req ) => {
    const t = await db.sequelize.transaction()

    try {
      for ( const participant of req.body.participants ) {
        await Participant.update({
          nickname: participant.nickname
        }, {
          where: {
            conversationId: req.params.id,
            userId: participant.userId,
          },
          transaction: t
        })
      }
    } catch ( err ) {
      await t.rollback()
      throw err
    }

    await t.commit()

    const result = await Conversation.findByPk( req.params.id, {
      include: [
        {
          model: Notification,
          as: 'notifications',
          where: { userId: req.user.id },
          required: false
        },
        {
          model: Participant,
          as: 'participants',
          include: [{
            model: User,
            as: 'user',
            attributes: ['username', 'publicKey'],
          }],
        }
      ],
    })

    return { body: result, status: 201 }
  },

  destroyNotifications: async ( req ) => {
    const numModified = await Notification.destroy({
      where: {
        userId: req.user.id,
        conversationId: req.params.id,
      }
    })

    if ( !numModified ) {
      throw { status: 404, message: 'no notifications found' }
    }
  },
}

module.exports = responseHelper.handleActions( actions )
