const
  db             = require( '../models' ),
  User           = db.User,
  Friendship     = db.Friendship,
  Notification   = db.FriendshipNotification,
  responseHelper = require( '../functions/responseHelper' )

const actions = {
  create: async ( req ) => {
    const count = await Friendship.count({
      where: {
        [db.Sequelize.Op.or]: [
          {
            userOneId: req.user.id,
            userTwoId: req.body.userTwoId,
          },
          {
            userOneId: req.body.userTwoId,
            userTwoId: req.user.id,
          },
        ],
      },
    })

    if ( count ) {
      throw { status: 400, message: 'Already Friends With This User' }
    }

    const friendship = await Friendship.create({
      userOneId: req.user.id,
      userTwoId: req.body.userTwoId,
      userOneAccessKey: req.body.userOneAccessKey,
      userTwoAccessKey: req.body.userTwoAccessKey,
      userOneAccepted: true,
      userTwoAccepted: false,
    })

    const result = await Friendship.findByPk( friendship.id, {
      include:[
        { model: User, as: 'userOne', attributes: ['id', 'username'] },
        { model: User, as: 'userTwo', attributes: ['id', 'username'] },
        {
          model: Notification,
          as: 'notifications',
          where: { userId: req.user.id },
          required: false
        },
      ],
    } )

    return { status: 201, body: result }
  },

  index: async ( req ) => {
    const friendships = await Friendship.findAll({
      where: {
        [db.Sequelize.Op.or]: {
          userOneId: req.user.id,
          userTwoId: req.user.id,
        }
      },
      include:[
        { model: User, as: 'userOne', attributes: ['id', 'username'] },
        { model: User, as: 'userTwo', attributes: ['id', 'username'] },
        {
          model: Notification,
          as: 'notifications',
          where: { userId: req.user.id },
          required: false
        },
      ],
    })

    if ( !friendships.length ) {
      throw { status: 404, message: 'no friendships found' }
    }

    return { body: friendships }
  },

  show: async ( req ) => {
    const friendship = await Friendship.findByPk( req.params.id, {
      include:[
        { model: User, as: 'userOne', attributes: ['id', 'username'] },
        { model: User, as: 'userTwo', attributes: ['id', 'username'] },
        {
          model: Notification,
          as: 'notifications',
          where: { userId: req.user.id },
          required: false
        },
      ],
    } )

    if ( !friendship ) {
      throw { status: 404, message: 'no friendship found' }
    }

    return { body: friendship }
  },

  update: async ( req ) => {
    const friendship = await Friendship.findByPk( req.params.id )

    if ( !friendship ) {
      throw { status: 404, message: 'no friendship found' }
    }

    if ( req.user.id != friendship.userTwoId ) {
      throw { status: 400, message: 'you cannot modify the other users data' }
    }

    await Friendship.update({
      userTwoAccepted: req.body.userTwoAccepted
    }, {
      where: { id: req.params.id }
    })

    return actions.show( req )
  },

  destroy: async ( req ) => {
    const numModified = await Friendship.destroy({
      where: { id: req.params.id }
    })

    if ( !numModified ) {
      throw { status: 404, message: 'no friendship found' }
    }

    await Notification.destroy({
      where: { friendshipId: req.params.id }
    })
  },

  destroyNotifications: async ( req ) => {
    const numModified = await Notification.destroy({
      where: {
        userId: req.user.id,
        friendshipId: req.params.id,
      }
    })

    if ( !numModified ) {
      throw { status: 404, message: 'no notifications found' }
    }
  },
}

module.exports = responseHelper.handleActions( actions )
