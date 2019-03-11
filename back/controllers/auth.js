const
  bcrypt         = require( 'bcryptjs' ),
  jwt            = require( 'jsonwebtoken' ),
  db             = require( '../models' ),
  User           = db.User,
  responseHelper = require ( '../functions/responseHelper' )

const actions = {
  signin: async ( req ) => {
    const user = await User.findOne({
      where: { username: req.body.username }
    })

    if ( !user || !bcrypt.compareSync( req.body.password, user.passHash ) )
      throw { status: 400, message: 'invalid login credentials' }

    const token = jwt.sign( { user: { id: user.id, username: user.username } }, process.env.JWTKEY )

    return { body: {
      token: token,
      userId: user.id,
      publicKey: user.publicKey,
      encPrivateKey: user.encPrivateKey,
    } }
  },

  signup: async ( req ) => {
    if ( req.body.password.length < 10 )
      throw { status: 400, message: 'password must be 10 or more characters' }

    const user = await User.create({
      username: req.body.username,
      passHash: bcrypt.hashSync( req.body.password, 10 ),
      publicKey: req.body.publicKey,
      encPrivateKey: req.body.encPrivateKey,
    })

    const token = jwt.sign( { user: { id: user.id, username: user.username } }, process.env.JWTKEY )

    return {
      status: 201,
      body: {
        token: token,
        userId: user.id,
      }
    }
  },

  usernameTaken: async ( req ) => {
    const count = await User.count({ where: { username: decodeURIComponent( req.params.username ) } })

    return { body: !!count }
  }
}

module.exports = responseHelper.handleActions( actions )
