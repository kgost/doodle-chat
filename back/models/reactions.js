//Model File for Users
const mongoose = require( 'mongoose' )

// Define Schema for User, must have reactionsname and password, reactionsname must be unique
const reactionsSchema = new mongoose.Schema({
  message: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  reactions: [{
    username: { type: String, required: true },
    text: { type: String, required: true },
  }]
}, { timestamps: true } )

module.exports = mongoose.model( 'Reactions' , reactionsSchema )
