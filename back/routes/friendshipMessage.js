const
  express    = require('express'),
  router     = express.Router({ mergeParams: true }),
  middleware = require( '../functions/middleware' ),
  controller = require( '../controllers/friendshipMessage' ),
  reactionRouter = require( './friendshipReaction' )

router.post( '/',
  middleware.authenticate,
  middleware.inFriendship,
  middleware.activeFriendship,
  controller.create )

router.get( '/',
  middleware.authenticate,
  middleware.inFriendship,
  middleware.activeFriendship,
  controller.index )

router.get( '/:messageId',
  middleware.authenticate,
  middleware.inFriendship,
  middleware.activeFriendship,
  controller.show )

router.put( '/:messageId',
  middleware.authenticate,
  middleware.inFriendship,
  middleware.activeFriendship,
  middleware.ownsFriendshipMessage,
  controller.update )

router.delete( '/:messageId',
  middleware.authenticate,
  middleware.inFriendship,
  middleware.activeFriendship,
  middleware.ownsFriendshipMessage,
  controller.destroy )

router.use( '/:messageId/reactions',
  reactionRouter )

module.exports = router
