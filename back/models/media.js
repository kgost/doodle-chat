//Model File for Messages
//http://blog.slatepeak.com/creating-a-real-time-chat-api-with-node-express-socket-io-and-mongodb/
const mongoose 	= require( 'mongoose' )

// define the media schema, must have a user and conversation that it belongs to
const mediaSchema = new mongoose.Schema({
  data: { type: Buffer, required: true },
  mime: { type: String, required: true }
}, { timestamps: true } )

module.exports = mongoose.model( 'Media' , mediaSchema )
