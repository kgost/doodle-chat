$( document ).ready( function() {
	console.log( 'ready' );

	$( '#submit' ).on( 'click', function( e ) {
		e.preventDefault();

		if ( !validPassword( $( '#username' ).val() ) ) {
			return;
		}

		if ( !validPassword( $( '#password' ).val() ) ) {
			return;
		}

		var user = { username: $( '#username' ).val(), password: $( '#password' ).val() };

		$.ajax({
			url: '/auth/login',  //TODO: change to conersation id
			method: 'post',
			data: user
		}).done(function(data) {
			localStorage.setItem( 'token', data.token );
			localStorage.setItem( 'userId', data.userId );
			console.log( data );
		} ).fail( function( fqXHR, textStatus ) {
			console.log( 'failure' );
		} );
	} );
} );