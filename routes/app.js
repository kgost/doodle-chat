var express 		= require('express'),
	router 			= express.Router();


// Home route
router.get( '/', function( req, res, next ) {
	res.render( 'home' );
} );

// Messenger route
router.get( '/messenger', function( req, res, next ) {
	res.render( 'messenger' );
} );
// Login route
router.get( '/login', function( req, res, next ) {
	res.render( 'login');
});
// Register rout
router.get( '/register', function( req, res, next ) {
	res.render( 'register' );
} );

module.exports = router;
