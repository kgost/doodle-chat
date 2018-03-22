$(document).ready( function() {
	var socket = io(),
			conversationId;
	if ( localStorage.getItem( 'token' ) ) {
		$.ajax({
			url: '/api/conversation?token=' + localStorage.getItem( 'token' ), //TODO: change to conersation id
			method: 'get'
		}).done(function(data) {
			if (data.message == 'Reply Successful') {
				for (var i = 0; i < data.obj.length; i++) {
					$("#conversation-list").append('<div id="' + data.obj[i]._id + '" class="card conversation"> <div class="card-body">' + data.obj[i].name + '</div> </div>');
				}
			}
		}).fail( function( fqXHR, textStatus ) {
			if ( fqXHR.status == 401 ) {
				socket.disconnect();
				document.location.href='/login?e=401';
			} else {
				flashError( fqXHR.responseJSON.error.message );
			}
		} );
	} else {
		socket.disconnect();
		document.location.href="/login?e=401";
	}
	
	$('.conversation').on('click', function(e) {
		var id = $(this).parent().attr('id');
		$.ajax({
			url: '/api/messages/' + id + '?token=' + localStorage.getItem( 'token' ), //TODO: change to conersation id
			method: 'get'
		}).done(function(data) {
			if (data.message == 'Reply Successful') {
				if ( conversationId ) {
					io.emit( 'leave conversation', conversationId );
				}

				conversationId = id;
				io.emit('enter conversation', conversationId);

				for (var i = 0; i < data.obj.length; i++) {
					$("#message-container").append('<div id="' + data.obj[i]._id + '" class="card"> <div class="card-body conversation">' + data.obj[i].text + '</div> <button type="button" class="close closeConversation" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>');
				}
			}
		}).fail( function( fqXHR, textStatus ) {
			if ( fqXHR.status == 401 ) {
				socket.disconnect();
				document.location.href='/login?e=401';
			} else {
				flashError( fqXHR.responseJSON.error.message );
			}
		} );
	});
	
	$('.closeConversation').on('click', function(e) {
		$.ajax({
			url: '/api/conversation/' + $(this).parent().attr('id') + '?token=' + localStorage.getItem( 'token' ), //TODO: change to conersation id
			method: 'delete'
		}).done(function(data) {
			if (data.message == 'Reply Successful') {
				flashError( data.message );
			}
		}).fail( function( fqXHR, textStatus ) {
			if ( fqXHR.status == 401 ) {
				socket.disconnect();
				document.location.href='/login?e=401';
			} else {
				flashError( fqXHR.responseJSON.error.message );
			}
		} );
	});

	$('#send-button').on('click', function(e) {
		e.preventDefault();
		if ( localStorage.getItem( 'token' ) ) {
			if ( conversationId ) {
				$.ajax({
					url: '/api/messages/' + conversationId + '?token=' + localStorage.getItem( 'token' ),  //TODO: change to conersation id
					method: 'post',
					data: { text: $('#text-entry-box').val() }
				}).done(function(data) {
					if (data.message == 'Reply Successful')
						socket.emit('new-message', conversationId); //TODO: change to conersation id
				} ).fail( function( fqXHR, textStatus ) {
					flashError( fqXHR.responseJSON.error.message );
				} ).always(function() {
					$('#text-entry-box').val('');
				});
			} else {
				flashError( 'You Must Select A Conversation' );
			}
		} else {
			flashError( 'You Must Be Logged In' );
		}
	});

//test-conversation will be replaced with conversation id.
	socket.on('refresh', function(message) {
		$.ajax({
			url: '/api/' + conversationId + '?token=' + localStorage.getItem( 'token' ), //TODO: change to conersation id
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
