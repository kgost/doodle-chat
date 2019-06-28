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
      socket.join( 'listen-conversation-' + conversationId )
    } )

    socket.on( 'listen-friendship', ( friendshipId ) => {
      socket.join( 'listen-friendship-' + friendshipId )
    } )

    socket.on( 'unlisten-conversation', ( conversationId ) => {
      socket.leave( 'listen-conversation-' + conversationId )
    } )

    socket.on( 'unlisten-friendship', ( friendshipId ) => {
      socket.leave( 'listen-friendship-' + friendshipId )
    } )

    //On user joining coversation connects them to the socket for that conversation
    socket.on( 'join-conversation', ( conversationId ) => {
      socket.join( `conversation-${ conversationId }` )
    } )

    socket.on( 'join-friendship', ( friendshipId ) => {
      socket.join( `friendship-${ friendshipId }` )
    } )

    //Leaves socket for specific conversation when user leaves
    socket.on( 'leave-conversation', ( conversationId ) => {
      socket.leave( `conversation-${ conversationId }` )
    } )

    socket.on( 'leave-friendship', ( friendshipId ) => {
      socket.leave( `friendship-${ friendshipId }` )
    } )

    //Refreshes current socket when new messages are sent so new message can be loaded
    socket.on( 'new-conversation-message', ( data ) => {
      io.sockets.in( `conversation-${ data.id }` ).emit( 'add-conversation-message', data )
      io.sockets.in( 'listen-conversation-' + data.id ).emit( 'notify-conversation', data.id )
    } )

    socket.on( 'change-conversation-message', ( data ) => {
      io.sockets.in( `conversation-${ data.id }` ).emit( 'update-conversation-message', data )
      //io.sockets.in( 'listen-' + data.conversationId ).emit( 'notify-conversation', data.conversationId )
    } )

    socket.on( 'new-friendship-message', ( data ) => {
      io.sockets.in( `friendship-${ data.id }` ).emit( 'add-friendship-message', data )
      io.sockets.in( 'listen-friendship-' + data.id ).emit( 'notify-friendship', data.id )
    } )

    socket.on( 'change-friendship-message', ( data ) => {
      io.sockets.in( `friendship-${ data.id }` ).emit( 'update-friendship-message', data )
      //io.sockets.in( 'listen-' + data.friendshipId ).emit( 'notify-friendship', data.friendshipId )
    } )

    //Destroys socket tied to a specific conversation
    socket.on( 'update-conversation', ( conversationId ) => {
      io.sockets.in( 'listen-conversation-' + conversationId  ).emit( 'refresh-conversations' )
    })

    socket.on( 'update-friendship', ( friendshipId ) => {
      io.sockets.in( 'listen-friendship-' + friendshipId  ).emit( 'refresh-friendships' )
    })

    //Destroys socket tied to a specific conversation
    socket.on( 'add-conversation', ( userId ) => {
      io.sockets.in( userId  ).emit( 'refresh-conversations' )
    })

    socket.on( 'add-friendship', ( userId ) => {
      io.sockets.in( userId  ).emit( 'refresh-friendships' )
    })

    socket.on( 'conversation-typing', ( data ) => {
      io.sockets.in( `conversation-${ data.id }` ).emit( 'user-typing', data.username )
    } )

    socket.on( 'friendship-typing', ( data ) => {
      io.sockets.in( `friendship-${ data.id }` ).emit( 'user-typing', data.username )
    } )

    //Logs users disconnecting from any socket
    socket.on( 'disconnect', () => {
      console.log( 'user disconnected' )
    } )

  } )
}
