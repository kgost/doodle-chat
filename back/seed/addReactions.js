const
  mongoose = require( 'mongoose' ),
  Message = require( '../models/message' ),
  Reactions = require( '../models/reactions' ),
  async = require( 'async' )

//Connecting to mongoose
mongoose.connect( 'mongodb://doodle:' + process.env.MNPASS + '@ci.mtuopensource.club:27017/doodle_chat?authSource=doodle_chat', function( err ) {
  if ( err ) {
    throw err
  }

  Message.find({}, ( err, messages ) => {
    if ( err ) {
      throw err
    }

    async.map( messages, ( message, cb ) => {
      Reactions.create( { message: message._id, reactions: [] }, ( err, reactions ) => {
        if ( err ) {
          return cb( err, null )
        }

        message.reactions = reactions._id

        message.save( ( err ) => {
          if ( err ) {
            cb( err, null )
          }

          cb( null, true )
        } )
      } )
    }, ( err, results ) => {
      if ( err ) {
        console.log( err )
      }

      process.exit()
    } )
  })
} )
