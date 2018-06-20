const express       = require('express'),
  router        = express.Router(),
  jwt         = require( 'jsonwebtoken' ),
  bcrypt        = require( 'bcryptjs' ),
  User        = require( '../models/user' )


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
        title: 'Login failed',
        error: { message: 'Invalid login credentials' }
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
      return res.status( 500 ).json({
        title: 'An error occured',
        error: { message: 'Username taken.' }
      })
    }
    //Return success and send JWT
    res.status( 200 ).json( {
      message: 'Successfully Signed In',
      token: jwt.sign( { user: user }, 'my nama jeff', {expiresIn : 7200}),
      userId: user._id
    })
  })
} )

module.exports = router
