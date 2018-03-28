var express 						= require( 'express' ),
		app									= express(),
		http								= require( 'http' ).Server(app),
		mongoose						= require( 'mongoose' ),
		io									= require( 'socket.io' ).listen( http ),
		bodyParser					= require( 'body-parser' ),
		socketController		= require( './controllers/socket' ),
		appRoutes						= require('./routes/app'),
		apiRoutes						= require('./routes/api'),
		authRoutes					= require('./routes/auth');

//Connecting to mongoose
mongoose.connect( 'mongodb://doodle:' + process.env.MNPASS + '@ci.mtuopensource.club:27017/doodle_chat?authSource=doodle_chat', function( err ) {
	if ( err ) {
		throw err;
	}
} );

//Setting our views and port for the app
app.set( 'view engine', 'ejs' );
app.set('port', ( process.env.PORT || 3000 ) );
//Setting up bodyParser
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: true } ) );
//Pathing to our static files, css/js etc...
app.use( express.static(__dirname + '/inc') );

//Use pathing to routes
app.use('/', appRoutes);
app.use('/api', apiRoutes);
app.use('/auth', authRoutes);

//Starts up sockets
socketController( io );

//Starts running the app
http.listen( app.get( 'port' ), function() {
  console.log( 'Node app is running on port', app.get( 'port' ) );
});
