//Model File for Images
var mongoose = require( 'mongoose' );

// Define Schema for User, must have username and password, username must be unique
var imageSchema = new mongoose.Schema({
  img: { data: Buffer, contentType: String }
}, { timestamps: true } );

module.exports = mongoose.model( 'Image' , imageSchema );
