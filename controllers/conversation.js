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

  changeNicknames: ( req, res, next ) => {
    changeNicknames( req )
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

  const convo = pruneUsers( req.body )

  const usernames = {}

  for ( let participant of convo.participants ) {
    usernames[participant.id.username] = {
      accessKey: participant.accessKey,
      nickname: participant.nickname,
      color: participant.color
    }
  }

  [err, users] = await to( User.find( { username: { '$in': Object.keys( usernames ) } }, '_id username' ).lean().exec() )
  if ( err ) throw err

  convo.participants = users.map( ( usr ) => {
    const result = {
      id: { _id: usr._id, username: usr.username },
      accessKey: usernames[usr.username].accessKey,
      nickname: usernames[usr.username].nickname
    }

    if ( !usernames[usr.username].color ) {
      let unMatched = false
      let color

      while ( !unMatched ) {
        let match = false
        color = getRandomColor()

        for ( const u of convo.participants ) {
          if ( u.color === color ) {
            match = true
            break
          }
        }

        if ( !match ) {
          unMatched = true
        }
      }

      result.color = color
    } else {
      result.color = usernames[usr.username].color
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

async function changeNicknames( req ) {
  let err, conversation

  ;[err, conversation] = await to( Conversation.findById( req.params.conversationId ).lean().exec() )
  if ( err ) throw err

  for ( let i = 0; i < conversation.participants.length; i++ ) {
    for ( let j = 0; j < req.body.participants.length; j++ ) {
      if ( req.body.participants[j].id._id == conversation.participants[i].id ) {
        conversation.participants[i].nickname = req.body.participants[j].nickname
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

function getRandomColor() {
  const colors = [
    '#E80101', 
    '#E801D1', 
    '#AA01E8', 
    '#4601E8', 
    '#01C9E8', 
    '#01E86C',
    '#E8C901',
    '#E87401'
  ]

  return colors[Math.floor( Math.random() * ( colors.length - 1 - 0 + 1 ) ) + 0]
}

module.exports = syncActions
