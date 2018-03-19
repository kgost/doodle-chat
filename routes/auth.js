var express 			= require('express'),
	router	 			= express.Router(),
	jwt					= require( 'jsonwebtoken' ),
	bcrypt				= require( 'bcryptjs' ),
	User				= require( '../models/user' );

// login route
router.post('/login', function(req, res, next) {
	User.findOne( { username: req.body.username }, function( err, user ) {
		if ( err ) {
			return res.status( 500 ).json({
				title: 'An error occured',
				error: err
			});
		}
		if ( !user || !bcrypt.compareSync( req.body.password, user.password ) ) {
			return res.status( 401 ).json({
				title: 'Login failed',
				error: { message: 'Invalid login credentials' }
			});
		}
		var token = jwt.sign( { user: user }, 'my nama jeff', { expiresIn: 7200 } );
		res.status( 200 ).json( {
			message: 'Successfully logged in',
			token: token,
			userId: user._id
		} );
	});
} );


// auth route
router.post('/', function(req, res, next) {
	var user = new User({
		username: req.body.username,
		password: bcrypt.hashSync( req.body.password, 10 )
	});
	user.save( function( err, user ) {
		if ( err ) {
			return res.status( 500 ).json({
				title: 'An error occured',
				error: { message: 'Username taken.' }
			});
		}
		res.status( 200 ).json( {
			message: 'Successfully logged in',
			token: jwt.sign( { user: user }, 'my nama jeff', {expiresIn : 7200}),
			userId: user._id
		});
	});
} );

module.exports = router;
