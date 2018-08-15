const
  express       = require('express'),
  router        = express.Router(),
  jwt         = require( 'jsonwebtoken' ),
  bcrypt        = require( 'bcryptjs' ),
  forge        = require( 'node-forge' ),
  responseHelper = require( '../functions/responseHelper' ),
  middleware = require( '../functions/middleware' ),
  User        = require( '../models/user' ),
  Notifier        = require( '../models/notifier' )


/**
  * Login route
  *   Authenticates user against database and redirects to messenger page
  * @param  {[type]}   req  request object from user to server
  * @param  {[type]}   res  response object to user from server
  * @param  {Function} next next function in express function list
  * @return {[type]}        Returns a status code and corresponding message and token.
  */
router.post('/signin', (req, res) => {
  //Finds user in database
  User.findOne( { username: req.body.username }, 'username password publicKey privateKey' ).lean().exec( ( err, user ) => {
    if ( err ) {
      return responseHelper.handleError( err, res )
    }

    //If no such user exists or passwords do not match, return an error
    if ( !user || !bcrypt.compareSync( req.body.password, user.password ) ) {
      return responseHelper.handleError( { status: 400, userMessage: 'Invalid Login Credentials' }, res )
    }

    //Sign the JWT and return success
    const token = jwt.sign( { user: { _id: user._id, username: user.username } }, process.env.JWTKEY, { expiresIn: '1d' } )
    res.status( 200 ).json( {
      message: 'Successfully Signed In',
      token: token,
      userId: user._id,
      publicKey: user.publicKey,
      privateKey: user.privateKey,
    } )
  } )
} )


/**
  * Auth(registration) route
  *   Creates new user object and saves to MongoDB
  * @param  {[type]}   req  request object from user to server
  * @param  {[type]}   res  response object to user from server
  * @param  {Function} next next function in express function list
  * @return {[type]}        Returns a status code and corresponding message and token.
  */
router.post('/signup', (req, res) => {
  if ( req.body.password.length < 6 ) {
    return responseHelper.handleError( { status: 400, userMessage: 'Invalid Password' }, res )
  }
  //New user object
  const user = new User({
    username: req.body.username,
    password: bcrypt.hashSync( req.body.password, 10 ),
    publicKey: req.body.publicKey,
    privateKey: req.body.privateKey
  })
  //Save to database, if error return invalid username
  user.save( ( err, user ) => {
    if ( err ) {
      return responseHelper.handleError( err, res )
    }

    Notifier.create( { user: user._id, conversations: [], friendships: [] }, ( err ) => {
      if ( err ) {
        return responseHelper.handleError( err, res )
      }

      //Return success and send JWT
      res.status( 200 ).json( {
        message: 'Successfully Signed In',
        token: jwt.sign( { user: { _id: user._id, username: user.username } }, process.env.JWTKEY, {expiresIn : 7200}),
        userId: user._id,
      })
    } )
  } )
} )

/**
 * Checks against MongoDB for username uniqueness upon registration
 * @param  {[type]}   username  username sent in req.params
 * @param  {[type]}   req  request object from user to server
 * @param  {[type]}   res  response object to user from server
 * @param  {Function} next next function in express function list
 * @return {[type]}        Returns a status code and corresponding messages.
 */
router.get('/usernameTaken/:username', (req, res) => {
  User.findOne( { username: decodeURIComponent( req.params.username ) }, ( err, user ) => {
    if (err) {
      return responseHelper.handleError( err, res )
    }
    //If the username is not in database, notify that it is available. Otherwise respond that it is taken
    if ( !user || Object.keys(user).length === 0 ) {
      return res.status (200 ).json({
        obj: false
      })
    }
    res.status( 200 ).json( {
      obj: true
    } )
  } )
} )

router.get( '/consumeNonce', middleware.authenticate, ( req, res ) => {
  const decoded = jwt.decode(req.query.token)
  const nonce = forge.random.getBytesSync(32)

  res.status( 200 ).json({
    nonce: nonce,
    oldNonce: decoded.nonce,
    token: jwt.sign( { user: { _id: req.user._id, username: req.user.username }, nonce: nonce }, process.env.JWTKEY, { expiresIn: 7200 } )
  } )
} )

router.post( '/addSubscriber', middleware.authenticate, ( req, res ) => {
  const user = jwt.decode(req.query.token).user

  User.findByIdAndUpdate( user._id, { pushSub: req.body }, ( err ) => {
    if ( err ) {
      return responseHelper.handleError( err, res )
    }

    res.status( 201 ).json({ message: 'Subscription Object Added' })
  } )
} )

router.delete( '/removeSubscriber', middleware.authenticate, ( req, res ) => {
  const user = jwt.decode(req.query.token).user

  User.findByIdAndUpdate( user._id, { pushSub: null }, ( err ) => {
    if ( err ) {
      return responseHelper.handleError( err, res )
    }

    res.status( 201 ).json({ message: 'Subscription Object Removed' })
  } )
} )

module.exports = router
