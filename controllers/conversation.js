const
  mongoose = require( 'mongoose' ),
  to = require( 'await-to-js' ).to,
  responseHelper = require( '../functions/responseHelper' ),
  User = require( '../models/user' ),
  Conversation = require( '../models/conversation' ),
  Notifier = require( '../models/notifier' ),
  Message = require( '../models/message' )

const syncActions = {
  create: ( req, res, next ) => {
    createOrUpdate( req, false )
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
    createOrUpdate( req, true )
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

  changeCosmetic: ( req, res, next ) => {
    changeCosmetic( req )
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

async function createOrUpdate( req, update ) {
  let err, users, conversation

  const convo = pruneUsers( req.body.conversation )

  const usernames = {}

  for ( let participant of convo.participants ) {
    usernames[participant.id.username] = {
      accessKey: participant.accessKey,
      nickname: participant.nickname,
      colors: participant.colors
    }
  }

  [err, users] = await to( User.find( { username: { '$in': Object.keys( usernames ) } }, '_id username' ).lean().exec() )
  if ( err ) throw err

  for ( const user of users ) {
    usernames[user.username]._id = user._id
  }

  convo.participants = users.map( ( usr ) => {
    const result = {
      id: { _id: usr._id, username: usr.username },
      accessKey: usernames[usr.username].accessKey,
      nickname: usernames[usr.username].nickname,
    }

    if ( req.user._id == usr._id ) {
      for ( let i = 0; i < req.body.colors.length; i++ ) {
        req.body.colors[i].id = usernames[convo.participants[i].id.username]._id
      }

      result.colors = req.body.colors 
    } else if ( !update ) {
      result.colors = defaultColors( usr._id, users ) 
    }

    return result
  } )

  convo.name = req.sanitize( convo.name )

  if( update ) {
    [err, conversation] = await to( Conversation.findByIdAndUpdate( req.params.id, convo ).exec() )
    if ( err ) throw err
  } else {
    [err, conversation] = await to( Conversation.create( convo ) )
    if ( err ) throw err
  }

  return {
    status: 201,
    data: {
      _id: conversation._id,
      name: convo.name,
      owner: { _id: req.user._id, username: req.user.username },
      participants: convo.participants
    }
  }
}

async function index( req ) {
  let err, conversations

  ;[err, conversations] =
    await to(
      Conversation.find({ 'participants.id': mongoose.Types.ObjectId( req.user._id ) }, '_id name participants owner' )
        .populate('participants.id', 'username')
        .populate( 'owner', 'username' )
        .exec()
    )
  if ( err ) throw err

  return { status: 200, data: { obj: conversations } }
}

async function destroy( req ) {
  let err, messages

  [err] = await to( Conversation.remove( { _id: req.params.id } ) )
  if ( err ) throw err

  ;[err] = await to(
    Notifier.update(
      { conversations: mongoose.Types.ObjectId( req.params.id ) },
      { '$pull': { conversations: mongoose.Types.ObjectId( req.params.id ) } }
    ).exec()
  )
  if ( err ) throw err

  ;[err, messages] = await to( Message.find( { conversation_id: req.params.id }, 'media reactions' ).exec() )
  if ( err ) throw err

  await Promise.all(
    messages.map( async ( message ) => {
      [err] = await to( message.remove() )
      if ( err ) throw err
    } )
  )

  return { status: 200, data: { message: 'Conversation deleted' } }
}

async function leave( req ) {
  let err, conversation

  ;[err, conversation] = await to( Conversation.findById( req.params.id ).lean().exec() )
  if ( err ) throw err

  ;[err] = await to(
    Notifier.update(
      { user: mongoose.Types.ObjectId( req.user._id ) },
      { '$pull': { conversations: mongoose.Types.ObjectId( req.params.id ) } }
    ).exec()
  )
  if ( err ) throw err

  for ( let i = 0; i < conversation.participants.length; i++ ) {
    if ( conversation.participants[i].id == req.user._id ) {
      conversation.participants.splice( i, 1 )
      break
    }
  }

  [err] = await to( Conversation.findByIdAndUpdate( conversation._id, conversation ).exec() )
  if ( err ) throw err

  return { status: 200, data: { message: 'Left Converrsation' } }
}

async function changeCosmetic( req ) {
  let err, conversation

  [err, conversation] = await to( Conversation.findById( req.params.conversationId ).lean().exec() )
  if ( err ) throw err

  for ( let i = 0; i < conversation.participants.length; i++ ) {
    for ( let j = 0; j < req.body.conversation.participants.length; j++ ) {
      if ( req.body.conversation.participants[j].id._id == conversation.participants[i].id ) {
        conversation.participants[i].nickname = req.body.conversation.participants[j].nickname
      }

      if ( conversation.participants[i].id == req.user._id && req.body.conversation.participants[j].id._id === req.user._id ) {
        conversation.participants[i].colors = req.body.colors
      }
    }
  }

  [err] = await to( Conversation.findByIdAndUpdate( conversation._id, conversation ).exec() )
  if ( err ) throw err

  return { status: 200, data: conversation }
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

function defaultColors( userId, users ) {
  const colors = []

  for ( const user of users ) {
    if ( user._id != userId ) {
      colors.push( { id: user._id, color: '#ffffff' } )
    } else {
      colors.push( { id: user._id, color: '#449d44' } )
    }
  }

  return colors
}

module.exports = syncActions
