const
  express    = require('express'),
  router     = express.Router(),
  middleware = require( '../functions/middleware' ),
  controller = require( '../controllers/conversation' )

router.post( '/',
  middleware.authenticate,
  middleware.validConversation,
  controller.create )

router.get( '/',
  middleware.authenticate,
  controller.index )

router.get( '/:id',
  middleware.authenticate,
  middleware.inConversation,
  controller.show )

router.put( '/:id',
  middleware.authenticate,
  middleware.validConversation,
  middleware.ownsConversation,
  controller.update )

router.delete(
  '/:id',
  middleware.authenticate,
  middleware.ownsConversation,
  controller.destroy )

router.get(
  '/:id/leave',
  middleware.authenticate,
  middleware.inConversation,
  controller.leave )

router.put(
  '/:id/change-cosmetic',
  middleware.authenticate,
  middleware.inConversation,
  controller.changeCosmetic )

module.exports = router
