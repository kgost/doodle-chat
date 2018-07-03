exports = module.exports = function( io ) {
  //Connects the user to the socket
  io.on( 'connection', ( socket ) => {
    //Log message to confirm connected user
    console.log( 'user connected' )

    socket.on('signin', ( userId ) => {
      socket.join( userId )
    })

    socket.on('signout', ( userId ) => {
      socket.leave( userId )
    })

    socket.on( 'leave-all', ()=> {
      Object.values( socket.rooms ).forEach( ( room ) => {
        socket.leave( room )
      } )
    } )

    socket.on( 'listen-conversation', ( conversationId ) => {
      socket.join( 'listen-' + conversationId )
    } )

    socket.on( 'listen-friendship', ( friendshipId ) => {
      socket.join( 'listen-' + friendshipId )
    } )

    socket.on( 'unlisten-conversation', ( conversationId ) => {
      socket.leave( 'listen-' + conversationId )
    } )

    socket.on( 'unlisten-friendship', ( friendshipId ) => {
      socket.leave( 'listen-' + friendshipId )
    } )

    //On user joining coversation connects them to the socket for that conversation
    socket.on( 'join-conversation', ( conversationId ) => {
      socket.join( conversationId )
    } )

    socket.on( 'join-friendship', ( friendshipId ) => {
      socket.join( friendshipId )
    } )

    //Leaves socket for specific conversation when user leaves
    socket.on( 'leave-conversation', ( conversationId ) => {
      socket.leave( conversationId )
    } )

    socket.on( 'leave-friendship', ( friendshipId ) => {
      socket.leave( friendshipId )
    } )

    //Refreshes current socket when new messages are sent so new message can be loaded
    socket.on( 'new-message', ( data ) => {
      io.sockets.in( data.conversationId  ).emit( 'add-message', data.messageId )
      io.sockets.in( 'listen-' + data.conversationId ).emit( 'notify-conversation', data.conversationId )
    } )

    socket.on( 'change-message', ( data ) => {
      io.sockets.in( data.conversationId  ).emit( 'update-message', data.messageId )
      //io.sockets.in( 'listen-' + data.conversationId ).emit( 'notify-conversation', data.conversationId )
    } )

    socket.on( 'new-private-message', ( data ) => {
      io.sockets.in( data.friendshipId ).emit( 'add-private-message', data.messageId )
      io.sockets.in( 'listen-' + data.friendshipId ).emit( 'notify-friendship', data.friendshipId )
    } )

    socket.on( 'change-private-message', ( data ) => {
      io.sockets.in( data.friendshipId ).emit( 'update-private-message', data.messageId )
      //io.sockets.in( 'listen-' + data.friendshipId ).emit( 'notify-friendship', data.friendshipId )
    } )

    //Destroys socket tied to a specific conversation
    socket.on( 'update-conversation', ( conversationId ) => {
      io.sockets.in( 'listen-' + conversationId  ).emit( 'refresh-conversations')
    })

    socket.on( 'update-friendship', ( friendshipId ) => {
      io.sockets.in( 'listen-' + friendshipId  ).emit( 'refresh-friendships')
    })

    //Destroys socket tied to a specific conversation
    socket.on( 'add-conversation', ( userId ) => {
      io.sockets.in( userId  ).emit( 'refresh-conversations' )
    })

    socket.on( 'add-friendship', ( userId ) => {
      io.sockets.in( userId  ).emit( 'refresh-friendships' )
    })

    socket.on( 'nonce-user', ( userId, nonce, message ) => {
      io.sockets.in( userId ).emit( 'add-nonce-message', { nonce: nonce, message: message } )
    } )

    //Logs users disconnecting from any socket
    socket.on( 'disconnect', () => {
      console.log( 'user disconnected' )
    } )

  } )
}
