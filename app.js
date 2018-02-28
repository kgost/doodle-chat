var express 					= require( 'express' ),
		app								= express(),
		http							= require( 'http' ).Server(app),
		mongoose					= require( 'mongoose' ),
		io								= require( 'socket.io' ).listen( http ),
		bodyParser				= require( 'body-parser' ),
		socketController	= require( './controllers/socket' ),
		Message 					= require( './models/message' );

// connect to mongoose
mongoose.connect( 'mongodb://doodle:' + process.env.MNPASS + '@mdotslr.org:27017/doodle_chat', function( err ) {
	if ( err ) {
		throw err;
	}
} );

app.set( 'view engine', 'ejs' );
app.set('port', ( process.env.PORT || 3000 ) );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( express.static(__dirname + '/inc') );

socketController( io );

// home route, replace placeholder with actual ejs file and move to seperate route file
app.get( '/', function( req, res, next ) {
	res.send( 'Placeholder' );
} );

// messenger route, TODO: implement messenger.ejs and messenger.js front end files
app.get( '/messenger', function( req, res, next ) {
	res.render( 'messenger' );
} );

app.get( '/api/test-conversation', function( req, res, next ) {
	Message.find( {}, function( err, messages ) {
		if ( err ) {
			res.status( 500 );
			return next( err );
		}

		res.status( 200 ).json({
			message: 'Reply Successful',
			obj: messages
		});
	} );
} );

app.post( '/api/test-conversation', function( req, res, next ) {
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

// Include routes above this point
http.listen( app.get( 'port' ), function() {
  console.log( 'Node app is running on port', app.get( 'port' ) );
} );