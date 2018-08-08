//Model File for Messages
//http://blog.slatepeak.com/creating-a-real-time-chat-api-with-node-express-socket-io-and-mongodb/
const mongoose 	= require( 'mongoose' )

// define the poll schema, must have a user and conversation that it belongs to
const pollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answers: [{
    text: String,
    userIds: [String]
  }],
})

module.exports = mongoose.model( 'Poll' , pollSchema )
