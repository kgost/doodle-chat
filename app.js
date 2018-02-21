var express 			= require( 'express' ),
		app						= express(),
		http					= require( 'http' ).Server(app),
		mongoose			= require( 'mongoose' );

mongoose.connect( 'mongodb://localhost/doodle_chat' );

app.set( 'view engine', 'ejs' );
app.set('port', ( process.env.PORT || 3000 ) );
app.use( express.static(__dirname + '/inc') );

// home route, replace placeholder with actual ejs file and move to seperate route file
app.get( '/', function( req, res, next ) {
	res.send( 'Placeholder' );
} );

// messenger route, TODO: implement messenger.ejs and messenger.js front end files
app.get( '/messenger', function( req, res, next ) {
	res.render( 'messenger' );
} );

// Include routes above this point
http.listen( app.get( 'port' ), function() {
  console.log( 'Node app is running on port', app.get( 'port' ) );
} );