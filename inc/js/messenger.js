/**
 * On Messenger Load:
 * 		Set-up everything within function as private
 */
$(document).ready( function() {
	var socket = io(),
		conversationId;
	//If a token exists: continue, otherwise: return 401
	if ( localStorage.getItem( 'token' ) ) {
		//Validate token
		$.ajax({
			url: '/api/conversations?token=' + localStorage.getItem( 'token' ),
			method: 'get'
		//Create a list of conversations
		}).done(function(data) {
			for (var i = 0; i < data.obj.length; i++) {
				var outputhtml = '';
				outputhtml += '<div id="' + data.obj[i]._id + '" class="card">';
				outputhtml += 	'<div class="card-body conversation">' + data.obj[i].name + '</div> ';

				if(data.obj[i].owner == localStorage.getItem( 'userId' )) {
					outputhtml += 	'<button type="button" class="close closeConversation" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> ';
				}
				outputhtml += 	'<div class="participant-container hidden">';
				for (var j = 0; j < data.obj[i].participants.length; j++) {
					outputhtml += '<div class="card participant">' + data.obj[i].participants[j];
					if(data.obj[i].owner == localStorage.getItem( 'userId' )) {
						outputhtml += '<button type="button" class="close kickUser" aria-label="Close"> <span aria-hidden="true">&times;</span> </button>';
					}
					outputhtml += '</div>';
				}
				outputhtml += 	'<button id="add-user-button" type="button" class="btn btn-primary btn-sml btn-block">Add User</button>';
				outputhtml +=	'</div>';
				outputhtml += '</div>';
				$('#conversation-list').append(outputhtml);
			}
		//On fail: disconnect from the socket and redirect to the login screen
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

	/**
	 * Conversation card Event Listener:
	 * 		When a conversation card is clicked, return and display all of the messages
	 */
	$('body').on('click', '.conversation', function(e) {
		var id = $(this).parent().attr('id');
		$('.participant-container').addClass('hidden');
		$(this).siblings('.participant-container').removeClass('hidden');

		//Validate token
		$.ajax({
			url: '/api/messages/' + id + '?token=' + localStorage.getItem( 'token' ),
			method: 'get'
			//Load new conversation
		}).done(function(data) {
			if (data.message == 'Reply Successful') {
				//Leave current conversation
				if ( conversationId ) {
					socket.emit( 'leave conversation', conversationId );
				}
				//Change to new conversationId and enter new conversation
				conversationId = id;
				socket.emit('enter conversation', conversationId);

				//Empty all messages
				$( "#message-container" ).empty();

				//Load messages from new conversation
				for (var i = 0; i < data.obj.length; i++) {
					$("#message-container").append(	'<div id="' + data.obj[i]._id + '" class="card"> <div class="card-body conversation">' + data.obj[i].text + '</div>'+
													'<i class="fas fa-pencil-alt"></i></div>');
				}
			}
			//On fail, return 401 and redirect to login.
		}).fail( function( fqXHR, textStatus ) {
			if ( fqXHR.status == 401 ) {
				socket.disconnect();
				document.location.href='/login?e=401';
			} else {
				flashError( fqXHR.responseJSON.error.message );
			}
		} );
	});

	/**
	 * Delete Conversation Button Event Listener
	 * 		When the button is clicked, call the delete conversation route.
	 */
	$('body').on('click', '.closeConversation', function(e) {
		//Authenticate and delete
		$.ajax({
			url: '/api/conversation/' + $(this).parent().attr('id') + '?token=' + localStorage.getItem( 'token' ),
			method: 'delete'
			//Show success
		}).done(function(data) {
			if (data.message == 'Conversation deleted') {
				flashError( data.message );
			}
			//Send to all users to remove the conversation from their list
			socket.emit( 'destroy', $(this).parent().attr('id') );
			//Send fail if not deleted
		}).fail( function( fqXHR, textStatus ) {
			if ( fqXHR.status == 401 ) {
			} else {
				flashError( fqXHR.responseJSON.error.message );
			}
		} );
	});

	/**
	 * Submit Conversation Button Event Listener
	 * 		When the submit button is clicked, call the create conversation route
	 */
	$( '#submit-conversation' ).on( 'click', function( e ) {
		if ( !localStorage.getItem( 'token' ) ) return;

		//Give conversation correct attributes
		var name = $( '#new-conversation-name' ).val(),
			users = $( '#new-conversation-users' ).val().split( ',' );

		//Send information to create route
		$.ajax({
			url: '/api/conversation' + '?token=' + localStorage.getItem( 'token' ),
			method: 'post',
			data: { name: name, owner: localStorage.getItem( 'userId' ), participants: users }
			//Send success
		}).done(function(data) {
			flashSuccess( 'Conversation Created' );
			//Send failure
		} ).fail( function( fqXHR, textStatus ) {
			flashError( fqXHR.responseJSON.error.message );
		} ).always(function() {
			$('#text-entry-box').val('');
		});

		/**
		 * Empty the conversation list and reload it when conversation is created
		 */
		$("#conversation-list").empty();
		$.ajax({
			url: '/api/conversations?token=' + localStorage.getItem( 'token' ),
			method: 'get'
		}).done(function(data) {
			//Add a new card for each conversation
			for (var i = 0; i < data.obj.length; i++) {
				//Conversation card HTML
				var div = '<div id="' + data.obj[i]._id + '" class="card"> <div class="card-body conversation">' + data.obj[i].name
						+ '</div> <button type="button" class="close closeConversation" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div>';
				$("#conversation-list").append(div);
			}
		}).fail( function( fqXHR, textStatus ) {
			if ( fqXHR.status == 401 ) {
				socket.disconnect();
				document.location.href='/login?e=401';
			} else {
				flashError( fqXHR.responseJSON.error.message );
			}
		} );
	} );

	/**
	 * Send Message Button Event Listener
	 * 		When Send button is clicked and text is in the text box, create a new message
	 */
	$('#send-button').on('click', function(e) {
		e.preventDefault();
		if ( localStorage.getItem( 'token' ) ) {
			if ( conversationId ) {
				//Send text to create message route
				$.ajax({
					url: '/api/messages/' + conversationId + '?token=' + localStorage.getItem( 'token' ),
					method: 'post',
					data: { text: $('#text-entry-box').val() }
					//Force users in conversation to update the covnersation
				}).done(function(data) {
					if (data.message == 'Reply Successful')
						socket.emit('new-message', conversationId);
					//Send fail
				} ).fail( function( fqXHR, textStatus ) {
					flashError( fqXHR.responseJSON.error.message );
				} ).always(function() {
					$('#text-entry-box').val('');
				});
			} else {
				flashError( 'You Must Select A Conversation' );
			}
		//Auth error
		} else {
			flashError( 'You Must Be Logged In' );
		}
	});

	$( '#open-canvas' ).on( 'click', function( e ) {
		e.preventDefault();

		clearCanvas();

		$( '.doodle-canvas-container' ).removeClass( 'hidden' );
	} );

	$( '#exit-canvas' ).on( 'click', function( e ) {
		e.preventDefault();

		$( '.doodle-canvas-container' ).addClass( 'hidden' );
	} );

	$( '#submit-canvas' ).on( 'click', function( e ) {
		e.preventDefault();

		// TODO: Convert Canvas to base64 image
		// TODO: Send image to server via ajax call
	} );

	/**
	 * Socket listener to refresh conversation
	 */
	socket.on('refresh', function(message) {
		//Call get messages route
		$.ajax({
			url: '/api/messages/' + conversationId + '?token=' + localStorage.getItem( 'token' ),
			method: 'get'
			//Send success
		}).done(function(data) {
			if (data.message == 'Reply Successful') {
				$('#message-container').empty();
				//Load messages
				for (var i = 0; i < data.obj.length; i++) {
					$("#message-container").append('<div id="' + data.obj[i]._id + '" class="card"> <div class="card-body conversation">' + data.obj[i].text + '</div> </div>');
				}
			}
			//Send failure
		}).fail( function( fqXHR, textStatus ) {
			flashError( fqXHR.responseJSON.error.message );
		} );
	});

	/**
	 * Socket listener to leave conversation and remove from list
	 */
	socket.on( 'destroy', function() {
		$('#message-container').empty();
		socket.emit( 'leave conversation', conversationId );
		delete conversationId;
	} );

	// TODO: Remove last drawing from canvas
	function clearCanvas() {
	}
});
