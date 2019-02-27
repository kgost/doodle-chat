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
    const usernames = {}

    for ( const participant of conversation.participants ) {
      usernames[participant.id.username] = { accessKey: participant.accessKey, nickname: participant.nickname }
    }

    [err, users] = await to( User.find( { username: { '$in': Object.keys( usernames ) } }, '_id username' ).lean().exec() )
    if ( err ) throw err

    conversation.participants = users.map( ( usr ) => {
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

          for ( const u of conversation.participants ) {
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

    ;[err] = await to( conversation.save() )
    if ( err ) throw err
  }

  process.exit()
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
