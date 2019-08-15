const
  forge          = require( 'node-forge' ),
  crypto         = require( 'crypto' ),
  jwt            = require( 'jsonwebtoken' ),
  db             = require( '../models' ),
  User           = db.User,
  responseHelper = require ( '../functions/responseHelper' )

const actions = {
  signin: async ( req ) => {
    const user = await User.findOne({
      where: { username: req.body.username }
    })

    if ( !user ) {
      throw { status: 400, message: 'invalid login credentials' }
    }

    const correctAnswer = user.challengeAnswer
    user.challengeAnswer = null

    await user.save()

    if ( req.body.challengeAnswer !== correctAnswer ) {
      throw { status: 400, message: 'invalid login credentials' }
    }

    const token = jwt.sign( { user: { id: user.id, username: user.username } }, process.env.JWTKEY )

    return { body: {
      token: token,
      user: { id: user.id, username: user.username },
      publicKey: user.publicKey,
      encPrivateKey: user.encPrivateKey,
    } }
  },

  signinChallenge: async ( req ) => {
    const user = await User.findOne({
      where: { username: req.body.username }
    })

    if ( !user )
      throw { status: 400, message: 'invalid login credentials' }

    const answer = crypto.randomBytes( 16 ).toString( 'base64' )

    user.challengeAnswer = answer

    await user.save()

    const publicKey = getPublicKeyFromString( user.publicKey )

    return {
      body: {
        challenge: publicKey.encrypt( answer ),
        encPrivateKey: user.encPrivateKey,
      }
    }
  },

  signup: async ( req ) => {
    if ( req.body.password.length < 10 )
      throw { status: 400, message: 'password must be 10 or more characters' }

    const user = await User.create({
      username: req.body.username,
      publicKey: req.body.publicKey,
      encPrivateKey: req.body.encPrivateKey,
      pushSub: {}
    })

    const token = jwt.sign( { user: { id: user.id, username: user.username } }, process.env.JWTKEY )

    return {
      status: 201,
      body: {
        token: token,
        user: { id: user.id, username: user.username },
      }
    }
  },

  usernameTaken: async ( req ) => {
    const user = await User.findOne({
      attributes: ['publicKey', 'id'],
      where: { username: decodeURIComponent( req.params.username ) }
    })

    if ( user ) {
      return { body: user }
    } else {
      return { body: false }
    }
  },

  consumeNonce: async ( req ) => {
    const user = await User.findByPk( req.user.id, {
      attributes: ['nonce'],
    } )

    const oldNonce = user.nonce

    await User.update({ nonce: req.body.nonce }, { where: { id: req.user.id } })

    return { body: oldNonce }
  },
}

function getPublicKeyFromString( publicKeyString ) {
  return forge.pki.publicKeyFromAsn1( forge.asn1.fromDer( publicKeyString ) );
}

module.exports = responseHelper.handleActions( actions )
