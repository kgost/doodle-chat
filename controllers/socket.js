exports = module.exports = function( io ) {
	//Connects the user to the socket
	io.on( 'connection', ( socket ) => {
		//Log message to confirm connected user
		console.log( 'user connected' );

		socket.on('login', (username) => {
			socket.join(username);
		});

		socket.on( 'listen conversation', (conversationId) => {
			socket.join( 'listen-' + conversationId );
		} );

		socket.on( 'unlisten conversation', (conversationId) => {
			socket.leave( 'listen-' + conversationId );
		} );

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

		//Destroys socket tied to a specific conversation
		socket.on( 'conversation-change', ( conversationId ) => {
			io.sockets.in( 'listen-' + conversationId  ).emit( 'refresh-conversations');
		});

		//Destroys socket tied to a specific conversation
		socket.on( 'conversation-add', ( username ) => {
			io.sockets.in( username  ).emit( 'refresh-conversations' );
		});

		//Logs users disconnecting from any socket
		socket.on( 'disconnect', () => {
			console.log( 'user disconnected' );
		} )

	} );
}
