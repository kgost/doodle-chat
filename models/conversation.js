//Model File for Conversations

var mongoose = require( 'mongoose' );

var conversationSchema = new mongoose.Schema({
    name: {type:String, required: true},
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    participants: [String],
}, { timestamps: true } );

module.exports = mongoose.model( 'Conversation' , conversationSchema );
