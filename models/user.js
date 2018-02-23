//Model File for Users
//https://thinkster.io/tutorials/node-json-api/creating-the-user-model

var mongoose = require( 'mongoose' );

var userSchema = new mongoose.Schema({
  username: String,
  password: String,
}, { timestamps: true } );

module.exports = mongoose.model( 'User' , userSchema );
