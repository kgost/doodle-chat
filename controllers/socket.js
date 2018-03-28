exports = module.exports = function( io ) {
	//Connects the user to the socket
	io.on( 'connection', ( socket ) => {
		//Log message to confirm connected user
		console.log( 'user connected' );
		
		//On user joining coversation connects them to the socket for that conversation
		socket.on( 'enter conversation', ( conversationId ) => {
			socket.join( conversationId );
		} );

		//Leaves socket for specific conversation when user leaves
		socket.on( 'leave conversation', ( conversationId ) => {
			socket.leave( conversationId );
		} );

		//Refreshes current socket when new messages are sent so new message can be loaded
		socket.on( 'new-message', ( conversationId ) => {
			io.sockets.in( conversationId  ).emit( 'refresh', conversationId );
		} );

		//Logs users disconnecting from any socket
		socket.on( 'disconnect', () => {
			console.log( 'user disconnected' );
		} )
		
		//Destroys socket tied to a specific conversation
		socket.on( 'destroy', ( conversationId ) => {
		});
	} );
}
