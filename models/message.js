//Model File for Messages
//http://blog.slatepeak.com/creating-a-real-time-chat-api-with-node-express-socket-io-and-mongodb/

var mongoose = require( 'mongoose' );

var messageSchema = new mongoose.Schema({
  text: String,
  message_id: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true } );

module.exports = mongoose.model( 'Message' , messageSchema );
