//Model File for Users
const mongoose = require( 'mongoose' )

// Define Schema for User, must have notifiername and password, notifiername must be unique
const notifierSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  conversations: [{
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sent: Boolean
  }],
  friendships: [{
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Friendship', required: true },
    sent: Boolean
  }]
}, { timestamps: true } )

module.exports = mongoose.model( 'Notifier' , notifierSchema )
