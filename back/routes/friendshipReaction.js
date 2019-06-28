const
  express    = require('express'),
  router     = express.Router({ mergeParams: true }),
  middleware = require( '../functions/middleware' ),
  controller = require( '../controllers/friendshipReaction' )

router.post( '/',
  middleware.authenticate,
  middleware.inFriendship,
  controller.create )

module.exports = router
