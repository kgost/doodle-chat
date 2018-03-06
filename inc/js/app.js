var errorTimeout;

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
} );

function isLoggedIn() {
	if ( localStorage.getItem( 'token' ) ) {
		return true;
	}

	return false;
}

function flashError( text ) {
	var html = '<div class="alert alert-danger alert-dismissible fade show" role="alert">' + text + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>';

	$( '#error-box' ).html( html );
	if ( errorTimeout ) {
		clearTimeout( errorTimeout );
	}

	errorTimeout = setTimeout( function() {
		$( '#error-box' ).empty();

		errorTimeout = null;
	}, 5000 );
}