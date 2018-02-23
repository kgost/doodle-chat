exports = module.exports = function( io ) {
	io.on( 'connection', ( socket ) => {
		console.log( 'user connected' );
		socket.join( 'test-conversation' );

		socket.on( 'enter conversation', ( conversation ) => {
			socket.join( conversation );
		} );

		socket.on( 'leave conversation', ( conversation ) => {
			socket.leave( conversation );
		} );

		socket.on( 'new-message', ( conversation ) => {
			io.sockets.in( 'test-conversation' ).emit( 'refresh messages', 'test-conversation' );
		} );

		socket.on( 'disconnect', () => {
			console.log( 'user disconnected' );
		} )
	} );
}