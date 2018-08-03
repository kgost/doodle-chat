const
  env = require( 'node-env-file' ),
  mongoose = require( 'mongoose' ),
  to = require( 'await-to-js' ).to,
  jwt = require( 'jsonwebtoken' ),
  webpush = require('web-push'),
  responseHelper = require( '../functions/responseHelper' ),
  Media = require( '../models/media' ),
  Message = require( '../models/message' ),
  Reactions = require( '../models/reactions' ),
  Conversation = require( '../models/conversation' ),
  Friendship = require( '../models/friendship' ),
  Notifier = require( '../models/notifier' )

env( __dirname + '/../.env', { raise: false } )

const vapidKeys = {
  'publicKey':'BGkgfZpOxJfbbAp-dZcNhJxB-oFE9Tz2fROAqXDs211GqWcomgzxPYgQMBSX3ZY5PYSxJcnSf2diyj-jad6TAm0',
  'privateKey': process.env.PRIVATE_VAPID_KEY
}

webpush.setVapidDetails(
  'mailto:me@jackthelast.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
)

const syncActions = {
  create: ( req, res, next ) => {
    create( req )
      .then( ( result ) => {
        responseHelper.handleResponse( result, res )
        return next()
      } )
      .catch( ( err ) => {
        responseHelper.handleError( err, res )
        return next()
      } )
  },

  createReaction: ( req, res, next ) => {
    createReaction( req )
      .then( ( result ) => {
        responseHelper.handleResponse( result, res )
        return next()
      } )
      .catch( ( err ) => {
        responseHelper.handleError( err, res )
        return next()
      } )
  },

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

  show: ( req, res, next ) => {
    show( req )
      .then( ( result ) => {
        responseHelper.handleResponse( result, res )
        return next()
      } )
      .catch( ( err ) => {
        responseHelper.handleError( err, res )
        return next()
      } )
  },

  update: ( req, res, next ) => {
    update( req )
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

async function create( req ) {
  let err, media, msg, conversation, friendship

  const user = jwt.decode(req.query.token).user
  const reactionsId = mongoose.Types.ObjectId()

  // Save new message with corresponding conversationId
  let message = {
    text: req.body.text,
    user: user._id,
    username: user.username,
    reactions: reactionsId
  }

  if ( req.params.conversationId ) {
    message.conversation_id = req.params.conversationId
  } else {
    message.friendship_id = req.params.friendshipId
  }

  if ( req.body.media ) {
    [err, media] = await to( Media.create( { data: new Buffer( req.body.media.data ), mime: req.body.media.mime } ) )
    if ( err ) throw { status: 500, error: err }

    message.media = { mime: req.body.media.mime, id: media._id }

    if ( req.body.media.size ) {
      message.media.size = req.body.media.size
    }
  }

  [err, msg] = await to( Message.create( message ) )
  if ( err ) throw { status: 500, error: err }

  message._id = msg._id

  ;[err] = await to( Reactions.create( { _id: reactionsId, message: message._id, reactions: [] } ) )
  if ( err ) throw { status: 500, error: err }

  let notifierQuery, notifierObject, users, pushQuery

  if ( req.params.conversationId ) {
    [err, conversation] = await to( Conversation.findById( req.params.conversationId, 'participants' ).lean().exec() )
    if ( err ) throw { status: 500, error: err }

    users = conversation.participants.map( ( usr ) => {
      if ( usr.id != user._id ) {
        return mongoose.Types.ObjectId( usr.id )
      }
    } )

    notifierQuery = {
      user: { '$in': users },
      conversations: { '$ne': mongoose.Types.ObjectId( req.params.conversationId ) }
    }

    pushQuery = {
      user: { '$in': users },
      conversations: mongoose.Types.ObjectId( req.params.conversationId )
    }

    notifierObject = {
      '$push': { conversations: mongoose.Types.ObjectId( req.params.conversationId ) }
    }

    if ( err ) throw { status: 500, error: err }
  } else {
    [err, friendship] = await to( Friendship.findById( req.params.friendshipId, 'users' ).lean().exec() )
    if ( err ) throw { status: 500, error: err }

    users = friendship.users.map( ( usr ) => {
      if ( usr.id != user._id ) {
        return mongoose.Types.ObjectId( usr.id )
      }
    } )

    notifierQuery = {
      user: { '$in': users },
      friendships: { '$ne': mongoose.Types.ObjectId( req.params.friendshipId ) }
    }

    pushQuery = {
      user: { '$in': users },
      friendships: mongoose.Types.ObjectId( req.params.friendshipId )
    }

    notifierObject = {
      '$push': { friendships: mongoose.Types.ObjectId( req.params.friendshipId ) }
    }
  }

  [err] = await to( Notifier.update( notifierQuery, notifierObject, { multi: true } ).exec() )
  if ( err ) throw { status: 500, error: err }

  setTimeout( ( pushQuery ) => {
    Notifier.find( pushQuery, 'user' ).populate( 'user' ).lean().exec( ( err, notifiers ) => {
      const notificationPayload = {
        'notification': {
          'title': 'La Li Lu Le Lo',
          'body': 'New Secure Message',
          'icon': '/assets/images/active.jpg',
          'vibrate': [100, 50, 100],
          'data': {
            'dateOfArrival': Date.now(),
            'primaryKey': 1
          }
        }
      }

      if ( pushQuery.friendships ) {
        notificationPayload.notification.data.url = `/friends/${ pushQuery.friendships }`
      } else {
        notificationPayload.notification.data.url = `/friends/${ pushQuery.conversations }`
      }

      notifiers.forEach( ( notifier ) => {
        if ( notifier.user.pushSub ) {
          webpush.sendNotification(
            notifier.user.pushSub,
            JSON.stringify( notificationPayload )
          )
        }
      } )
    } )
  }, 1000 * 30, pushQuery )

  return { status: 201, data: message }
}

async function createReaction( req ) {
  let err, reactions

  const user = jwt.decode(req.query.token).user

  ;[err, reactions] = await to( Reactions.findOne( { message: req.params.messageId } ).lean().exec() )
  if ( err ) throw { status: 500, error: err }

  let i
  for ( i = 0; i < reactions.reactions.length; i++ ) {
    if ( user.username === reactions.reactions[i].username ) {
      reactions.reactions[i].text = req.body.reaction
      break
    }
  }

  if ( !reactions.reactions.length || ( i && i === reactions.reactions.length ) ) {
    reactions.reactions.push({ username: user.username, text: req.body.reaction })
  }

  [err] = await to( Reactions.findByIdAndUpdate( reactions._id, reactions ).exec() )
  if ( err ) throw { status: 500, error: err }

  return { status: 201, data: { _id: req.params.messageId, user: user._id, text: '' } }
}

async function index( req ) {
  let err, query, messages

  if ( req.params.conversationId ) {
    query = { conversation_id: req.params.conversationId }
  } else {
    query = { friendship_id: req.params.friendshipId }
  }

  if ( req.query.id ) {
    query['_id'] = { '$lt': req.query.id }
  }

  [err, messages] = await to( Message.find( query ).populate( 'reactions' ).sort( '-createdAt' ).limit( 20 ).lean().exec() )
  if ( err ) throw { status: 500, error: err }

  const result = []

  for ( let i = messages.length - 1; i >= 0; i-- ) {
    messages[i].reactions = messages[i].reactions.reactions
    result.push( messages[i] )
  }

  return { status: 200, data: { obj: result } }
}

async function show( req ) {
  let err, message

  [err, message] = await to( Message.findById( req.params.messageId ).populate( 'reactions' ).lean().exec() )
  if ( err ) throw { status: 500, error: err }

  if ( message ) {
    const reactions = message.reactions.reactions
    message.reactions = reactions
  }

  return { status: 200, data: message }
}

async function update( req ) {
  let err

  [err] = await to( Message.findByIdAndUpdate( req.params.id, req.body ).exec() )
  if ( err ) throw { status: 500, error: err }

  return { status: 200, data: { message: 'Reply Successful' } }
}

async function destroy( req ) {
  let err, message

  [err, message] = await to( Message.findById( req.params.id, 'media reactions' ).exec() )
  if ( err ) throw { status: 500, error: err }

  ;[err] = await to( message.remove() )
  if ( err ) throw { status: 500, error: err }

  return { status: 200, data: { message: 'Message deleted' } }
}

module.exports = syncActions
