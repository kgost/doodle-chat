$( document ).ready( function() {
	$( '#submit' ).on( 'click', function( e ) {
		e.preventDefault();

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
	
	$( '#username' ).on( 'keypress', function ( e ) {
		$(this).val();
	});
} );
