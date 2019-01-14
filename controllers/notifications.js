const
  mongoose       = require( 'mongoose' ),
  to             = require( 'await-to-js' ).to,
  responseHelper = require( '../functions/responseHelper' ),
  Notifier       = require( '../models/notifier' )

const syncActions = {
  index: ( req, res, next ) => {
    index( req )
      .then( ( result ) => {
        responseHelper.handleResponse( result, res )
        return next()
      } )
      .catch( ( err ) => {
        responseHelper.handleError( err, res )
        return next()
      } )
  },

  destroy: ( req, res, next ) => {
    destroy( req )
      .then( ( result ) => {
        responseHelper.handleResponse( result, res )
        return next()
      } )
      .catch( ( err ) => {
        responseHelper.handleError( err, res )
        return next()
      } )
  },
}

async function index( req ) {
  let err, notifier

  ;[err, notifier] =
    await to(
      Notifier.findOne({ user: mongoose.Types.ObjectId( req.user._id ) } )
        .lean()
        .exec()
    )
  if ( err ) throw err

  return { status: 200, data: notifier }
}

async function destroy( req ) {
  let err, notifier

  ;[err, notifier] = await to( Notifier.findOne({ user: mongoose.Types.ObjectId( req.user._id ) } ) )
  if ( err ) throw err

  if ( req.params.conversationId ) {
    for ( let i = 0; i < notifier.conversations.length; i++ ) {
      if ( notifier.conversations[i].id == req.params.conversationId ) {
        notifier.conversations.splice( i, 1 )
        break
      }
    }
  } else {
    for ( let i = 0; i < notifier.friendships.length; i++ ) {
      if ( notifier.friendships[i].id == req.params.friendshipId ) {
        notifier.friendships.splice( i, 1 )
        break
      }
    }
  }

  [err] = await to( notifier.save() )
  if ( err ) throw err

  return { status: 200, data: { message: 'Notification Removed' } }
}

module.exports = syncActions
