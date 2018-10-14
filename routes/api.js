const
  express      = require('express'),
  router       = express.Router(),
  streamifier  = require( 'streamifier' ),
  middleware   = require( '../functions/middleware' ),
  responseHelper   = require( '../functions/responseHelper' ),
  messageController = require( '../controllers/message' ),
  conversationController = require( '../controllers/conversation' ),
  friendshipController = require( '../controllers/friendship' ),
  notificationsController = require( '../controllers/notifications' ),
  Media        = require( '../models/media' ),
  Poll         = require( '../models/poll' ),
  User         = require( '../models/user' )

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

router.put(
  '/conversations/:conversationId/changeCosmetic',
  middleware.authenticate,
  middleware.inConversation,
  conversationController.changeCosmetic
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
      return responseHelper.handleError( err, res )
    }

    if ( !file || !file.data ) {
      return responseHelper.handleError( { status: 404, userMessage: 'No Media Found.' }, res )
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

router.get( '/conversations/:conversationId/poll/:pollId/:index', middleware.authenticate, middleware.inConversation, ( req, res ) => {
  Poll.findOne( { _id: req.params.pollId, conversationId: req.params.conversationId }, ( err, poll ) => {
    if ( err ) {
      return responseHelper.handleError( err )
    }

    let match = false

    for ( let i = 0; i < poll.answers.length; i++ ) {
      for ( let j = 0; j < poll.answers[i].userIds.length; j++ ) {
        if ( poll.answers[i].userIds[j] == req.user._id ) {
          match = true
          poll.answers[i].userIds.splice( j, 1 )
          break
        }
      }

      if ( match ) {
        break
      }
    }

    poll.answers[Number( req.params.index )].userIds.push( req.user._id )

    poll.save( ( err ) => {
      if ( err ) {
        return responseHelper.handleError( err )
      }

      res.status( 200 ).json(poll)
    } )
  } )
} )

router.get( '/friendships/:friendshipId/poll/:pollId/:index', middleware.authenticate, middleware.inFriendship, ( req, res ) => {
  Poll.findOne( { _id: req.params.pollId, friendshipId: req.params.friendshipId }, ( err, poll ) => {
    if ( err ) {
      return responseHelper.handleError( err )
    }

    let match = false

    for ( let i = 0; i < poll.answers.length; i++ ) {
      for ( let j = 0; j < poll.answers[i].userIds.length; j++ ) {
        if ( poll.answers[i].userIds[j] == req.user._id ) {
          match = true
          poll.answers[i].userIds.splice( j, 1 )
          break
        }
      }

      if ( match ) {
        break
      }
    }

    poll.answers[Number( req.params.index )].userIds.push( req.user._id )

    poll.save( ( err ) => {
      if ( err ) {
        return responseHelper.handleError( err )
      }

      res.status( 200 ).json(poll)
    } )
  } )
} )

router.get( '/notifications', middleware.authenticate, notificationsController.index )

router.delete( '/notifications/conversation/:conversationId', middleware.authenticate, notificationsController.destroy )

router.delete( '/notifications/friendship/:friendshipId', middleware.authenticate, notificationsController.destroy )

router.post( '/publicKeys', middleware.authenticate, ( req, res ) => {
  User.find( { username: { '$in': req.body } }, 'username publicKey', ( err, users ) => {
    if ( err ) {
      return responseHelper.handleError( err )
    }

    res.status( 200 ).json({ obj: users })
  } )
} )

module.exports = router
