var express 			= require( 'express' ),
		app						= express(),
		http					= require( 'http' ).Server(app),
		mongoose			= require( 'mongoose' );

mongoose.connect( 'mongodb://localhost/doodle_chat' );

app.set( 'view engine', 'ejs' );
app.set('port', ( process.env.PORT || 3000 ) );
app.use( express.static(__dirname + '/inc') );

app.get( '/', function( req, res, next ) {
	res.send( 'Hello World!' );
} );

// Include routes above this point
http.listen( app.get( 'port' ), function() {
  console.log( 'Node app is running on port', app.get( 'port' ) );
} );