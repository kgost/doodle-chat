const
  express       = require('express'),
  router        = express.Router(),
  middleware    = require( '../functions/middleware' ),
  controller    = require( '../controllers/friendship' ),
  messageRouter = require( './friendshipMessage' )

router.post( '/',
  middleware.authenticate,
  middleware.validFriendship,
  controller.create )

router.get( '/',
  middleware.authenticate,
  controller.index )

router.get( '/:id',
  middleware.authenticate,
  middleware.inFriendship,
  controller.show )

router.put( '/:id',
  middleware.authenticate,
  middleware.validFriendship,
  middleware.inFriendship,
  controller.update )

router.delete(
  '/:id',
  middleware.authenticate,
  middleware.inFriendship,
  controller.destroy )

router.delete(
  '/:id/notifications',
  middleware.authenticate,
  middleware.activeFriendship,
  middleware.inFriendship,
  controller.destroyNotifications )

router.use(
  '/:id/messages',
  messageRouter )

module.exports = router
