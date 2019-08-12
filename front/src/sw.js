self.addEventListener( 'push', ( event ) => {
  self.clients.matchAll({
    type: 'window',
  }).then( ( clientList ) => {
    for ( const client of clientList ) {
      if ( client.focused ) {
        return;
      }

      const { message, url } = JSON.parse( event.data.text() );

      self.registration.getNotifications().then( ( notifications ) => {
        let show = true;

        for ( const notification of notifications ) {
          if ( url == notification.data.url ) {
            show = false;
          }
        }

        if ( show ) {
          const promise = self.registration.showNotification( message, {
            data: { url },
          } );
        }
      } );

      return;
    }
  } );
} );

self.onnotificationclick = ( event ) => {
  if ( self.clients.openWindow ) {
    event.waitUntil( self.clients.matchAll({
      type: 'window',
    }).then( ( clientList ) => {
      for ( const client of clientList ) {
        if ( client.navigate ) {
          client.focus();
          return client.postMessage({
            url: event.notification.data.url,
            type: 'PUSH',
          } );
        }
      }

      if ( self.clients.openWindow ) {
        return clients.openWindow( event.notification.data.url );
      }
    } ) );
  }
}
