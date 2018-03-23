exports = module.exports = function( io ) {
	io.on( 'connection', ( socket ) => {
		console.log( 'user connected' );

		socket.on( 'enter conversation', ( conversationId ) => {
			socket.join( conversationId );
		} );

		socket.on( 'leave conversation', ( conversationId ) => {
			socket.leave( conversationId );
		} );

		socket.on( 'new-message', ( conversationId ) => {
			io.sockets.in( conversationId  ).emit( 'refresh', conversationId );
		} );

		socket.on( 'disconnect', () => {
			console.log( 'user disconnected' );
		} )
		
		socket.on( 'destroy', ( conversationId ) => {
			io.sockets.clients( conversationId ).forEach(function(s) {
				s.leave( conversationId );
			});
		});
	} );
}