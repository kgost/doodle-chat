$(document).ready( function() {
	var socket = io(),
			conversationId;
	if ( localStorage.getItem( 'token' ) ) {
		$.ajax({
			url: '/api/conversations?token=' + localStorage.getItem( 'token' ), //TODO: change to conersation id
			method: 'get'
		}).done(function(data) {
			console.log( data );
			for (var i = 0; i < data.obj.length; i++) {
				$("#conversation-list").append('<div id="' + data.obj[i]._id + '" class="card"> <div class="card-body conversation">' + data.obj[i].name + '</div> <button type="button" class="close closeConversation" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>');
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
	
	$('body').on('click', '.conversation', function(e) {
		var id = $(this).parent().attr('id');

		$.ajax({
			url: '/api/messages/' + id + '?token=' + localStorage.getItem( 'token' ), //TODO: change to conersation id
			method: 'get'
		}).done(function(data) {
			if (data.message == 'Reply Successful') {
				if ( conversationId ) {
					socket.emit( 'leave conversation', conversationId );
				}

				conversationId = id;
				socket.emit('enter conversation', conversationId);

				$( "#message-container" ).empty();

				for (var i = 0; i < data.obj.length; i++) {
					$("#message-container").append('<div id="' + data.obj[i]._id + '" class="card"> <div class="card-body conversation">' + data.obj[i].text + '</div> </div>');
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
	
	$('body').on('click', '.closeConversation', function(e) {
		$.ajax({
			url: '/api/conversation/' + $(this).parent().attr('id') + '?token=' + localStorage.getItem( 'token' ), //TODO: change to conersation id
			method: 'delete'
		}).done(function(data) {
			console.log( data );
			if (data.message == 'Conversation deleted') {
				flashError( data.message );
			}

			socket.emit( 'destroy', $(this).parent().attr('id') );
		}).fail( function( fqXHR, textStatus ) {
			if ( fqXHR.status == 401 ) {
				socket.disconnect();
				document.location.href='/login?e=401';
			} else {
				flashError( fqXHR.responseJSON.error.message );
			}
		} );
	});

	$( '#submit-conversation' ).on( 'click', function( e ) {
		console.log( 'jeff' );
		if ( !localStorage.getItem( 'token' ) ) return;

		var name = $( '#new-conversation-name' ).val(),
				users = $( '#new-conversation-users' ).val().split( ',' );

		$.ajax({
			url: '/api/conversation' + '?token=' + localStorage.getItem( 'token' ),  //TODO: change to conersation id
			method: 'post',
			data: { name: name, owner: localStorage.getItem( 'userId' ), participants: users }
		}).done(function(data) {
			flashError( 'Conversation Created' );
		} ).fail( function( fqXHR, textStatus ) {
			flashError( fqXHR.responseJSON.error.message );
		} ).always(function() {
			$('#text-entry-box').val('');
		});
	} );

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
			url: '/api/messages/' + conversationId + '?token=' + localStorage.getItem( 'token' ), //TODO: change to conersation id
			method: 'get'
		}).done(function(data) {
			if (data.message == 'Reply Successful') {
				$('#message-container').empty();
				for (var i = 0; i < data.obj.length; i++) {
					$("#message-container").append('<div id="' + data.obj[i]._id + '" class="card"> <div class="card-body conversation">' + data.obj[i].text + '</div> </div>');
				}
			}
		}).fail( function( fqXHR, textStatus ) {
			flashError( fqXHR.responseJSON.error.message );
		} );
	});

	socket.on( 'destroy', function() {
		$('#message-container').empty();
		socket.emit( 'leave conversation', conversationId );
		delete conversationId;
	} );
});
