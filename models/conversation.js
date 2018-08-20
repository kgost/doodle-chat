//Model File for Conversations
var
  mongoose = require( 'mongoose' ),
  Message = require( './message' )

// define conversation Schema, must have a name, owner and participants
var conversationSchema = new mongoose.Schema({
  name: {type:String, required: true},
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, nickname: String, accessKey: String }],
}, { timestamps: true } )

// validate participants
conversationSchema.path( 'participants' ).validate( function( participants ) {
  if ( !participants ) return false
  else if ( participants.length === 0 ) return false

  return true
}, 'Conversation must have participants' )

conversationSchema.post( 'remove', ( conversation ) => {
  Message.remove( { conversation_id: conversation._id }, ( err ) => {
    if ( err ) throw err
  } )
} )

module.exports = mongoose.model( 'Conversation' , conversationSchema )
