var errorTimeout;
var successTimeout;

$( document ).ready( function() {
	if (getUrlVars().e && getUrlVars().e == 401) {
		flashError("You must be logged in.");
	}

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

function flashSuccess( text ) {
	var html = '<div class="alert alert-success alert-dismissible fade show" role="alert">' + text + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>';

	$( '#success-box' ).html( html );
	if ( successTimeout ) {
		clearTimeout( successTimeout );
	}

	successTimeout = setTimeout( function() {
		$( '#success-box' ).empty();

	successTimeout = null;
	}, 5000 );
}

// Read a page's GET URL variables and return them as an associative array.
function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}
