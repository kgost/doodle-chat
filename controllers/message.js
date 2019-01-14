const
  env = require( 'node-env-file' ),
  mongoose = require( 'mongoose' ),
  to = require( 'await-to-js' ).to,
  webpush = require('web-push'),
  responseHelper = require( '../functions/responseHelper' ),
  Message = require( '../models/message' ),
  Reactions = require( '../models/reactions' ),
  Poll = require( '../models/poll' ),
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
  let err, poll, msg, conversation, friendship

  const reactionsId = mongoose.Types.ObjectId()

  // Save new message with corresponding conversationId
  let message = {
    text: req.body.text,
    user: req.user._id,
    username: req.user.username,
    reactions: reactionsId,
    youtubeId: req.body.youtubeId,
    system: req.body.system
  }

  if ( req.params.conversationId ) {
    message.conversation_id = req.params.conversationId
  } else {
    message.friendship_id = req.params.friendshipId
  }

  if ( req.body.media ) {
    message.media = { mime: req.body.media.mime }

    if ( req.body.media.externalSrc ) {
      message.media.externalSrc = req.body.media.externalSrc
    }

    if ( req.body.media.size ) {
      message.media.size = req.body.media.size
    }
  }

  if ( req.body.poll ) {
    [err, poll] = await to( Poll.create( req.body.poll ) )
    if ( err ) throw err

    message.poll = poll._id
  }

  [err, msg] = await to( Message.create( message ) )
  if ( err ) throw err

  message._id = msg._id

  ;[err] = await to( Reactions.create( { _id: reactionsId, message: message._id, reactions: [] } ) )
  if ( err ) throw err

  let notifierQuery, notifierObject, users

  if ( req.params.conversationId ) {
    [err, conversation] = await to( Conversation.findById( req.params.conversationId, 'name participants' ).lean().exec() )
    if ( err ) throw err

    users = conversation.participants.map( ( usr ) => {
      if ( usr.id != req.user._id ) {
        return mongoose.Types.ObjectId( usr.id )
      }
    } )

    notifierQuery = {
      user: { '$in': users },
      'conversations.id': { '$ne': mongoose.Types.ObjectId( req.params.conversationId ) }
    }

    notifierObject = {
      '$push': {
        conversations: {
          id: mongoose.Types.ObjectId( req.params.conversationId ),
          sent: false
        }
      }
    }
  } else {
    [err, friendship] = await to( Friendship.findById( req.params.friendshipId, 'users' ).lean().exec() )
    if ( err ) throw err

    users = friendship.users.map( ( usr ) => {
      if ( usr.id != req.user._id ) {
        return mongoose.Types.ObjectId( usr.id )
      }
    } )

    notifierQuery = {
      user: { '$in': users },
      'friendships.id': { '$ne': mongoose.Types.ObjectId( req.params.friendshipId ) }
    }

    notifierObject = {
      '$push': {
        friendships: {
          id: mongoose.Types.ObjectId( req.params.friendshipId ),
          sent: false
        }
      }
    }
  }


  [err] = await to( Notifier.update( notifierQuery, notifierObject, { multi: true } ).exec() )
  if ( err ) throw err

  return { status: 201, data: message }
}

async function createReaction( req ) {
  let err, reactions

  ;[err, reactions] = await to( Reactions.findOne( { message: req.params.messageId } ).lean().exec() )
  if ( err ) throw err

  let i
  for ( i = 0; i < reactions.reactions.length; i++ ) {
    if ( req.user.username === reactions.reactions[i].username ) {
      reactions.reactions[i].text = req.body.reaction
      break
    }
  }

  if ( !reactions.reactions.length || ( i && i === reactions.reactions.length ) ) {
    reactions.reactions.push({ username: req.user.username, text: req.body.reaction })
  }

  [err] = await to( Reactions.findByIdAndUpdate( reactions._id, reactions ).exec() )
  if ( err ) throw err

  return { status: 201, data: { _id: req.params.messageId, user: req.user._id, text: '' } }
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

  [err, messages] = await to( Message.find( query ).populate( 'reactions' ).populate( 'poll' ).sort( '-createdAt' ).limit( 20 ).lean().exec() )
  if ( err ) throw err

  const result = []

  for ( let i = messages.length - 1; i >= 0; i-- ) {
    messages[i].reactions = messages[i].reactions.reactions
    result.push( messages[i] )
  }

  return { status: 200, data: { obj: result } }
}

async function show( req ) {
  let err, message

  [err, message] = await to( Message.findById( req.params.messageId ).populate( 'reactions' ).populate( 'poll' ).lean().exec() )
  if ( err ) throw err

  if ( message ) {
    const reactions = message.reactions.reactions
    message.reactions = reactions
  }

  return { status: 200, data: message }
}

async function update( req ) {
  let err

  [err] = await to( Message.findByIdAndUpdate( req.params.id, req.body ).exec() )
  if ( err ) throw err

  return { status: 200, data: { message: 'Reply Successful' } }
}

async function destroy( req ) {
  let err, message

  [err, message] = await to( Message.findById( req.params.id, 'media poll reactions' ).exec() )
  if ( err ) throw err

  ;[err] = await to( message.remove() )
  if ( err ) throw err

  return { status: 200, data: { message: 'Message deleted' } }
}

module.exports = syncActions
