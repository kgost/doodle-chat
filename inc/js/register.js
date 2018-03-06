$( document ).ready( function() {
	$( '#submit' ).on( 'click', function( e ) {
		e.preventDefault();

		if ( !validPassword( $( '#username' ).val() ) ) {
			return;
		}

		if ( $( '#password' ).val() != $( '#confirm-password' ).val() || !validPassword( $( '#password' ).val() ) ) {
			return;
		}

		var user = { username: $( '#username' ).val(), password: $( '#password' ).val() };

		$.ajax({
			url: '/auth',  //TODO: change to conersation id
			method: 'post',
			data: user
		}).done(function(data) {
			localStorage.setItem( 'token', data.userId );
			localStorage.setItem( 'userId', data.token );
			console.log( data );
		} ).fail( function( fqXHR, textStatus ) {
			console.log( 'failure' );
		} );
	} );


	function validUsername( username ) {
		return true;
	}

	function validPassword( password ) {
		return true;
	}
} );