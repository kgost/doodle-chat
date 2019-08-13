self.addEventListener( 'activate', ( event ) => {
  event.waitUntil( self.clients.claim() );
} );

self.addEventListener( 'push', ( event ) => {

  const business = new Promise( ( resolve, reject ) => {
    self.clients.matchAll({
      type: 'window',
    }).then( ( clientList ) => {
      for ( const client of clientList ) {
        if ( client.focused ) {
          resolve();
        }

        const { message, url } = JSON.parse( event.data.text() );

        self.registration.getNotifications().then( ( notifications ) => {
          for ( const notification of notifications ) {
            if ( notification.data && url == notification.data.url ) {
              notification.close();
            }
          }

          self.registration.showNotification( message, {
            data: { url },
          } ).finally( () => {
            resolve();
          } );
        } ).catch( reject );
      }
    } ).catch( reject );
  } );

  event.waitUntil( business );
} );

self.onnotificationclick = ( event ) => {
  const business = new Promise( ( resolve, reject ) => {
    if ( self.clients.openWindow ) {
      event.waitUntil( self.clients.matchAll({
        type: 'window',
      }).then( ( clientList ) => {
        let done = false;

        for ( const client of clientList ) {
          if ( client.navigate ) {
            client.focus();
            client.postMessage({
              url: event.notification.data.url,
              type: 'PUSH',
            } );

            done = true;
          }
        }

        if ( !done && self.clients.openWindow ) {
          clients.openWindow( event.notification.data.url );
        }

        self.registration.getNotifications().then( ( notifications ) => {
          for ( const notification of notifications ) {
            notification.close();
          }

          resolve();
        } )
        .catch( reject );
      } ).catch( reject ) );
    }
  } );

  event.waitUntil( business );
}
