const
  express       = require('express'),
  router        = express.Router({ mergeParams: true }),
  middleware    = require( '../functions/middleware' ),
  controller    = require( '../controllers/conversationMessage' )

router.post( '/',
  middleware.authenticate,
  middleware.inConversation,
  controller.create )

router.get( '/',
  middleware.authenticate,
  middleware.inConversation,
  controller.index )

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

module.exports = router
