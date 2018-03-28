//Model File for Users
var mongoose = require( 'mongoose' );

// Define Schema for User, must have username and password, username must be unique
var userSchema = new mongoose.Schema({
  username: {type:String, unique:true, required:true},
  password: {type:String, required:true}
}, { timestamps: true } );

module.exports = mongoose.model( 'User' , userSchema );
