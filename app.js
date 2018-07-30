const express      = require( 'express' ),
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

//Connecting to mongoose
if ( process.env.MNPASS ) {
  mongoose.connect( 'mongodb://doodle:' + process.env.MNPASS + '@ci.mtuopensource.club:27017/doodle_chat?authSource=doodle_chat', function( err ) {
    if ( err ) {
      throw err
    }
  } )
} else {
  mongoose.connect( 'mongodb://localhost:27017/doodle_chat', function( err ) {
    if ( err ) {
      throw err
    }
  } )
}

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

//app.get('/*', (req, res) => {
  //// Just send the index.html for other files to support HTML5Mode
  //console.log( 'feff' )
  //res.sendFile( 'index.html', { root: __dirname + '/dist/chat-front' })
//})

//Starts up sockets
socketController( io )

//Starts running the app
http.listen( app.get( 'port' ), () => {
  console.log( 'Node app is running on port', app.get( 'port' ) )
})
