const
  express    = require('express'),
  router     = express.Router({ mergeParams: true }),
  middleware = require( '../functions/middleware' ),
  controller = require( '../controllers/conversationReaction' )

router.post( '/',
  middleware.authenticate,
  middleware.inConversation,
  controller.create )

module.exports = router
