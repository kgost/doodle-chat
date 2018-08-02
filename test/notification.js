const webpush = require('web-push')
const mongoose = require( 'mongoose' )
const User = require( '../models/user' )

const vapidKeys = {
  'publicKey':'BIvF-GchsDONxK_P9zHU23Iv7uT8Ng3Lz62zfpOkvf8leyqjHItqp7hDQXV3i6Dh-7PaznxNg-dxFOz7gg3GmaQ',
  'privateKey':'tAfWc6F8aN3EuS3mkj51OlFQQPzonQIA3YiGDdcgWM8'
}

webpush.setVapidDetails(
  'mailto:example@yourdomain.org',
  vapidKeys.publicKey,
  vapidKeys.privateKey
)


mongoose.connect( 'mongodb://doodle:' + process.env.MNPASS + '@ci.mtuopensource.club:27017/doodle_chat?authSource=doodle_chat', function( err ) {
//mongoose.connect( 'mongodb://localhost:27017/doodle_chat', function( err ) {
  if ( err ) {
    throw err
  }

  User.find( { pushSub: { '$exists': true, '$ne': null } }, ( err, users ) => {
    if ( err ) {
      console.log( err )
      process.exit()
    }

    console.log('Total Users', users.length)

    const notificationPayload = {
      'notification': {
        'title': 'Angular News',
        'body': 'Newsletter Available!',
        'icon': '../src/assets/icons/icon-128x128.png',
        'vibrate': [100, 50, 100],
        'data': {
          'dateOfArrival': Date.now(),
          'primaryKey': 1
        },
        'actions': [{
          'action': 'explore',
          'title': 'Go to the site'
        }]
      }
    }

    Promise.all(users.map(user => webpush.sendNotification(
      user.pushSub, JSON.stringify(notificationPayload) )))
      .then(() => console.log( 'notification sent' ))
      .catch(err => {
        console.error('Error sending notification, reason: ', err)
      })
  } )
} )
