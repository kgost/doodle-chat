const
  express       = require('express'),
  router        = express.Router(),
  middleware    = require( '../functions/middleware' ),
  controller    = require( '../controllers/pushSub' )

router.post( '/',
  middleware.authenticate,
  controller.create )

router.get( '/',
  middleware.authenticate,
  controller.index )

router.delete(
  '/',
  middleware.authenticate,
  controller.destroy )

module.exports = router
