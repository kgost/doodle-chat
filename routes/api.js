var express 		= require('express'),
	router 			= express.Router(),
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
		if ( Object.keys(user).length === 0 ) {
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
router.post( '/conversations', middleware.authenticate, function( req, res, next ) {
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
//TODO: Create conversation READ route

//UPDATE Conversation
router.put('/conversation/:id', middleware.authenticate, middleware.isConversationOwner, function(req, res, next) {
	Conversation.findOneByIdAndUpdate(req.params.ids, req.body, function(err) {
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
router.delete(' /conversation/:id', middleware.authenticate, middleware.isConversationOwner, function(req, res, next) {
	Conversation.findOneByIdAndDelete(req.params.id, req.body, function(err) {
		if ( err ) {
			return res.status( 500 ).json({
				title: 'An error occured',
				error: err
			});
		}
		
		res.status( 200 ).json({
			message: 'Conversation deleted'
		});
	});
});

//Message Routes

//CREATE message
router.post( '/messages/:conversationId', middleware.authenticate, middleware.inConversation, function( req, res, next ) {
	// save new message
	Message.create( { text: req.body.text, conversation_id: req.params.conversationId }, function( err ) {
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
	Message.find( { conversation_id: req.params.conversationId } ).sort( '-createdAt' ).exec( function( err, messages ) {
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
