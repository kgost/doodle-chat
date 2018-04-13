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
			localStorage.setItem('username', data.username);
			document.location.href="/messenger";
		} ).fail( function( fqXHR, textStatus ) {
			flashError( fqXHR.responseJSON.error.message );
		} );
	} );

	$( '#username' ).on( 'keyup', function ( e ) {
		var uName = $(this).val();
		if (uName.length > 0) {
			$.ajax({
				url: '/api/userUniqueness/' + uName,
				method: 'get'
			}).done(function(data) {
				if (data.obj) {
					username = true;
					$( '#bad-username').addClass("hidden");
				}
				else { //flash error
					username = false;
					$( '#bad-username').removeClass("hidden");
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
		}
		else {
			username = false;
			checkAll();
		}
	});

	$( '#password' ).on( 'keyup', function ( e ) {
		var pw = $(this).val();
		var cpw = $( '#confirm-password' ).val();
		if(pw.length >= 6 && pw == cpw) {
			password = true;
			cPassword = true;
			$( '#bad-password-match').addClass("hidden");
			$( '#bad-password-length').addClass("hidden");
		}
		if(pw.length >= 6) {
			$( '#bad-password-length').addClass("hidden");
		}
		else {
			$( '#bad-password-length').removeClass("hidden");
		}
		if(pw == cpw) {
			$( '#bad-password-match').addClass("hidden");
		}
		else {
			$( '#bad-password-match').removeClass("hidden");
		}
		checkAll();
	});

	$( '#confirm-password' ).on( 'keyup', function ( e ) {
		var cpw = $(this).val();
		var pw = $( '#password' ).val();
		if(pw == cpw && pw.length >= 6) {
			cPassword = true;
			password = true;
			$( '#bad-password-match').addClass("hidden");
			$( '#bad-password-length').addClass("hidden");
		}
		if(pw.length >= 6) {
			$( '#bad-password-length').addClass("hidden");
		}
		else {
			$( '#bad-password-length').removeClass("hidden");
		}
		if(pw == cpw) {
			$( '#bad-password-match').addClass("hidden");
		}
		else {
			$( '#bad-password-match').removeClass("hidden");
		}
		checkAll();
	});

	function checkAll() {
		if (username && password && cPassword) {
			$( '#submit' ).removeAttr('disabled');
		}
		else {
			$( '#submit' ).prop('disabled', true);
		}
	}
} );
