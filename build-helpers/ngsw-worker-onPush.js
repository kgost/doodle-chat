            msg.waitUntil( this.scope.registration.getNotifications().then( ( notifications ) => {
              var data = msg.data.json();

              notifications.forEach( ( notification ) => {
                if ( notification.data.url === data.notification.data.url ) {
                  data.notification.data.count += notification.data.count;
                  notification.close();
                }
              } );

              if ( data.notification.data.count > 1 ) {
                data.notification.body = `${ data.notification.data.count } New Secure Messages From ${ data.notification.data.name }`;
              }

              msg.waitUntil(this.handlePush(data));
            } ) );
