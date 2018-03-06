$( document ).ready( function() {
	if ( isLoggedIn() ) {
		$( '#logout' ).css( 'display', 'block' );
	}

	$( '#logout' ).on( 'click', function( e ) {
		e.preventDefault();

		if ( isLoggedIn() ) {
			localStorage.removeItem( 'token' );
			localStorage.removeItem( 'userId' );
			document.location.href = '/';
		}
	} );

	function isLoggedIn() {
		if ( localStorage.getItem( 'token' ) ) {
			return true;
		}

		return false;
	}
} );