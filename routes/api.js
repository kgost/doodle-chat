var express 		= require('express'),
	router 			= express.Router(),
	Message 		= require( '../models/message' ),
	User			= require( '../models/user' )
	middleware		= require('../functions/middleware');


//username uniqueness
router.get('/userUniqueness/:username', function(req, res, next) {
	User.findOne( { username: req.params.username}, function( err, user ) {
		if (err) {
			return res.status( 500 ).json({
				title: 'An error occured',
				error: err
			});
		}
		if ( Object.keys(user).length === 0 ) {
			return res.status (200 ).json({
				message: 'Username avaliable',
				obj: true
			});
		}
		res.status( 200 ).json( {
			message: 'Username in use',
			obj: false
		});
	});
});

router.get( '/test-conversation',  middleware.authenticate, function( req, res, next ) {
	Message.find( {}, function( err, messages ) {
		if ( err ) {
			res.status( 500 );
			return next( err );
		}
		res.status( 200 ).json({
		message: 'Reply Successful',
		obj: messages
		});
	});
});

router.post( '/test-conversation', middleware.authenticate, function( req, res, next ) {
	// save new message
	Message.create( { text: req.body.text }, function( err ) {
		if ( err ) {
			res.status( 500 );
			return next( err );
		}
		res.status( 200 ).json({
			message: 'Reply Successful'
		});
	} );
	// respond with success message
} );

module.exports = router;
