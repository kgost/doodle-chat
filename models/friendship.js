//Model File for Friendships
var mongoose = require( 'mongoose' )

// define firendship Schema, must have a name, owner and participants
var firendshipSchema = new mongoose.Schema({
  users: [{
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    accessKey: String,
    accepted: Boolean
  }]
}, { timestamps: true } )

module.exports = mongoose.model( 'Friendship' , firendshipSchema )
