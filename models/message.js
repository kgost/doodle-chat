//Model File for Messages
//http://blog.slatepeak.com/creating-a-real-time-chat-api-with-node-express-socket-io-and-mongodb/
const mongoose 	= require( 'mongoose' ),
  Media = require( './media' ),
  Poll = require( './poll' ),
  Reactions = require( './reactions' )

// define the message schema, must have a user and conversation that it belongs to
const messageSchema = new mongoose.Schema({
  text: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' , required:true },
  username: { type: String, required: true },
  conversation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
  friendship_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Friendship' },
  media: {
    mime: String,
    size: { width: Number, height: Number },
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Media' },
    externalSrc: String
  },
  youtubeId: String,
  reactions: { type: mongoose.Schema.Types.ObjectId, ref: 'Reactions' },
  poll: { type: mongoose.Schema.Types.ObjectId, ref: 'Poll' }
}, { timestamps: true } )

messageSchema.post( 'remove', ( message ) => {
  Reactions.findByIdAndRemove( message.reactions, ( err ) => {
    if ( err ) throw err

    if ( message.media ) {
      Media.findByIdAndRemove( message.media.id, ( err ) => {
        if ( err ) throw err

        if ( message.poll ) {
          Poll.findByIdAndRemove( message.poll, ( err ) => {
            if ( err ) throw err
          } )
        }
      } )
    }
  } )
} )

module.exports = mongoose.model( 'Message' , messageSchema )
