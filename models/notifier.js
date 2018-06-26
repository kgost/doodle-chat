//Model File for Users
const mongoose = require( 'mongoose' )

// Define Schema for User, must have notifiername and password, notifiername must be unique
const notifierSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  conversations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' }],
  friendships: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Friendship' }]
}, { timestamps: true } )

module.exports = mongoose.model( 'Notifier' , notifierSchema )
