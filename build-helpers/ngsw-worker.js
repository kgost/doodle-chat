            this.scope.addEventListener('notificationclick', (event) => {
              //console.log('[Service Worker] Notification click Received. event', event);
              event.notification.close();
              //event.waitUntil(clients.openWindow(event.notification.data.url));
              if (clients.openWindow) {
                // This looks to see if the current is already open and
                // focuses if it is
                event.waitUntil(clients.matchAll({
                  type: "window"
                }).then(function(clientList) {
                  for (var i = 0; i < clientList.length; i++) {
                    var client = clientList[i];
                    if ( client.navigate ) {
                      client.focus();
                      return client.navigate( '/messenger' + event.notification.data.url );
                    }
                  }

                  if (clients.openWindow)
                    return clients.openWindow( '/messenger' + event.notification.data.url );
                }));
              }
            });
