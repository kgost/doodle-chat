//Model File for Users
const mongoose = require( 'mongoose' )

// Define Schema for User, must have username and password, username must be unique
const userSchema = new mongoose.Schema({
  username: {type:String, unique:true, required:true},
  password: {type:String, required:true},
  publicKey: { type:String, required:true },
  privateKey: { type: String, required: true }
}, { timestamps: true } )

userSchema.path('password').validate(function(password) {
  if (password.length < 6) return false

  return true
})

userSchema.path('username').validate(function(username) {
  if (username.length > 20) return false
  if ( !username.match( /^[^\s]+.*[^\s]+$/ ) ) return false

  return true
})

module.exports = mongoose.model( 'User' , userSchema )
