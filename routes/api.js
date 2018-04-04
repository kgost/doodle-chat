var express 		= require('express'),
	router 			= express.Router(),
	jwt				= require( 'jsonwebtoken' ),
	Message 		= require( '../models/message' ),
	User			= require( '../models/user' ),
	Image			= require( '../models/image' ),
	Conversation	= require( '../models/conversation' ),
	middleware		= require( '../functions/middleware' );


/**
 * Checks against MongoDB for username uniqueness upon registration
 * @param  {[type]}   username  username sent in req.params
 * @param  {[type]}   req  request object from user to server
 * @param  {[type]}   res  response object to user from server
 * @param  {Function} next next function in express function list
 * @return {[type]}        Returns a status code and corresponding messages.
 */
router.get('/userUniqueness/:username', function(req, res, next) {
	User.findOne( { username: req.params.username}, function( err, user ) {
		if (err) {
			return res.status( 500 ).json({
				title: 'An error occured',
				error: err
			});
		}
		//If the username is not in database, notify that it is available. Otherwise respond that it is taken
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

/**
 * CREATE route for conversations:
 * 		Creates conversation and saves to MongoDB
 * @param  {[type]}   req  request object from user to server
 * @param  {[type]}   res  response object to user from server
 * @param  {Function} next next function in express function list
 * @return {[type]}        Returns a status code and corresponding messages.
 */
router.post( '/conversation', middleware.authenticate, function( req, res, next ) {
	var user = jwt.decode(req.query.token).user;	//Pull user from the JWT
	req.body.participants.push(user.username);		//Add owner to participants list
	//Create the new conversation object
	Conversation.create( req.body, function( err, conversation ) {
		if ( err ) {
			return res.status( 500 ).json({
				title: 'An error occured',
				error: err
			});
		}
		//Successful Creation
		res.status( 201 ).json({
			message: 'Conversation Created',
			obj: conversation
		});
	} );
} );


/**
 * READ route for conversations:
 * 		Finds and returns all conversations that a user is in
 * @param  {[type]}   req  request object from user to server
 * @param  {[type]}   res  response object to user from server
 * @param  {Function} next next function in express function list
 * @return {[type]}        Returns a status code and corresponding messages.
 */
router.get( '/conversations', middleware.authenticate, function( req, res, next ){
	var user = jwt.decode(req.query.token).user;

	//Find all conversations this user is a part of
	Conversation.find({ participants: user.username })
	.select( '_id' )
	.select( 'name' )
	.select('participants')
	.select('owner')
	.exec( function( err, conversations ) {
		if ( err ) {
			return res.status( 500 ).json({
				title: 'An error occured',
				error: err
			});
		}
		//Array of conversations
		var ids = [];
		//Add conversation id and name to the array
		conversations.forEach( function( conversation ) {
			ids.push( { _id: conversation._id, name: conversation.name, participants: conversation.participants, owner: conversation.owner} );
		} );

		return res.status( 200 ).json({
			obj: ids
		});
	});
});



/**
 * UPDATE route for conversations:
 * 		Replaces conversation in MongoDB with new data in req
 * @param  {[type]}   id   id sent in req.params
 * @param  {[type]}   req  request object from user to server
 * @param  {[type]}   res  response object to user from server
 * @param  {Function} next next function in express function list
 * @return {[type]}        Returns a status code and corresponding messages.
 */
router.put('/conversation/:id', middleware.authenticate, middleware.isConversationOwner, function(req, res, next) {
	//Find conversation with same ID and replace with new object
	Conversation.findOneByIdAndUpdate(req.params.id, req.body, function(err) {
		if ( err ) {
			return res.status( 500 ).json({
				title: 'An error occured',
				error: err
			});
		}
		// respond with success message
		res.status( 200 ).json({
			message: 'Update Successful'
		});
	});

});

/**
 * Destroy route for conversations:
 * 		Deletes conversation and all associated messages in MongoDB
 * @param  {[type]}   id   id sent in req.params
 * @param  {[type]}   req  request object from user to server
 * @param  {[type]}   res  response object to user from server
 * @param  {Function} next next function in express function list
 * @return {[type]}        Returns a status code and corresponding message.
 */
router.delete('/conversation/:id', middleware.authenticate, middleware.isConversationOwner, function(req, res, next) {
	//Finds conversation with given id and removes form the database
	Conversation.findByIdAndRemove(req.params.id, req.body, function(err) {
		if ( err ) {
			return res.status( 500 ).json({
				title: 'An error occured',
				error: err
			});
		}
		//Removes all messages that reference the conversation
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

/**
 * CREATE route for messages:
 * 		Creates message and saves to MongoDB
 * @param  {[type]}   conversationId conversationID sent in req.params
 * @param  {[type]}   req  request object from user to server
 * @param  {[type]}   res  response object to user from server
 * @param  {Function} next next function in express function list
 * @return {[type]}        Returns a status code and corresponding message.
 */
router.post( '/messages/:conversationId', middleware.authenticate, middleware.inConversation, function( req, res, next ) {
	var user = jwt.decode(req.query.token).user;
	// Save new message with corresponding conversationId
	// if the message had an image, create that image
	if ( req.body.image ) {
		Image.create( { image: req.body.image }, function( err, image ) {
			if ( err ) {
				return res.status( 500 ).json({
					title: 'An error occured',
					error: err
				});
			}

			// create the message with the image field populated as the image _id
			Message.create( { text: req.body.text, conversation_id: req.params.conversationId, user: user._id, image: image._id }, function( err ) {
				if ( err ) {
					return res.status( 500 ).json({
						title: 'An error occured',
						error: err
					});
				}
				// respond with success message
				res.status( 201 ).json({
					message: 'Reply Successful'
				});
			} );
		} );
	// otherwise just save the message as is
	} else {
		Message.create( { text: req.body.text, conversation_id: req.params.conversationId, user: user._id }, function( err ) {
			if ( err ) {
				return res.status( 500 ).json({
					title: 'An error occured',
					error: err
				});
			}
			// respond with success message
			res.status( 201 ).json({
				message: 'Reply Successful'
			});
		} );
	}
} );


/**
 * READ route for message:
 * 		Finds and returns all messages for a given conversation
 * @param  {[type]}   conversationId conversationID sent in req.params
 * @param  {[type]}   req  request object from user to server
 * @param  {[type]}   res  response object to user from server
 * @param  {Function} next next function in express function list
 * @return {[type]}        Returns a status code along with an object containing the conversation's messages.
 */
router.get( '/messages/:conversationId', middleware.authenticate, middleware.inConversation, function( req, res, next ) {
	//Finds all messages associated with given conversationId
	Message.find( { conversation_id: req.params.conversationId } ).sort( '+createdAt' ).populate('image').exec( function( err, messages ) {
		if ( err ) {
			return res.status( 500 ).json({
				title: 'An error occured',
				error: err
			});
		}
		//Return success code and object with all messages
		res.status( 200 ).json({
			message: 'Reply Successful',
			obj: messages
		});
	});
});

module.exports = router;
