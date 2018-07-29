const
  express      = require('express'),
  router       = express.Router(),
  jwt          = require( 'jsonwebtoken' ),
  mongoose     = require( 'mongoose' ),
  streamifier  = require( 'streamifier' ),
  Media        = require( '../models/media' ),
  User         = require( '../models/user' ),
  Notifier     = require( '../models/notifier' ),
  middleware   = require( '../functions/middleware' ),
  messageController   = require( '../controllers/message' ),
  conversationController   = require( '../controllers/conversation' ),
  friendshipController   = require( '../controllers/friendship' )

//Conversation Routes

/**
 * CREATE route for conversations:
 *    Creates conversation and saves to MongoDB
 * @param  {[type]}   req  request object from user to server
 * @param  {[type]}   res  response object to user from server
 * @param  {Function} next next function in express function list
 * @return {[type]}        Returns a status code and corresponding messages.
 */
router.post(
  '/conversations',
  middleware.authenticate,
  conversationController.create
)

/**
 * READ route for conversations:
 *    Finds and returns all conversations that a user is in
 * @param  {[type]}   req  request object from user to server
 * @param  {[type]}   res  response object to user from server
 * @param  {Function} next next function in express function list
 * @return {[type]}        Returns a status code and corresponding messages.
 */
router.get(
  '/conversations',
  middleware.authenticate,
  conversationController.index
)

/**
 * UPDATE route for conversations:
 *    Replaces conversation in MongoDB with new data in req
 * @param  {[type]}   id   id sent in req.params
 * @param  {[type]}   req  request object from user to server
 * @param  {[type]}   res  response object to user from server
 * @param  {Function} next next function in express function list
 * @return {[type]}        Returns a status code and corresponding messages.
 */
router.put(
  '/conversations/:id',
  middleware.authenticate,
  middleware.isConversationOwner,
  conversationController.update
)

/**
 * Destroy route for conversations:
 *    Deletes conversation and all associated messages in MongoDB
 * @param  {[type]}   id   id sent in req.params
 * @param  {[type]}   req  request object from user to server
 * @param  {[type]}   res  response object to user from server
 * @param  {Function} next next function in express function list
 * @return {[type]}        Returns a status code and corresponding message.
 */
router.delete(
  '/conversations/:id',
  middleware.authenticate,
  middleware.isConversationOwner,
  conversationController.destroy
)

router.get(
  '/conversations/:id/leave',
  middleware.authenticate,
  conversationController.leave
)

//Friendship Routes
router.post(
  '/friendships',
  middleware.authenticate,
  middleware.validSentFriendship,
  friendshipController.create
)

router.get(
  '/friendships',
  middleware.authenticate,
  friendshipController.index
)

router.put(
  '/friendships/:friendshipId',
  middleware.authenticate,
  middleware.inFriendship,
  friendshipController.update
)

router.delete(
  '/friendships/:friendshipId',
  middleware.authenticate,
  middleware.inFriendship,
  friendshipController.destroy
)

//Message Routes

/**
 * CREATE route for messages:
 *    Creates message and saves to MongoDB
 * @param  {[type]}   conversationId conversationID sent in req.params
 * @param  {[type]}   req  request object from user to server
 * @param  {[type]}   res  response object to user from server
 * @param  {Function} next next function in express function list
 * @return {[type]}        Returns a status code and corresponding message.
 */
router.post(
  '/messages/:conversationId',
  middleware.authenticate,
  middleware.inConversation,
  messageController.create
)

router.post(
  '/message/:conversationId/:messageId/reaction',
  middleware.authenticate,
  middleware.inConversation,
  messageController.createReaction
)

/**
 * CREATE route for messages:
 *    Creates message and saves to MongoDB
 * @param  {[type]}   conversationId conversationID sent in req.params
 * @param  {[type]}   req  request object from user to server
 * @param  {[type]}   res  response object to user from server
 * @param  {Function} next next function in express function list
 * @return {[type]}        Returns a status code and corresponding message.
 */
router.post(
  '/privateMessages/:friendshipId',
  middleware.authenticate,
  middleware.inFriendship,
  messageController.create
)

router.post(
  '/privateMessage/:friendshipId/:messageId/reaction',
  middleware.authenticate,
  middleware.inFriendship,
  messageController.createReaction
)

/**
 * READ route for message:
 *    Finds and returns all messages for a given conversation
 * @param  {[type]}   conversationId conversationID sent in req.params
 * @param  {[type]}   req  request object from user to server
 * @param  {[type]}   res  response object to user from server
 * @param  {Function} next next function in express function list
 * @return {[type]}        Returns a status code along with an object containing the conversation's messages.
 */
router.get(
  '/messages/:conversationId',
  middleware.authenticate,
  middleware.inConversation,
  messageController.index
)

/**
 * READ route for message:
 *    Finds and returns all messages for a given conversation
 * @param  {[type]}   conversationId conversationID sent in req.params
 * @param  {[type]}   req  request object from user to server
 * @param  {[type]}   res  response object to user from server
 * @param  {Function} next next function in express function list
 * @return {[type]}        Returns a status code along with an object containing the conversation's messages.
 */
router.get(
  '/privateMessages/:friendshipId',
  middleware.authenticate,
  middleware.inFriendship,
  messageController.index
)

router.get(
  '/message/:conversationId/:messageId',
  middleware.authenticate,
  middleware.inConversation,
  messageController.show
)

router.get(
  '/privateMessage/:friendshipId/:messageId',
  middleware.authenticate,
  middleware.inFriendship,
  messageController.show
)

/**
 * UPDATE route for message:
 *    Updates all messages for a given conversation
 * @param  {[type]}   conversationId conversationID sent in req.params
 * @param  {[type]}   req  request object from user to server
 * @param  {[type]}   res  response object to user from server
 * @param  {Function} next next function in express function list
 * @return {[type]}        Returns a status code along with an object containing the messages.
 */
router.put(
  '/messages/:id',
  middleware.authenticate,
  middleware.isMessageOwner,
  messageController.update
)

/**
 * DELETE route for message:
 *    Deletes a specific message
 * @param  {[type]}   id id sent in req.params
 * @param  {[type]}   req  request object from user to server
 * @param  {[type]}   res  response object to user from server
 * @param  {Function} next next function in express function list
 * @return {[type]}        Returns a status code
 */
router.delete(
  '/messages/:id',
  middleware.authenticate,
  middleware.isMessageOwner,
  messageController.destroy
)

router.get( '/media/:id', ( req, res ) => {
  Media.findById( req.params.id, ( err, file ) => {
    if ( err ) {
      return res.status( 500 ).json({
        title: 'An error occured',
        error: err
      })
    }

    if ( !file || !file.data ) {
      return res.status( 404 ).json({
        title: 'An error occured',
        error: { message: 'No media found' }
      })
    }

    if ( file.mime.indexOf( 'video' ) !== -1 ) {
      const fileSize = file.data.length
      const range = req.headers.range

      if ( range ) {
        const parts = range.replace(/bytes=/, '').split('-')
        const start = parseInt( parts[0], 10 )
        const end = parts[1] ? parseInt( parts[1], 10 ) : fileSize - 1
        const chunksize = ( end - start ) + 1
        const chunk = file.data.slice( start, end + 1 )
        const stream = streamifier.createReadStream( chunk )
        const head = {
          'Content-Range': `bytes ${ start }-${ end }/${ fileSize }`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': file.mime
        }

        res.writeHead( 206, head )
        stream.pipe( res )
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': file.mime
        }

        res.writeHead( 200, head )
        streamifier.createReadStream( file.data ).pipe( res )
      }
    } else {
      res.contentType( file.mime )
      res.end( file.data, 'binary' )
    }
  } )
} )

router.get( '/notifications', middleware.authenticate, ( req, res ) => {
  const user = jwt.decode(req.query.token).user

  Notifier.findOne({ user: mongoose.Types.ObjectId( user._id ) }, ( err, notifier ) => {
    if ( err ) {
      return res.status( 500 ).json({
        title: 'An error occured',
        error: err
      })
    }

    res.status( 200 ).json( notifier )
  } )
} )

router.delete( '/notifications/conversation/:id', middleware.authenticate, ( req, res ) => {
  const user = jwt.decode(req.query.token).user

  Notifier.findOne({ user: mongoose.Types.ObjectId( user._id ) }, ( err, notifier ) => {
    if ( err ) {
      return res.status( 500 ).json({
        title: 'An error occured',
        error: err
      })
    }

    for ( let i = 0; i < notifier.conversations.length; i++ ) {
      if ( notifier.conversations[i] == req.params.id ) {
        notifier.conversations.splice( i, 1 )
        break
      }
    }

    notifier.save( ( err ) => {
      if ( err ) {
        return res.status( 500 ).json({
          title: 'An error occured',
          error: err
        })
      }

      res.status( 200 ).json({ message: 'Notification Removed' })
    } )
  } )
} )

router.delete( '/notifications/friendship/:id', middleware.authenticate, ( req, res ) => {
  const user = jwt.decode(req.query.token).user

  Notifier.findOne({ user: mongoose.Types.ObjectId( user._id ) }, ( err, notifier ) => {
    if ( err ) {
      return res.status( 500 ).json({
        title: 'An error occured',
        error: err
      })
    }

    for ( let i = 0; i < notifier.friendships.length; i++ ) {
      if ( notifier.friendships[i] == req.params.id ) {
        notifier.friendships.splice( i, 1 )
        break
      }
    }

    notifier.save( ( err ) => {
      if ( err ) {
        return res.status( 500 ).json({
          title: 'An error occured',
          error: err
        })
      }

      res.status( 200 ).json({ message: 'Notification Removed' })
    } )
  } )
} )

router.post( '/publicKeys', middleware.authenticate, ( req, res ) => {
  User.find( { username: { '$in': req.body } }, 'username publicKey', ( err, users ) => {
    if ( err ) {
      return res.status( 500 ).json({
        title: 'An error occured',
        error: err
      })
    }

    res.status( 200 ).json({ obj: users })
  } )
} )

module.exports = router
