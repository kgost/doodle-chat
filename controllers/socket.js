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
    socket.on( 'new-message', ( conversationId ) => {
      io.sockets.in( conversationId  ).emit( 'refresh-messages', conversationId )
    } )

    socket.on( 'new-private-message', ( friendshipId ) => {
      io.sockets.in( friendshipId  ).emit( 'refresh-private-messages', friendshipId )
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

    //Logs users disconnecting from any socket
    socket.on( 'disconnect', () => {
      console.log( 'user disconnected' )
    } )

  } )
}
