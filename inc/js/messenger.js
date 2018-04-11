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
				outputhtml += 	'<div class="card-body conversation"><h4>' + data.obj[i].name + '</h4></div> ';

				if(data.obj[i].owner == localStorage.getItem( 'userId' )) {
					outputhtml += 	'<button type="button" class="btn btn-danger closeConversation" aria-label="Close"> <span aria-hidden="true">Delete</span> </button> ';
				}
				outputhtml += 	'<div class="participant-container hidden">';
				for (var j = 0; j < data.obj[i].participants.length; j++) {
					outputhtml += '<div class="card participant">' + data.obj[i].participants[j];
					if(data.obj[i].owner == localStorage.getItem( 'userId' )) {
						outputhtml += '<button type="button" class="btn btn-danger btn-sm kickUser" aria-label="Close"> <span aria-hidden="true">Kick</span> </button>';
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

	// CANVAS LOGIC
	var canvas = document.getElementById( 'doodle-canvas' ),
			ctx = canvas.getContext( '2d' ),
			paint = false,
			clickX = [],
			clickY = [],
			clickDrag = [];

	$( '#doodle-canvas' ).mousedown( function( e ){
		var x = ( e.pageX - $(this).offset().left );
		var y = ( e.pageY - $(this).offset().top );

		paint = true;
		addClick( x, y );
		redraw();
	}	);

	$( '#doodle-canvas' ).mousemove( function( e ){
		if ( paint ) {
			var x = ( e.pageX - $(this).offset().left );
			var y = ( e.pageY - $(this).offset().top );

			addClick( x, y, true );
			redraw();
		}
	}	);

	$( '#doodle-canvas' ).mouseup( function( e ){
		paint = false;
	}	);

	$( '#doodle-canvas' ).mouseleave( function( e ){
		paint = false;
	}	);

	function addClick( x, y, dragging ) {
		clickX.push( x );
		clickY.push( y );
		clickDrag.push( dragging );
	}

	function redraw(){
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clears the canvas

		ctx.strokeStyle = "#df4b26";
		ctx.lineJoin = "round";
		ctx.lineWidth = 1;

		for(var i=0; i < clickX.length; i++) {
			ctx.beginPath();
			if(clickDrag[i] && i){
				ctx.moveTo(clickX[i-1], clickY[i-1]);
			 }else{
				 ctx.moveTo(clickX[i]-1, clickY[i]);
			 }
			 ctx.lineTo(clickX[i], clickY[i]);
			 ctx.closePath();
			 ctx.stroke();
		}
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
					var showx = '';
						showx += '<div id="' + data.obj[i]._id + '" class="card">';
						showx += '<div class="card-body message">' + data.obj[i].text + '</div>';
					if (data.obj[i].image){
						console.log(data.obj[i].image);
						showx+= '<img src="'+ data.obj[i].image.img +'">';
					}
					if ( data.obj[i].user == localStorage.getItem('userId')) {
						showx += 	'<i class="fas fa-pencil-alt edit-message edit-button"></i>';
						showx +=	'<button type="button" class="close delete-message" aria-label="Close"> <span aria-hidden="true">&times;</span></button>';
					}
					showx += '</div>';
					$("#message-container").append(showx);
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
				var outputhtml = '';
				outputhtml += '<div id="' + data.obj[i]._id + '" class="card">';
				outputhtml += 	'<div class="card-body conversation"><h4>' + data.obj[i].name + '</h4></div> ';

				if(data.obj[i].owner == localStorage.getItem( 'userId' )) {
					outputhtml += 	'<button type="button" class="btn btn-danger closeConversation" aria-label="Close">Delete</button> ';
				}
				outputhtml += 	'<div class="participant-container hidden">';
				for (var j = 0; j < data.obj[i].participants.length; j++) {
					outputhtml += '<div class="card participant"><span class="participant-name">' + data.obj[i].participants[j] + '</span>';
					if(data.obj[i].owner == localStorage.getItem( 'userId' )) {
						outputhtml += '<button type="button" class="btn btn-danger btn-sm kickUser" aria-label="Close">Kick</button>';
					}
					outputhtml += '</div>';
				}
				outputhtml += 	'<button id="add-user-button" type="button" class="btn btn-primary btn-sml btn-block">Add User</button>';
				outputhtml +=	'</div>';
				outputhtml += '</div>';
				$('#conversation-list').append(outputhtml);
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

	/**
	 * Edit Message Click Listener
	 */
	$('body').on('click', '.edit-message', function(e) {
		$('.edit-container').remove();
		$('.message').removeClass('hidden');
		$('#edit-message').removeClass('hidden');
		var text = $(this).siblings('.message').text();
		$(this).siblings('.message').addClass('hidden');
		$(this).addClass('hidden');
		var html = '';
		html += '<div class="mx-auto edit-container" style="width: 200px;">';
		//html += '	<form>';
		html +=			'<textarea id="edit-message-box" placeholder="Enter Your Message Here...">' + text +'</textarea>';
		html +=			'<button id="change-message-button" class="btn btn-primary btn-lg">Update</button>';
		//html +=	'</form>';
		html +=	'</div>';
		$(this).parent().append(html);
	});

	/**
	 * Delete Message Click Listener
	 */
	$('body').on('click', '.delete-message', function(e) {
		$.ajax({
			url: '/api/messages/' + $(this).parent().attr('id') + '?token=' + localStorage.getItem( 'token' ),
			method: 'delete',
			//Force users in conversation to update the covnersation
		}).done(function(data) {
			socket.emit('new-message', conversationId);
			//Send fail
		} ).fail( function( fqXHR, textStatus ) {
			flashError( fqXHR.responseJSON.error.message );
		} );
	});

	/**
	 * Change Message Click Listener
	 */
	$('body').on('click', '#change-message-button', function(e) {
		 e.preventDefault();
		 var id = $(this).parent().parent().attr('id');
		if ( localStorage.getItem( 'token' ) ) {
			if ( conversationId ) {
				//Send text to update message route
				$.ajax({
					url: '/api/messages/' + id + '?token=' + localStorage.getItem( 'token' ),
					method: 'put',
					data: { text: $('#edit-message-box').val() }
					//Force users in conversation to update the covnersation
				}).done(function(data) {
					if (data.message == 'Reply Successful')
						socket.emit('new-message', conversationId);
					//Send fail
				} ).fail( function( fqXHR, textStatus ) {
					flashError(fqXHR.responseJSON.error.message );
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

		clickX = [];
		clickY = [];
		clickDrag = [];
		redraw();

		$( '.doodle-canvas-container' ).addClass( 'hidden' );
	} );

	$( '#submit-canvas' ).on( 'click', function( e ) {
		e.preventDefault();

		// TODO: Convert Canvas to base64 image
		var pngUrl = $( '#doodle-canvas' )[0].toDataURL();
		// TODO: Send image to server via ajax call
		$.ajax({
			url: '/api/messages/' + conversationId + '?token=' + localStorage.getItem( 'token' ),
			method: 'post',
			data: { text: '', image: pngUrl }
		}).done( function( data ) {
			if (data.message == 'Reply Successful') {
				socket.emit('new-message', conversationId);

				clickX = [];
				clickY = [];
				clickDrag = [];
				redraw();

				$( '.doodle-canvas-container' ).addClass( 'hidden' );
			}
		} ).fail( function( fqXHR, textStatus ) {
			flashError( fqXHR.responseJSON.error.message );
		} ).always( function() {
		} );
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
					var showx = '';
						showx += '<div id="' + data.obj[i]._id + '" class="card">';
						showx += '<div class="card-body message">' + data.obj[i].text + '</div>';
					if (data.obj[i].image){
						showx+= '<img src="'+ data.obj[i].image.img +'">';
					}
					if ( data.obj[i].user == localStorage.getItem('userId')) {
						showx += 	'<i class="fas fa-pencil-alt edit-button"></i>';
						showx +=	'<button type="button" class="close delete-message" aria-label="Close"> <span aria-hidden="true">&times;</span></button>';
					}
					showx += '</div>';
					$("#message-container").append(showx);
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

	function loadConversations() {
		for (var i = 0; i < data.obj.length; i++) {
		   var outputhtml = '';
		   outputhtml += '<div id="' + data.obj[i]._id + '" class="card">';
		   outputhtml += 	'<div class="card-body conversation">' + data.obj[i].name + '</div> ';

		   if(data.obj[i].owner == localStorage.getItem( 'userId' )) {
			   outputhtml += 	'<button type="button" class="btn btn-danger closeConversation" aria-label="Close">Delete</button> ';
		   }
		   outputhtml += 	'<div class="participant-container hidden">';
		   for (var j = 0; j < data.obj[i].participants.length; j++) {
			   outputhtml += '<div class="card participant"><span class="participant-name">' + data.obj[i].participants[j] + '</span>';
			   if(data.obj[i].owner == localStorage.getItem( 'userId' )) {
				   outputhtml += '<button type="button" class="btn btn-danger btn-sm kickUser" aria-label="Close">Kick</button>';
			   }
			   outputhtml += '</div>';
		   }
		   outputhtml += 	'<button id="add-user-button" type="button" class="btn btn-primary btn-sml btn-block">Add User</button>';
		   outputhtml +=	'</div>';
		   outputhtml += '</div>';
		   $('#conversation-list').append(outputhtml);
	   }
	}

	function loadMessages() {

	}
});
