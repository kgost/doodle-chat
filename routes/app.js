var express 		= require('express'),
	router 			= express.Router();


// home route, replace placeholder with actual ejs file and move to seperate route file
router.get( '/', function( req, res, next ) {
	res.render( 'home' );
} );

// messenger route, TODO: implement messenger.ejs and messenger.js front end files
router.get( '/messenger', function( req, res, next ) {
	res.render( 'messenger' );
} );

router.get( '/login', function( req, res, next ) {
	res.render( 'login');
});

router.get( '/register', function( req, res, next ) {
	res.render( 'register' );
} );

module.exports = router;
