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
      t.rollback()
      throw err
    }

    t.commit()

    const result = await Conversation.findByPk( conversation.id, {
      include: [{
        model: Participant,
        as: 'participants',
      }],
    })

    return { body: result, status: 201 }
  },

  index: async ( req ) => {
    const user = await User.findByPk( req.user.id, {
      include: [{
        model: Conversation,
        as: 'conversations',
        include: [{
          model: Participant,
          as: 'participants',
        }]
      }]
    } )

    if ( !user.conversations.length ) {
      throw { status: 404, message: 'no conversations found' }
    }

    return { body: user.conversations }
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
      t.rollback()
      throw err
    }

    t.commit()

    const result = await Conversation.findByPk( req.params.id, {
      include: [{
        model: Participant,
        as: 'participants',
      }],
    })

    return { body: result, status: 201 }
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
      t.rollback()
      throw err
    }

    t.commit()
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
      t.rollback()
      throw err
    }

    t.commit()
  },

  changeCosmetic: async ( req ) => {
    const t = await db.sequelize.transaction()

    try {
      for ( const participant of req.body.participants ) {
        await Participant.update({
          nickname: participant.nickname
        }, {
          where: { userId: participant.userId },
          transaction: t
        })
      }
    } catch ( err ) {
      t.rollback()
      throw err
    }

    t.commit()

    const result = await Conversation.findByPk( req.params.id, {
      include: [{
        model: Participant,
        as: 'participants',
      }],
    })

    return { body: result, status: 201 }
  },
}

module.exports = responseHelper.handleActions( actions )
