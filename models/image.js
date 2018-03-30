//Model File for Images
var mongoose = require( 'mongoose' );

// Define Schema for Image
  var imageSchema = new mongoose.Schema({
  img: { data: Buffer, contentType: String }
}, { timestamps: true } );

module.exports = mongoose.model( 'Image' , imageSchema );
