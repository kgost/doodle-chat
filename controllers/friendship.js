const
  mongoose = require( 'mongoose' ),
  jwt = require( 'jsonwebtoken' ),
  to = require( 'await-to-js' ).to,
  responseHelper = require( '../functions/responseHelper' ),
  User = require( '../models/user' ),
  Friendship = require( '../models/friendship' ),
  Notifier = require( '../models/notifier' ),
  Message = require( '../models/message' )

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

  leave: ( req, res, next ) => {
    leave( req )
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
  let err, usr

  const user = jwt.decode(req.query.token).user
  let key1 = ''
  let key2 = ''
  let otherUsername = ''

  for ( let i = 0; i < req.body.users.length; i++ ) {
    if ( req.body.users[i].id.username != user.username ) {
      otherUsername = req.body.users[i].id.username
      key2 = req.body.users[i].accessKey
    } else {
      key1 = req.body.users[i].accessKey
    }
  }

  [err, usr] = await to( User.findOne( { username: otherUsername }, '_id username' ).lean().exec() )
  if ( err ) throw { status: 500, error: err }
  if ( !usr || !usr._id ) throw {
    status: 400,
    data: {
      title: 'Invalid friendship request',
      error: { message: 'The Friendship Request Was Invalid' }
    }
  }

  ;[err] = await to(
    Friendship.create(
      {
        users: [
          { id: user._id, accessKey: key1, accepted: true },
          { id: usr._id, accessKey: key2, accepted: false }
        ]
      }
    )
  )
  if ( err ) throw { status: 500, error: err }

  return {
    status: 201,
    data: { users: [
      { id: { _id: user._id, username: user.username }, accepted: true },
      { id: { _id: usr._id, username: usr.username }, accepted: false }
    ] }
  }
}

async function index( req ) {
  let err, friendships

  const user = jwt.decode(req.query.token).user

  ;[err, friendships] = await to(
    Friendship.find({ 'users.id': mongoose.Types.ObjectId( user._id ) })
      .populate( 'users.id', 'username' )
      .lean()
      .exec()
  )
  if ( err ) throw { status: 500, error: err }

  return { status: 200, data: { obj: friendships } }
}

async function update( req ) {
  let err, friendship

  const user = jwt.decode(req.query.token).user

  ;[err, friendship] = await to( Friendship.findById( req.params.friendshipId ).exec() )
  if ( err ) throw { status: 500, error: err }

  for ( let i = 0; i < friendship.users.length; i++ ) {
    if ( friendship.users[i].id == user._id ) {
      friendship.users[i].accepted = true
    }
  }

  [err] = await to( friendship.save() )
  if ( err ) throw { status: 500, error: err }
      
  return { status: 201, data: friendship }
}

async function destroy( req ) {
  let err, messages

  [err] = await to( Friendship.findByIdAndRemove( req.params.friendshipId ) )
  if ( err ) throw { status: 500, error: err }

  ;[err] = await to(
    Notifier.update(
      { friendships: mongoose.Types.ObjectId( req.params.friendshipId ) },
      { '$pull': { friendships: mongoose.Types.ObjectId( req.params.friendshipId ) } }
    ).exec()
  )

  ;[err, messages] = await to( Message.find( { friendship_id: req.params.friendshipId }, 'media' ) )
  if ( err ) throw { status: 500, error: err }

  await Promise.all(
    messages.map( async ( message ) => {
      [err] = await to( message.remove() )
      if ( err ) throw { status: 500, error: err }
    } )
  )

  return { status: 200, data: { message: 'Friendship deleted' } }
}

async function leave( req ) {
  let err, conversation

  const user = jwt.decode(req.query.token).user //Pull user from the JWT

  ;[err, conversation] = await to( Conversation.findById( req.params.id ).lean().exec() )
  if ( err ) throw { status: 500, error: err }

  ;[err] = await to(
    Notifier.update(
      { user: mongoose.Types.ObjectId( user._id ) },
      { '$pull': { conversations: mongoose.Types.ObjectId( req.params.id ) } }
    ).exec()
  )
  if ( err ) throw { status: 500, error: err }

  for ( let i = 0; i < conversation.participants.length; i++ ) {
    if ( conversation.participants[i].id == user._id ) {
      conversation.participants.splice( i, 1 )
      break
    }
  }

  [err] = await to( Conversation.findByIdAndUpdate( conversation._id, conversation ).exec() )
  if ( err ) throw { status: 500, error: err }

  return { status: 200, data: { message: 'Left Converrsation' } }
}

function pruneUsers( conversation ) {
  for ( let i = 0; i < conversation.participants.length; i++ ) {
    for ( let j = i + 1; j < conversation.participants.length; j++ ) {
      if ( conversation.participants[i].id.username === conversation.participants[j].id.username ) {
        conversation.participants.splice( i, 1 )
        i--
        break
      }
    }
  }
  return conversation
}

module.exports = syncActions
