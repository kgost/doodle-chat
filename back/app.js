const
  env                = require( 'node-env-file' ),
  express            = require( 'express' ),
  sslRedirect        = require( 'heroku-ssl-redirect' ),
  app                = express(),
  http               = require( 'http' ).Server(app),
  cors               = require( 'cors' ),
  io                 = require( 'socket.io' ).listen( http ),
  bodyParser         = require( 'body-parser' ),
  expressSanitizer   = require( 'express-sanitizer' ),
  socketController   = require( './controllers/socket' ),
  authRoutes         = require( './routes/auth' ),
  conversationRoutes = require( './routes/conversation' ),
  friendshipRoutes   = require( './routes/friendship' ),
  pushSubRoutes      = require( './routes/pushSub' )

env( __dirname + '/.env', { raise: false } )

//Setting our views and port for the app
app.set('port', ( process.env.PORT || 3000 ) )
//Setting up bodyParser
app.use( bodyParser.json({ limit: '100mb' }) )
app.use( bodyParser.urlencoded( { extended: true } ) )

if ( process.env.HEROKU ) {
  app.use( sslRedirect() )
}
app.use( expressSanitizer() )
app.use( cors() )

//Use pathing to routes
app.use( '/api/auth', authRoutes )
app.use( '/api/conversations', conversationRoutes )
app.use( '/api/friendships', friendshipRoutes )
app.use( '/api/pushSub', pushSubRoutes )

//Starts up sockets
socketController( io )

//Starts running the app
http.listen( app.get( 'port' ), () => {
  console.log( 'Node app is running on port', app.get( 'port' ) )
})

const
  webpush                  = require( 'web-push' ),
  cron                     = require( 'node-cron' ),
  db                       = require( './models' ),
  User                     = db.User,
  Conversation             = db.Conversation,
  Friendship               = db.Friendship,
  ConversationNotification = db.ConversationNotification,
  FriendshipNotification   = db.FriendshipNotification

const vapidKeys = {
  'publicKey':'BN7O7tZnRi9-RktuYKO8-IO7LKW9ttqDwRlYOcBfFKBU48B_SRQXq956VGP6jYK6KF1ABY9OkTik30nEPbPc9Mk',
  'privateKey': process.env.PRIVATE_VAPID_KEY
}

webpush.setVapidDetails(
  'mailto:jpbland@mtu.edu',
  vapidKeys.publicKey,
  vapidKeys.privateKey
)

cron.schedule( '*/3 * * * * *', async () => {
  const conversationNotifications = await ConversationNotification.findAll({
    where: { sent: false },
    include: [
      {
        model: User,
        as: 'user',
        where: {
          [db.Sequelize.Op.not]: { pushSub: null },
        },
        required: true,
      },
      {
        model: Conversation,
        as: 'conversation',
      }
    ]
  })

  const friendshipNotifications = await FriendshipNotification.findAll({
    where: { sent: false },
    include: [
      {
        model: User,
        as: 'user',
        where: {
          [db.Sequelize.Op.not]: { pushSub: null },
        },
        required: true,
      },
      {
        model: Friendship,
        as: 'friendship',
        include: [
          {
            model: User,
            as: 'userOne',
            attributes: ['username'],
          },
          {
            model: User,
            as: 'userTwo',
            attributes: ['username'],
          },
        ]
      },
    ]
  })

  const notificationPayload = {
    message: '',
    url: '',
  }

  for ( const notification of conversationNotifications ) {
    if ( Number( new Date() ) - Number( notification.createdAt ) > 3 * 1000 && Object.keys( notification.user.pushSub ).length ) {
      try {
        notificationPayload.message = `New Secure Message(s) From ${ notification.conversation.name }`
        notificationPayload.url = `/conversations/${ notification.conversationId }`

        await webpush.sendNotification(
          typeof notification.user.pushSub === 'string' ? JSON.parse( notification.user.pushSub ) : notification.user.pushSub,
          JSON.stringify( notificationPayload )
        )

        notification.sent = true

        await notification.save()
      } catch( err ) {
        console.log( err )

        notification.sent = true
        await notification.save()
      }
    }
  }

  for ( const notification of friendshipNotifications ) {
    if ( Number( new Date() ) - Number( notification.createdAt ) > 3 * 1000 && Object.keys( notification.user.pushSub ).length ) {
      try {
        notificationPayload.message = `New Secure Message(s) From ${ notification.friendship.userOneId == notification.userId ? notification.friendship.userTwo.username : notification.friendship.userOne.username }`
        notificationPayload.url = `/friendships/${ notification.friendshipId }`

        await webpush.sendNotification(
          typeof notification.user.pushSub === 'string' ? JSON.parse( notification.user.pushSub ) : notification.user.pushSub,
          JSON.stringify( notificationPayload )
        )

        notification.sent = true

        await notification.save()
      } catch( err ) {
        console.log( err )

        notification.sent = true
        await notification.save()
      }
    }
  }
} )
