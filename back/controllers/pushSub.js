const
  db             = require( '../models' ),
  User           = db.User,
  responseHelper = require( '../functions/responseHelper' )

const actions = {
  create: async ( req ) => {
    await User.update({
      pushSub: req.body,
    }, { where: { id: req.user.id } })
  },

  index: async ( req ) => {
    const user = await User.findByPk( req.user.id, {
      attributes: ['pushSub']
    } )

    return { body: user.pushSub }
  },

  destroy: async ( req ) => {
    await User.update({
      pushSub: null,
    }, { where: { id: req.user.id } })
  },
}

module.exports = responseHelper.handleActions( actions )
