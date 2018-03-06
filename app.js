var express 					= require( 'express' ),
		app						= express(),
		http					= require( 'http' ).Server(app),
		mongoose				= require( 'mongoose' ),
		io						= require( 'socket.io' ).listen( http ),
		bodyParser				= require( 'body-parser' ),
		bcrypt					= require( 'bcryptjs' ),
		jwt						= require( 'jsonwebtoken' ),
		socketController		= require( './controllers/socket' ),
		Message 				= require( './models/message' ),
		User					= require( './models/user' );

// connect to mongoose
mongoose.connect( 'mongodb://doodle:' + process.env.MNPASS + '@141.219.197.147:27017/doodle_chat', function( err ) {
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

// auth route
app.post('/auth', function(req, res, next) {
	var user = new User({
		username: req.body.username,
		password: bcrypt.hashSync( req.body.password, 10 )
	});
	user.save( function( err, user ) {
		if ( err ) {
			return res.status( 500 ).json({
				title: 'An error occured',
				error: err
			});
		}
		res.status( 200 ).json( {
			message: 'Successfully logged in',
			token: jwt.sign( { user: user }, 'my nama jeff', {expiresIn : 7200}),
			userId: user._id
		});
	});
} );

// login route
app.post('/auth/login', function(req, res, next) {
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

app.post( '/api/test-conversation', authenticate, function( req, res, next ) {
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

// Middleware

function authenticate(req, res, next) {
	var decoded = jwt.decode(req.query.token);
	console.log(decoded);
	User.findById(decoded.user._id, function(err, user) {
		if (err) {
			return res.status(500).json({
				title: 'An error occurred',
				error: err
			});
		}
		if (!user) {
			return res.status(401).json({
				title: 'User not logged in.',
				error: {message: 'Invalid JWT to server.'}
			});
		}
		return next();
	});
}

// Include routes above this point
http.listen( app.get( 'port' ), function() {
  console.log( 'Node app is running on port', app.get( 'port' ) );
} );
