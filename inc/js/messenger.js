$(document).ready( function() {
	$.ajax({
		url: '/api/test-conversation', //TODO: change to conersation id
		method: 'get'
	}).done(function(data) {
		if (data.message == 'Reply Successful') {
			$('#message-container').empty();
			for (var i = 0; i < data.obj.length; i++) {
				$("#message-container").append('<div class="card"> <div class="card-body">' + data.obj[i].text + '</div> </div>');
			}
		}
	});

	var socket = io();
	$('#send-button').on('click', function(e) {
		e.preventDefault();
		if ( localStorage.getItem( 'token' ) ) {
			//test-conversation will be replaced with conversation id.
			$.ajax({
				url: '/api/test-conversation?token=' + localStorage.getItem( 'token' ),  //TODO: change to conersation id
				method: 'post',
				data: { text: $('#text-entry-box').val() }
			}).done(function(data) {
				if (data.message == 'Reply Successful')
					socket.emit('new-message', 'test-conversation') //TODO: change to conersation id
			} ).fail( function( fqXHR, textStatus ) {
				flashError( fqXHR.responseJSON.error.message );
			} ).always(function() {
				$('#text-entry-box').val('');
			});
		} else {
			flashError( 'You Must Be Logged In' );
		}
	});

//test-conversation will be replaced with conversation id.
	socket.on('refresh', function(message) {
		$.ajax({
			url: '/api/test-conversation', //TODO: change to conersation id
			method: 'get'
		}).done(function(data) {
			if (data.message == 'Reply Successful') {
				$('#message-container').empty();
				for (var i = 0; i < data.obj.length; i++) {
					$("#message-container").append('<div class="card"> <div class="card-body">' + data.obj[i].text + '</div> </div>');
				}
			}
		}).fail( function( fqXHR, textStatus ) {
			flashError( fqXHR.responseJSON.error.message );
		} );
	});
});
