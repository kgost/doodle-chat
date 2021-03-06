$( document ).ready( function() {
	$( '#submit' ).on( 'click', function( e ) {
		e.preventDefault();

		if ( !validUsername( $( '#username' ).val() ) ) {
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
			localStorage.setItem('username', data.username);
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
