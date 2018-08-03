const mongoose = require( 'mongoose' )

console.time( 'feff' )
//mongoose.connect( mongooseUrl, function( err ) {
mongoose.connect( 'mongodb://doodle:' + process.env.MNPASS + '@159.89.94.171:27017/doodle_chat?authSource=doodle_chat', function( err ) {
  if ( err ) {
    throw err
  }

  console.timeEnd( 'feff' )
} )
