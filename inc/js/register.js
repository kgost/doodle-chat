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
			localStorage.setItem( 'token', data.token );
			localStorage.setItem( 'userId', data.userId );
			document.location.href="/messenger";
		} ).fail( function( fqXHR, textStatus ) {
			flashError( fqXHR.responseJSON.error.message );
		} );
	} );


	function validUsername( username ) {
		return true;
	}

	function validPassword( password ) {
		return true;
	}
} );
