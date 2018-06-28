const express       = require('express'),
  router        = express.Router(),
  jwt         = require( 'jsonwebtoken' ),
  bcrypt        = require( 'bcryptjs' ),
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
  //Finds user in databas
  User.findOne( { username: req.body.username }, ( err, user ) => {
    if ( err ) {
      return res.status( 500 ).json({
        title: 'An error occured',
        error: err
      })
    }
    //If no such user exists or passwords do not match, return an error
    if ( !user || !bcrypt.compareSync( req.body.password, user.password ) ) {
      return res.status( 401 ).json({
        userMessage: 'Invalid Login Credentials'
      })
    }
    //Sign the JWT and return success
    const token = jwt.sign( { user: user }, 'my nama jeff', { expiresIn: 7200 } )  //TODO: change 'my nama jeff' to a environment variable
    res.status( 200 ).json( {
      message: 'Successfully Signed Up',
      token: token,
      userId: user._id
    } )
  })
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
  //New user object
  const user = new User({
    username: req.body.username,
    password: bcrypt.hashSync( req.body.password, 10 )
  })
  //Save to database, if error return invalid username
  user.save( ( err, user ) => {
    if ( err ) {
      return res.status( 400 ).json({
        title: 'An error occured',
        error: { message: 'Username taken.' }
      })
    }

    Notifier.create( { user: user._id, conversations: [], friendships: [] }, ( err ) => {
      if ( err ) {
        return res.status( 500 ).json({
          title: 'An error occured',
          error: err
        })
      }

      //Return success and send JWT
      res.status( 200 ).json( {
        message: 'Successfully Signed In',
        token: jwt.sign( { user: user }, 'my nama jeff', {expiresIn : 7200}),
        userId: user._id
      })
    } )
  })
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
      return res.status( 500 ).json({
        title: 'An error occured',
        error: err
      })
    }
    //If the username is not in database, notify that it is available. Otherwise respond that it is taken
    if ( !user || Object.keys(user).length === 0 ) {
      return res.status (200 ).json({
        obj: false
      })
    }
    res.status( 200 ).json( {
      obj: true
    })
  })
})

module.exports = router
