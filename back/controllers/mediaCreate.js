const mongoose = require( 'mongoose' ),
  Media        = require( '../models/media' )

process.on( 'message', ( mediaObj ) => {
  mongoose.connect( 'mongodb://doodle:' + process.env.MNPASS + '@ci.mtuopensource.club:27017/doodle_chat?authSource=doodle_chat', function( err ) {
    if ( err ) {
      process.send( { err: err, id: null } )
    }

    Media.create( { data: new Buffer( mediaObj.data ), mime: mediaObj.mime }, ( err, media ) => {
      if ( err ) {
        process.send( { err: err, id: null } )
        return
      }

      process.send( { err: null, id: media._id } )
    } )
  } )
} )
