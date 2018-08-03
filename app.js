const
  env              = require( 'node-env-file' ),
  express          = require( 'express' ),
  sslRedirect      = require( 'heroku-ssl-redirect' ),
  app              = express(),
  http             = require( 'http' ).Server(app),
  mongoose         = require( 'mongoose' ),
  io               = require( 'socket.io' ).listen( http ),
  bodyParser       = require( 'body-parser' ),
  expressSanitizer = require( 'express-sanitizer' ),
  socketController = require( './controllers/socket' ),
  apiRoutes        = require('./routes/api'),
  authRoutes       = require('./routes/auth')

env( __dirname + '/.env', { raise: false } )

const mongooseUrl = ( process.env.MNPASS ) ?
  'mongodb://doodle:' + process.env.MNPASS + '@ci.mtuopensource.club:27017/doodle_chat?authSource=doodle_chat' :
  'mongodb://localhost:27017/doodle_chat'

mongoose.connect( mongooseUrl, function( err ) {
  if ( err ) {
    throw err
  }
} )

//Setting our views and port for the app
app.set( 'view engine', 'ejs' )
app.set('port', ( process.env.PORT || 3000 ) )
//Setting up bodyParser
app.use( bodyParser.json({ limit: '100mb' }) )
app.use( bodyParser.urlencoded( { extended: true } ) )

if ( process.env.HEROKU ) {
  app.use( sslRedirect() )
}
app.use( expressSanitizer() )

//Use pathing to routes
app.use('/api', apiRoutes)
app.use('/auth', authRoutes)

app.use( '/assets', express.static( __dirname + '/src/assets' ) )

//Pathing to our static files, css/js etc...
app.use( express.static(__dirname + '/dist/chat-front') )

app.get('/:name/*', (req, res, next) => {
  // Just send the index.html for other files to support HTML5Mode
  if ( req.params.name.match( /\./ ) === null ) {
    res.sendFile( 'index.html', { root: __dirname + '/dist/chat-front' })
  } else {
    return next()
  }
})

//Starts up sockets
socketController( io )

//Starts running the app
http.listen( app.get( 'port' ), () => {
  console.log( 'Node app is running on port', app.get( 'port' ) )
})
