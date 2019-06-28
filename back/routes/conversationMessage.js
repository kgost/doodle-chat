const
  express        = require('express'),
  router         = express.Router({ mergeParams: true }),
  middleware     = require( '../functions/middleware' ),
  controller     = require( '../controllers/conversationMessage' ),
  reactionRouter = require( './conversationReaction.js' )

router.post( '/',
  middleware.authenticate,
  middleware.inConversation,
  controller.create )

router.get( '/',
  middleware.authenticate,
  middleware.inConversation,
  controller.index )

router.get( '/:messageId',
  middleware.authenticate,
  middleware.inConversation,
  controller.show )

router.put( '/:messageId',
  middleware.authenticate,
  middleware.inConversation,
  middleware.ownsConversationMessage,
  controller.update )

router.delete( '/:messageId',
  middleware.authenticate,
  middleware.inConversation,
  middleware.ownsConversationMessage,
  controller.destroy )

router.use( '/:messageId/reactions',
  reactionRouter )

module.exports = router
