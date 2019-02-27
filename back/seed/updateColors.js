const
  mongoose = require( 'mongoose' ),
  to = require( 'await-to-js' ).to,
  Conversation = require( '../models/conversation' ),
  User = require( '../models/user' )

const mongooseUrl = ( process.env.MNPASS ) ?
  'mongodb://chat_app_admin:' + process.env.MNPASS + '@ci.mtuopensource.club:27017/chat_app?authSource=chat_app' :
  'mongodb://127.0.0.1:27017/doodle_chat'

mongoose.connect( mongooseUrl, function( err ) {
  if ( err ) {
    console.log( err )
    process.exit()
  }

  start()
} )

async function start() {
  let err, conversations, users

  [err, conversations] = await to( Conversation.find({}).populate( 'participants.id' ) )
  if ( err ) throw err

  for ( const conversation of conversations ) {
    console.log( conversation.name )
    const usernames = {}

    for ( const participant of conversation.participants ) {
      usernames[participant.id.username] = {
        accessKey: participant.accessKey,
        nickname: participant.nickname,
        colors: participant.colors,
      }
    }

    [err, users] = await to( User.find( { username: { '$in': Object.keys( usernames ) } }, '_id username' ).lean().exec() )
    if ( err ) throw err

    for ( const user of users ) {
      usernames[user.username]._id = user._id
    }

    for ( let i = 0; i < conversation.participants.length; i++ ) {
      conversation.participants[i].colors = defaultColors( conversation.participants[i].id._id, users )
    }

    [err] = await to( conversation.save() )
    if ( err ) throw err
  }

  process.exit()
}

function defaultColors( userId, users ) {
  const colors = []

  for ( const user of users ) {
    if ( user._id.toString() != userId ) {
      colors.push( { id: user._id, color: '#ffffff' } )
    } else {
      colors.push( { id: user._id, color: '#449d44' } )
    }
  }

  return colors
}
