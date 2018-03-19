$( document ).ready( function() {
	var username = false;
	var password = false;
	var cPassword = false;
	
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
		var uName = $(this).val();
		$.ajax({
			url: '/api/userUniqueness/' + uName,
			method: 'get'
		}).done(function(data) {
			if (data.obj) {
				username = true;
			}
			else {
				username = false; //flash error
			}
			checkAll();
		}).fail( function( fqXHR, textStatus ) {
			if ( fqXHR.status == 401 ) {
				socket.disconnect();
				document.location.href='/login?e=401';
			} else {
				flashError( fqXHR.responseJSON.error.message );
			}
			checkAll();
		});
	});
	
	$( '#password' ).on( 'keypress', function ( e ) {
		var pw = $(this).val();
		var cpw = $( '#confirm-password' ).val();
		if(pw.length >= 6 && pw == cpw) {
			password = true;
		}
		else {
			if(pw != cpw) { //flash not equal message
				password = false;
			}
			else {	//less than 6 chars message
				password = false;
			}
		}
		checkAll();
	});
	
	$( '#confirm-password' ).on( 'keypress', function ( e ) {
		var cpw = $(this).val();
		var pw = $( '#password' ).val();
		if(pw == cpw) {
			cPassword = true;
		}
		else { //flash not equal message
			cPassword = false;
		}
		checkAll();
	});
	
	function checkAll() {
		if (username && password && cPassword) {
			$( '#submit' ).prop('disabled', false);
		}
		else {
			$( '#submit' ).prop('disabled', true);
		}
	}
} );
