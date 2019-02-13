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
  webpush          = require( 'web-push' ),
  cron             = require( 'node-cron' ),
  Notifier         = require( './models/notifier' ),
  socketController = require( './controllers/socket' ),
  apiRoutes        = require('./routes/api'),
  authRoutes       = require('./routes/auth')

env( __dirname + '/.env', { raise: false } )

const mongooseUrl = ( process.env.MNPASS ) ?
  'mongodb://chat_app_admin:' + process.env.MNPASS + '@ci.mtuopensource.club:27017/chat_app?authSource=chat_app' :
  'mongodb://127.0.0.1:27017/doodle_chat'

const vapidKeys = {
  'publicKey':'BGkgfZpOxJfbbAp-dZcNhJxB-oFE9Tz2fROAqXDs211GqWcomgzxPYgQMBSX3ZY5PYSxJcnSf2diyj-jad6TAm0',
  'privateKey': process.env.PRIVATE_VAPID_KEY
}

webpush.setVapidDetails(
  'mailto:jpbland@mtu.edu',
  vapidKeys.publicKey,
  vapidKeys.privateKey
)

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

app.get('/*', (req, res, next) => {
  // Just send the index.html for other files to support HTML5Mode
  if ( req.originalUrl.match( /\./ ) === null &&
    req.originalUrl.indexOf( '/api' ) !== 0 &&
    req.originalUrl.indexOf( '/auth' ) !== 0 ) {
    return res.sendFile( 'index.html', { root: __dirname + '/dist/lalilulelo' })
  } else {
    return next()
  }
})

//Pathing to our static files, css/js etc...
app.use( express.static(__dirname + '/dist/lalilulelo') )

//Starts up sockets
socketController( io )

//Starts running the app
http.listen( app.get( 'port' ), () => {
  console.log( 'Node app is running on port', app.get( 'port' ) )
})

cron.schedule( '*/5 * * * *', async () => {
  const notifiers = await Notifier.find( {}, 'user conversations.sent' ).populate( 'user' ).populate( 'friendships.id.users' ).populate( 'conversations.id' ).exec()
  const notificationPayload = {
    'notification': {
      'title': 'Saoirse',
      //'body': `New Secure Message(s) From ${ name }`,
      'icon': '/assets/images/active.jpg',
      'vibrate': [100, 50, 100],
      'data': {
        'dateOfArrival': Date.now(),
        'primaryKey': 1,
        'count': 1,
        //'name': name
      }
    }
  }

  for ( const notifier of notifiers ) {
    if ( notifier.user.pushSub && Object.keys( notifier.user.pushSub ).length ) {
      for ( const conversation of notifier.conversations ) {
        if ( !conversation.sent ) {
          notificationPayload.notification.body = `New Secure Message(s) From ${ conversation.id.name }`
          notificationPayload.notification.data.url = `/conversations/${ conversation.id._id }`
          conversation.sent = true

          try {
            await webpush.sendNotification(
              notifier.user.pushSub,
              JSON.stringify( notificationPayload )
            )
          } catch ( e ) {
            console.log( e )
          }
        }
      }

      for ( const friendship of notifier.friendships ) {
        if ( !friendship.sent ) {
          let name = ''

          for ( const user of friendship.users ) {
            if ( user._id != notifier.user ) {
              name = user.username
            }
          }

          notificationPayload.notification.body = `New Secure Message(s) From ${ name }`
          notificationPayload.notification.data.url = `/friends/${ friendship.id._id }`
          friendship.sent = true

          try {
            await webpush.sendNotification(
              notifier.user.pushSub,
              JSON.stringify( notificationPayload )
            )
          } catch ( e ) {
            console.log( e )
          }
        }
      }

      await notifier.save()
    }
  }
} )
