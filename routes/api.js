var express 		= require('express'),
	router 			= express.Router(),
	jwt				= require( 'jsonwebtoken' ),
	Message 		= require( '../models/message' ),
	User			= require( '../models/user' )
	Conversation	= require( '../models/conversation' )
	middleware		= require( '../functions/middleware' );


//username uniqueness
router.get('/userUniqueness/:username', function(req, res, next) {
	User.findOne( { username: req.params.username}, function( err, user ) {
		if (err) {
			return res.status( 500 ).json({
				title: 'An error occured',
				error: err
			});
		}
		if ( !user || Object.keys(user).length === 0 ) {
			return res.status (200 ).json({
				message: 'Username avaliable',
				obj: true
			});
		}
		res.status( 200 ).json( {
			message: 'Username in use',
			obj: false
		});
	});
});

//Conversation Routes

//CREATE Conversation
router.post( '/conversation', middleware.authenticate, function( req, res, next ) {
	var user = jwt.decode(req.query.token).user;
	console.log(req.body.participants);
	req.body.participants.push(user.username);
	Conversation.create( req.body, function( err, conversation ) {
		if ( err ) {
			return res.status( 500 ).json({
				title: 'An error occured',
				error: err
			});
		}

		res.status( 201 ).json({
			message: 'Conversation Created',
			obj: conversation
		});
	} );
} );

//READ Conversation
router.get( '/conversations', middleware.authenticate, function( req, res, next ){
	var user = jwt.decode(req.query.token).user;

	//Finding all conversations this user is a part of
	Conversation.find({ participants: user.username })
	.select( '_id' )
	.select( 'name' )
	.exec( function( err, conversations ) {
		if ( err ) {
			return res.status( 500 ).json({
				title: 'An error occured',
				error: err
			});
		}

		var ids = [];

		conversations.forEach( function( conversation ) {
			ids.push( { _id: conversation._id, name: conversation.name } );
		} );

		return res.status( 200 ).json({
			obj: ids
		});

		//Filling an array with all conversations the user is a part of
		let fullConversations = [];
		conversations.forEach( function( conversation ) {
			//Grabbing most recent message to display for this conversation
			Message.find({ 'conversationId' : conversation._id})
			.sort( '-createdAt' )
			.limit(1)
			.populate({
				path: "author",
				select: "username"
			})
			.exec( function( err, message ) {
				if ( err ) {
					return res.status( 500 ).json({
						title: 'An error occured',
						error: err
					});
				}
				//Once the fullConversations array is full return it
				fullConversations.push( message );
				if( fullConversations.length == conversations.length ) {
					return res.status( 200 ).json({
						conversations: fullConversations
					});
				}
			});
		});
	});
});


//UPDATE Conversation
router.put('/conversation/:id', middleware.authenticate, middleware.isConversationOwner, function(req, res, next) {
	Conversation.findOneByIdAndUpdate(req.params.id, req.body, function(err) {
		if ( err ) {
			return res.status( 500 ).json({
				title: 'An error occured',
				error: err
			});
		}
		return res.send("successfully updated");
	});

});

//DESTROY Conversation
//TODO: Make DESTROY Route

router.delete('/conversation/:id', middleware.authenticate, middleware.isConversationOwner, function(req, res, next) {
	Conversation.findByIdAndRemove(req.params.id, req.body, function(err) {
		if ( err ) {
			return res.status( 500 ).json({
				title: 'An error occured',
				error: err
			});
		}

		Message.remove( { conversation_id: req.params.id }, function( err ) {
			if ( err ) {
				return res.status( 500 ).json({
					title: 'An error occured',
					error: err
				});
			}

			res.status( 200 ).json({
				message: 'Conversation deleted'
			});
		} );
	});
});

//Message Routes

//CREATE message
router.post( '/messages/:conversationId', middleware.authenticate, middleware.inConversation, function( req, res, next ) {
	var user = jwt.decode(req.query.token).user;
	// save new message
	Message.create( { text: req.body.text, conversation_id: req.params.conversationId, user: user._id }, function( err ) {
		if ( err ) {
			return res.status( 500 ).json({
				title: 'An error occured',
				error: err
			});
		}

		res.status( 201 ).json({
			message: 'Reply Successful'
		});
	} );
	// respond with success message
} );

//UPDATE messages
router.get( '/messages/:conversationId', middleware.authenticate, middleware.inConversation, function( req, res, next ) {
	Message.find( { conversation_id: req.params.conversationId } ).sort( '+createdAt' ).exec( function( err, messages ) {
		if ( err ) {
			return res.status( 500 ).json({
				title: 'An error occured',
				error: err
			});
		}

		res.status( 200 ).json({
			message: 'Reply Successful',
			obj: messages
		});
	});
});

module.exports = router;
