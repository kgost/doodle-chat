const
  express        = require('express'),
  router         = express.Router(),
  middleware     = require( '../functions/middleware' ),
  authController = require( '../controllers/auth' )

/**
  * Login route
  *   Authenticates user against database and redirects to messenger page
  * @param  {[type]}   req  request object from user to server
  * @param  {[type]}   res  response object to user from server
  * @param  {Function} next next function in express function list
  * @return {[type]}        Returns a status code and corresponding message and token.
  */
router.post( '/signin', authController.signin )

router.post( '/signin-challenge', authController.signinChallenge )


/**
  * Auth(registration) route
  *   Creates new user object and saves to MongoDB
  * @param  {[type]}   req  request object from user to server
  * @param  {[type]}   res  response object to user from server
  * @param  {Function} next next function in express function list
  * @return {[type]}        Returns a status code and corresponding message and token.
  */
router.post( '/signup', authController.signup )

/**
 * Checks against MongoDB for username uniqueness upon registration
 * @param  {[type]}   username  username sent in req.params
 * @param  {[type]}   req  request object from user to server
 * @param  {[type]}   res  response object to user from server
 * @param  {Function} next next function in express function list
 * @return {[type]}        Returns a status code and corresponding messages.
 */
router.get( '/username-taken/:username', authController.usernameTaken )

router.post( '/consume-nonce', middleware.authenticate, authController.consumeNonce )

module.exports = router
