var express 			= require('express'),
	router	 			= express.Router(),
	jwt					= require( 'jsonwebtoken' ),
	bcrypt				= require( 'bcryptjs' ),
	User				= require( '../models/user' );


/**
  * Login route
  * 	Authenticates user against database and redirects to messenger page
  * @param  {[type]}   req  request object from user to server
  * @param  {[type]}   res  response object to user from server
  * @param  {Function} next next function in express function list
  * @return {[type]}        Returns a status code and corresponding message and token.
  */
router.post('/login', function(req, res, next) {
	//Finds user in databas
	User.findOne( { username: req.body.username }, function( err, user ) {
		if ( err ) {
			return res.status( 500 ).json({
				title: 'An error occured',
				error: err
			});
		}
		//If no such user exists or passwords do not match, return an error
		if ( !user || !bcrypt.compareSync( req.body.password, user.password ) ) {
			return res.status( 401 ).json({
				title: 'Login failed',
				error: { message: 'Invalid login credentials' }
			});
		}
		//Sign the JWT and return success
		var token = jwt.sign( { user: user }, 'my nama jeff', { expiresIn: 7200 } );	//TODO: change 'my nama jeff' to a environment variable
		res.status( 200 ).json( {
			message: 'Successfully logged in',
			token: token,
			userId: user._id,
			username: user.username
		} );
	});
} );


/**
  * Auth(registration) route
  * 	Creates new user object and saves to MongoDB
  * @param  {[type]}   req  request object from user to server
  * @param  {[type]}   res  response object to user from server
  * @param  {Function} next next function in express function list
  * @return {[type]}        Returns a status code and corresponding message and token.
  */
router.post('/', function(req, res, next) {
	//New user object
	var user = new User({
		username: req.body.username,
		password: bcrypt.hashSync( req.body.password, 10 )
	});
	//Save to database, if error return invalid username
	user.save( function( err, user ) {
		if ( err ) {
			return res.status( 500 ).json({
				title: 'An error occured',
				error: { message: 'Username taken.' }
			});
		}
		//Return success and send JWT
		res.status( 200 ).json( {
			message: 'Successfully logged in',
			token: jwt.sign( { user: user }, 'my nama jeff', {expiresIn : 7200}),
			userId: user._id,
			username: user.username
		});
	});
} );

module.exports = router;
